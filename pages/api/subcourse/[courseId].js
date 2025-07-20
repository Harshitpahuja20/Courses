import { authenticate, authorizeRole } from "../../../lib/authMiddleware";
import { connectToDatabase } from "../../../lib/mongodb";
import SubCourse from "../../../models/subcourse";
import Course from "../../../models/course";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import course from "../../../models/course";

export default async function handler(req, res) {
  await connectToDatabase();

  const user = authenticate(req);
  if (req.method === "GET") {
    authorizeRole(user, ["admin", "user"]);
    const { courseId } = req.query;
    try {
      const course = await Course.findById(
        new mongoose.Types.ObjectId(courseId)
      );
      const subcourses = await SubCourse.find({
        courseId: new mongoose.Types.ObjectId(courseId),
      });

      return res.status(200).json({ course, subcourses });
    } catch (err) {
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  if (req.method === "POST") {
    authorizeRole(user, ["admin"]);
    const { courseId } = req.query;
    const { title, description, gdriveUrl, index } = req.body;

    try {
      const encodedUrl = jwt.sign({ gdriveUrl }, process.env.GDRIVE_SECRET);

      const sub = await SubCourse.create({
        title,
        description,
        gdriveUrl: encodedUrl,
        courseId: new mongoose.Types.ObjectId(courseId),
        index,
      });

      await course.findByIdAndUpdate(
        courseId,
        { $inc: { totalSubCourses: 1 } },
        { new: true }
      );

      return res.status(201).json(sub);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: "Invalid data" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
