// pages/api/auth/sync-cookie.js
import jwt from "jsonwebtoken";

function setCookie(res, name, value, { maxAge } = {}) {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isProd ? "Secure" : "",
    typeof maxAge === "number" ? `Max-Age=${maxAge}` : "",
  ].filter(Boolean);
  res.setHeader("Set-Cookie", parts.join("; "));
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    // read token from Authorization header or body
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : req.body?.token;
    if (!token) return res.status(400).json({ message: "Missing token" });

    try {
      jwt.verify(token, process.env.JWT_SECRET); // only to ensure it's valid
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 7 days cookie
    setCookie(res, "auth", token, { maxAge: 60 * 60 * 24 * 7 });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    // clear cookie
    setCookie(res, "auth", "", { maxAge: 0 });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
