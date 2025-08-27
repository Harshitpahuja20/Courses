// pages/api/subcourse/[courseId].js
import { authenticate, authorizeRole } from "../../../lib/authMiddleware";
import { connectToDatabase } from "../../../lib/mongodb";
import SubCourse from "../../../models/subcourse";
import Course from "../../../models/course";           // keep ONE import (capitalized)
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await connectToDatabase();

  const user = authenticate(req);

  if (req.method === "GET") {
    try {
      authorizeRole(user, ["admin", "user"]);

      const { courseId } = req.query;
      const _id = new mongoose.Types.ObjectId(courseId);

      // Pull only safe data; DO NOT include gdriveUrl/token
      const [courseDoc, subDocs] = await Promise.all([
        Course.findById(_id).lean(),
        SubCourse
          .find({ courseId: _id })
          .select("_id title gdriveUrl index createdAt") // <— safe fields only
          .sort({ index: 1, createdAt: 1 })
          .lean(),
      ]);

      if (!courseDoc) return res.status(404).json({ error: "Course not found" });

      // Return a trimmed course object (safe fields)
      const safeCourse = {
        _id: courseDoc._id,
        title: courseDoc.title,
        description: courseDoc.description ?? "",
      };

      return res.status(200).json({
        course: safeCourse,
        subcourses: subDocs, // already safe (no gdriveUrl/token)
      });
    } catch (err) {
      console.error("GET /subcourse error:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  if (req.method === "POST") {
    try {
      authorizeRole(user, ["admin"]);

      const { courseId } = req.query;
      const { title, gdriveUrl, index } = req.body;

      if (!title || !gdriveUrl) {
        return res.status(400).json({ error: "title and gdriveUrl are required" });
      }

      // Store a signed token server-side; do NOT ever return it to client
      const encodedUrl = jwt.sign({ gdriveUrl }, process.env.GDRIVE_SECRET, {
        expiresIn: "365d",
      });

      // You can keep the field name `gdriveUrl` if schema already uses it,
      // but better rename in the schema to `gdriveToken` (and set select:false).
      const sub = await SubCourse.create({
        title,
        gdriveUrl: encodedUrl, // or gdriveToken: encodedUrl
        courseId: new mongoose.Types.ObjectId(courseId),
        index,
      });

      await Course.findByIdAndUpdate(
        courseId,
        { $inc: { totalSubCourses: 1 } },
        { new: true }
      );

      // Return safe subset only
      return res.status(201).json({
        _id: sub._id,
        title: sub.title,
        index: sub.index ?? null,
      });
    } catch (err) {
      console.error("POST /subcourse error:", err);
      return res.status(400).json({ error: "Invalid data" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
