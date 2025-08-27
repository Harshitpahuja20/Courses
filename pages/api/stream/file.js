import jwt from "jsonwebtoken";
import { Readable } from "stream";

function getCookie(req, name) {
  if (req.cookies && req.cookies[name]) return req.cookies[name];
  const raw = req.headers.cookie || "";
  if (!raw) return null;
  const map = Object.fromEntries(
    raw.split(";").map((s) => {
      const i = s.indexOf("=");
      return [s.slice(0, i).trim(), decodeURIComponent(s.slice(i + 1))];
    })
  );
  return map[name] || null;
}

async function fetchDrive(downloadUrl, range, cookie = "") {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  };
  if (range) headers.Range = range;
  if (cookie) headers.Cookie = cookie;

  let resp = await fetch(downloadUrl, { headers, redirect: "manual" });

  // confirm page for large files
  if ((resp.headers.get("content-type") || "").includes("text/html")) {
    const html = await resp.text();
    const confirm = html.match(/confirm=([0-9A-Za-z_]+)/)?.[1];
    const setCookie = resp.headers.get("set-cookie");
    const cookieHeader = setCookie ? setCookie.split(";")[0] : "";

    if (confirm) {
      const u2 = downloadUrl + (downloadUrl.includes("?") ? "&" : "?") + "confirm=" + confirm;
      resp = await fetch(u2, {
        headers: { ...headers, Cookie: cookieHeader },
        redirect: "manual",
      });
      return { resp, cookie: cookieHeader };
    }
    return { resp, cookie: cookieHeader };
  }

  // redirect to usercontent
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
    const vid = getCookie(req, "vid");
    if (!vid) return res.status(401).json({ message: "Unauthorized" });

    let payload;
    try {
      payload = jwt.verify(vid, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid session" });
    }

    const { fid } = payload;
    if (!fid) return res.status(400).json({ message: "Invalid session data" });

    // build public download url (no keys)
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fid}`;

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
      if (v) res.setHeader(h.replace(/(^|-)./g, (m) => m.toUpperCase()), v);
    }
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Disposition", "inline");

    const nodeStream = resp.body?.pipeTo
      ? Readable.fromWeb(resp.body)
      : resp.body;

    nodeStream.on("error", () => {
      if (!res.headersSent) res.status(502);
      res.end();
    });
    nodeStream.pipe(res);
  } catch (err) {
    console.error("stream err", err);
    if (!res.headersSent) res.status(500).json({ message: "Stream failed" });
    else res.end();
  }
}
