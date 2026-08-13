import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import { readDb, writeDb } from "./db.js";
import { requireAuth, signToken } from "./auth.js";
import {
  getCucmLinesByPattern,
  updateCucmLine,
  getCucmLineDevices,
  getCucmPhone,
  addCucmPhoneSpeedDial,
} from "./census.js";

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

const PORT = process.env.PORT || 3001;
const SALT_ROUNDS = 10;

const app = express();
app.use(cors());
app.use(express.json());

function stripPassword({ password, ...rest }) {
  return rest;
}

// ---- Public reference data ----
app.get("/systems", (req, res) => {
  res.json(readDb().systems || []);
});

app.get("/faultTypes", (req, res) => {
  res.json(readDb().faultTypes || []);
});

// ---- Auth ----
app.post("/auth/login/customer", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "נא למלא את כל השדות" });
  }
  const fullName = email.split("@")[0];
  const token = signToken({ sub: email, role: "customer", email, fullName });
  res.json({ token, user: { email, fullName, role: "customer" } });
});

app.post("/auth/login/technician", async (req, res) => {
  const { personalId, password } = req.body || {};
  if (!personalId || !password) {
    return res.status(400).json({ error: "נא להזין מספר אישי וסיסמה" });
  }
  const db = readDb();
  const match = (db.users || []).find(
    (u) => u.role === "technician" && u.personalId === personalId
  );
  const passwordOk = match && (await bcrypt.compare(password, match.password));
  if (!passwordOk) {
    return res.status(401).json({ error: "מספר אישי או הסיסמה שגויים" });
  }
  const token = signToken({
    sub: match.id,
    role: "technician",
    personalId: match.personalId,
    fullName: match.fullName,
  });
  res.json({ token, user: stripPassword(match) });
});

app.post("/auth/login/admin", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "נא להזין שם משתמש וסיסמה" });
  }
  const db = readDb();
  const match = (db.admins || []).find((a) => a.username === username);
  const passwordOk = match && (await bcrypt.compare(password, match.password));
  if (!passwordOk) {
    return res.status(401).json({ error: "שם המשתמש או הסיסמה שגויים" });
  }
  const token = signToken({ sub: match.id, role: "admin", username: match.username });
  res.json({ token, user: { ...stripPassword(match), role: "admin" } });
});

// ---- Tickets ----
app.get("/tickets", requireAuth(), (req, res) => {
  res.json(readDb().tickets || []);
});

app.post("/tickets", requireAuth(), (req, res) => {
  const db = readDb();
  const ticket = { ...req.body, id: crypto.randomUUID() };
  db.tickets = [...(db.tickets || []), ticket];
  writeDb(db);
  res.status(201).json(ticket);
});

app.patch("/tickets/:id", requireAuth("technician", "admin"), (req, res) => {
  const db = readDb();
  const index = (db.tickets || []).findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "התקלה לא נמצאה" });
  db.tickets[index] = { ...db.tickets[index], ...req.body };
  writeDb(db);
  res.json(db.tickets[index]);
});

// ---- Census / CUCM ----
app.get("/cucm/lines", requireAuth("technician", "admin"), async (req, res) => {
  try {
    const lines = await getCucmLinesByPattern(req.query.pattern);
    res.json(lines);
  } catch (err) {
    res.status(502).json({ error: "לא ניתן היה להתחבר ל-Census", detail: err.message });
  }
});

app.put("/cucm/lines/:pattern", requireAuth("technician", "admin"), async (req, res) => {
  const { alertingName, asciiAlertingName, description, callingSearchSpace, maxNumCalls, busyTrigger } =
    req.body || {};
  if (!alertingName && !asciiAlertingName && !description && !callingSearchSpace && !maxNumCalls && !busyTrigger) {
    return res.status(400).json({ error: "יש לספק לפחות שדה אחד לעדכון" });
  }
  try {
    // The same digits can exist as more than one CUCM line across different
    // route partitions (e.g. a real, device-attached line plus an orphaned
    // one with no partition). Without an explicit partition, CUCM's
    // updateLine silently picks one of them - which can update the wrong
    // line. Resolve to the line that actually has a device on it instead of
    // trusting CUCM's default pick.
    const matches = await getCucmLinesByPattern(req.params.pattern);
    const exactWithDevice = matches.filter((m) => m.pattern === req.params.pattern && m.device);
    const partitions = [...new Set(exactWithDevice.map((m) => m.route_partition))];

    if (partitions.length === 0) {
      return res.status(404).json({ error: "לא נמצא קו עם מכשיר משויך למספר זה ב-CUCM" });
    }
    if (partitions.length > 1) {
      return res.status(409).json({
        error: "נמצאו כמה קווים עם מכשיר משויך למספר זה במחיצות שונות — לא ניתן לעדכן אוטומטית",
        detail: partitions.join(", "),
      });
    }
    if (!partitions[0]) {
      return res.status(422).json({ error: "לקו המשויך למכשיר עבור מספר זה אין Route Partition מוגדר ב-CUCM — לא ניתן לעדכן בבטחה" });
    }

    const result = await updateCucmLine(req.params.pattern, partitions[0], {
      alerting_name: alertingName,
      ascii_alerting_name: asciiAlertingName,
      description,
      calling_search_space: callingSearchSpace,
      max_num_calls: maxNumCalls,
      busy_trigger: busyTrigger,
    });
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: "לא ניתן היה לעדכן את הקו ב-Census", detail: err.message });
  }
});

app.get("/cucm/speeddials", requireAuth("technician", "admin"), async (req, res) => {
  const pattern = req.query.pattern;
  if (!pattern) {
    return res.status(400).json({ error: "יש לספק מספר טלפון" });
  }
  try {
    const deviceNames = await getCucmLineDevices(pattern);
    if (deviceNames.length === 0) {
      return res.json({ pattern, found: false, devices: [] });
    }

    const devices = await Promise.all(
      deviceNames.map(async (device) => {
        try {
          const phone = await getCucmPhone(device);
          const speedDials = toArray(phone?.speeddials?.speeddial).map((sd) => ({
            index: sd.index,
            label: sd.label,
            number: sd.dirn,
          }));
          return { device, speedDials };
        } catch (err) {
          return { device, error: err.message };
        }
      })
    );

    res.json({ pattern, found: true, devices });
  } catch (err) {
    res.status(502).json({ error: "לא ניתן היה להתחבר ל-Census", detail: err.message });
  }
});

app.post("/cucm/phones/:device/speeddials", requireAuth("technician", "admin"), async (req, res) => {
  const { number, label, index } = req.body || {};
  if (!number) {
    return res.status(400).json({ error: "יש לספק מספר עבור הקיצור" });
  }
  try {
    const result = await addCucmPhoneSpeedDial(req.params.device, { number, label, index });
    res.status(201).json(result);
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ error: "כפתור הקיצור שנבחר כבר תפוס במכשיר זה", detail: err.message });
    }
    res.status(502).json({ error: "לא ניתן היה להוסיף את הקיצור ב-Census", detail: err.message });
  }
});

// ---- Name-change requests ----
app.post("/requests", requireAuth(), (req, res) => {
  const db = readDb();
  const request = { ...req.body, id: crypto.randomUUID() };
  db.requests = [...(db.requests || []), request];
  writeDb(db);
  res.status(201).json(request);
});

app.get("/requests", requireAuth("technician", "admin"), (req, res) => {
  res.json(readDb().requests || []);
});

app.patch("/requests/:id", requireAuth("technician", "admin"), (req, res) => {
  const db = readDb();
  const index = (db.requests || []).findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "הבקשה לא נמצאה" });
  db.requests[index] = { ...db.requests[index], ...req.body };
  writeDb(db);
  res.json(db.requests[index]);
});

// ---- Users (admin only) ----
app.get("/users", requireAuth("admin"), (req, res) => {
  res.json((readDb().users || []).map(stripPassword));
});

app.post("/users", requireAuth("admin"), async (req, res) => {
  const { fullName, personalId, password, role } = req.body || {};
  if (!fullName || !personalId || !password || !role) {
    return res.status(400).json({ error: "נא למלא את כל השדות" });
  }
  const db = readDb();
  if ((db.users || []).some((u) => u.personalId === personalId)) {
    return res.status(409).json({ error: "כבר קיים משתמש עם מספר אישי זה" });
  }
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = {
    fullName,
    personalId,
    password: hashed,
    role,
    createdAt: new Date().toISOString(),
    id: crypto.randomUUID(),
  };
  db.users = [...(db.users || []), user];
  writeDb(db);
  res.status(201).json(stripPassword(user));
});

app.patch("/users/:id", requireAuth("admin"), async (req, res) => {
  const db = readDb();
  const index = (db.users || []).findIndex((u) => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "המשתמש לא נמצא" });
  const updates = { ...req.body };
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
  }
  db.users[index] = { ...db.users[index], ...updates };
  writeDb(db);
  res.json(stripPassword(db.users[index]));
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
