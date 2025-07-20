// utils/encodegdriveUrl.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.GDRIVE_SECRET;

export function encodegdriveUrl(link: string): string {
  return jwt.sign({ link }, SECRET, { expiresIn: "7d" }); // expires in 7 days
}

export function decodegdriveUrl(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { link: string };
    return decoded.link;
  } catch (e) {
    return null;
  }
}
