// pages/api/user/subcourses/[id].ts
import { connectToDatabase } from "../../../../lib/mongodb";
import { authenticate, authorizeRole } from "../../../../lib/authMiddleware";
import SubCourse from "../../../../models/subcourse";
import jwt from "jsonwebtoken";

const GDRIVE_SECRET = process.env.GDRIVE_SECRET;

export default async function handler(req, res) {
  await connectToDatabase();

  const { id } = req.query;

  try {
    const tokenuser = authenticate(req);
    authorizeRole(tokenuser, ["user"]);
    const subCourse = await SubCourse.findById(id);
    if (!subCourse) {
      return res.status(404).json({ message: "Sub-course not found" });
    }

    const decoded = jwt.verify(subCourse.gdriveUrl, GDRIVE_SECRET);
    const gdriveUrl = decoded.url;

    // Option 1: Redirect user to the link (temporary signed URL)
    return res.redirect(gdriveUrl);

    // Option 2: Send back decoded data (less secure)
    // res.status(200).json({ ...subCourse.toObject(), gdriveUrl });
  } catch (err) {
    return res.status(400).json({ error: "Invalid or expired link" });
  }
}
