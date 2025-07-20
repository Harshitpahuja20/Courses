// lib/authMiddleware.js
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret";

export function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // { id, role, ... }
  } catch (err) {
    throw new Error("Invalid token");
  }
}

export function authorizeRole(decoded, allowedRoles = []) {
  if (!allowedRoles.includes(decoded.role)) {
    throw new Error("Unauthorized");
  }
}

export function authenticatePublic(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (err) {
    return null;
  }
}
