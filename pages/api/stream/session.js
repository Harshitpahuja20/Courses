// POST { token: <gdriveUrl JWT> }  -> sets 'vid' HttpOnly cookie (short lived)
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

function extractDriveId(s) {
  if (!s) return null;
  const str = String(s);
  let m = str.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/); if (m?.[1]) return m[1];
  m = str.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);         if (m?.[1]) return m[1];
  m = str.match(/\/d\/([a-zA-Z0-9_-]{10,})/);           if (m?.[1]) return m[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(str)) return str;
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ message: "Missing token" });
    if (!process.env.GDRIVE_SECRET || !process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfigured" });
    }

    // 1) decode your stored gdriveUrl JWT (server knows secret)
    let gdriveUrl;
    try {
      const payload = jwt.verify(token, process.env.GDRIVE_SECRET);
      gdriveUrl = payload?.gdriveUrl;
    } catch {
      return res.status(400).json({ message: "Bad token" });
    }
    const fid = extractDriveId(gdriveUrl);
    if (!fid) return res.status(400).json({ message: "Invalid gdrive url" });

    // 2) mint a SHORT-LIVED session token bound to this file id
    const vid = jwt.sign({ fid, typ: "drive" }, process.env.JWT_SECRET, { expiresIn: "10m" });

    // 3) set HttpOnly cookie so <video> can fetch without headers/query
    setCookie(res, "vid", vid, { maxAge: 60 * 10 });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("session err", e);
    return res.status(500).json({ message: "Session failed" });
  }
}
