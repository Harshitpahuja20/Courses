// pages/api/stream/[chapterId].js
import jwt from "jsonwebtoken";
import { connectToDatabase } from "../../../lib/mongodb";
import Subcourse from "../../../models/subcourse";

function getCookie(req, name) {
  // Next.js exposes req.cookies; fallback to header parse
  if (req.cookies && req.cookies[name]) return req.cookies[name];
  const raw = req.headers.cookie || "";
  const map = Object.fromEntries(raw.split(";").map(s => s.trim().split("=")));
  return map[name] || null;
}

// decode the signed gdriveUrl we stored server-side
function decodeGDriveUrl(token) {
  try {
    const payload = jwt.verify(token, process.env.GDRIVE_SECRET);
    return payload?.gdriveUrl || null;
  } catch {
    return null;
  }
}

function extractDriveId(s) {
  if (!s) return null;
  const str = String(s);
  let m = str.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m?.[1]) return m[1];
  m = str.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m?.[1]) return m[1];
  m = str.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m?.[1]) return m[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(str)) return str;
  return null;
}

async function fetchDrive(downloadUrl, range, cookie = "") {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  };
  if (range) headers.Range = range;
  if (cookie) headers.Cookie = cookie;

  // don't auto-follow; we may need to catch confirm/redirects
  let resp = await fetch(downloadUrl, { headers, redirect: "manual" });

  // Look for confirm page (large files)
  if ((resp.headers.get("content-type") || "").includes("text/html")) {
    const html = await resp.text();
    const confirm = html.match(/confirm=([0-9A-Za-z_]+)/)?.[1];
    const setCookie = resp.headers.get("set-cookie");
    const cookieHeader = setCookie ? setCookie.split(";")[0] : "";

    if (confirm) {
      const url2 =
        downloadUrl + (downloadUrl.includes("?") ? "&" : "?") + "confirm=" + confirm;
      resp = await fetch(url2, {
        headers: { ...headers, Cookie: cookieHeader },
        redirect: "manual",
      });
      return { resp, cookie: cookieHeader };
    }
    return { resp, cookie: cookieHeader };
  }

  // Handle redirect to usercontent
  if ([301, 302, 303, 307, 308].includes(resp.status)) {
    const loc = resp.headers.get("location");
    const setCookie = resp.headers.get("set-cookie");
    const cookieHeader = setCookie ? setCookie.split(";")[0] : "";
    if (loc) {
      resp = await fetch(loc, {
        headers: { ...headers, Cookie: cookieHeader, Range: range || undefined },
        redirect: "manual",
      });
      return { resp, cookie: cookieHeader };
    }
  }

  return { resp, cookie: "" };
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    // 1) Require auth cookie (HttpOnly, set by /api/auth/sync-cookie)
    const token = getCookie(req, "auth");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 2) Lookup chapter
    const { chapterId } = req.query;
    await connectToDatabase();
    const sc = await Subcourse.findById(chapterId).select("+gdriveUrl").lean();
    if (!sc) return res.status(404).json({ message: "Chapter not found" });

    // 3) Decode stored (signed) Drive URL server-side
    const realUrl = decodeGDriveUrl(sc.gdriveUrl || sc.gdriveId);
    if (!realUrl) return res.status(500).json({ message: "Video missing" });

    // 4) Build public export URL (no API keys)
    const fileId = extractDriveId(realUrl);
    const downloadUrl = fileId
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : realUrl;

    // 5) Proxy with Range support
    const range = req.headers.range;
    const { resp } = await fetchDrive(downloadUrl, range);

    if (!resp || (!resp.body && resp.status >= 400)) {
      return res.status(502).json({ message: "Upstream error" });
    }

    const status = resp.status === 206 || range ? 206 : 200;
    res.status(status);

    // mirror key headers
    const copy = ["content-type", "content-length", "content-range", "accept-ranges"];
    for (const h of copy) {
      const v = resp.headers.get(h);
      if (v) res.setHeader(h.replace(/(^|-)./g, m => m.toUpperCase()), v);
    }
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Disposition", "inline");

    // stream body (Node 18 Readable.fromWeb fallback)
    const nodeStream = resp.body?.pipeTo
      ? (await import("stream")).Readable.fromWeb(resp.body)
      : resp.body;
    nodeStream.on("error", () => {
      if (!res.headersSent) res.status(502);
      res.end();
    });
    nodeStream.pipe(res);
  } catch (err) {
    console.error("Stream error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Stream failed" });
    else res.end();
  }
}
