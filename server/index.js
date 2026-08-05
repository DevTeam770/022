import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import { readDb, writeDb } from "./db.js";
import { requireAuth, signToken } from "./auth.js";
import { getCucmLinesByPattern } from "./census.js";

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
