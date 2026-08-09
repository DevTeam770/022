import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "8h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Copy .env.example to .env and set it.");
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function requireAuth(...allowedRoles) {
  return (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || "").split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
