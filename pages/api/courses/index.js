import { authenticate, authorizeRole } from "@/lib/authMiddleware";
import { connectToDatabase } from "../../../lib/mongodb";
import Course from "../../../models/course";

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === "POST") {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Missing title or description", success: false });
    }

    try {
      const tokenuser = authenticate(req);
      authorizeRole(tokenuser, ["admin"]);

      const newCourse = await Course.create({ title, description });
      return res.status(201).json({ newCourse, success: true });
    } catch (err) {
      return res.status(500).json({ message: err.message, success: false });
    }
  }

  if (req.method === "GET") {
    try {
      const tokenuser = authenticate(req);
      authorizeRole(tokenuser, ["admin" , "user"]);
      const courses = await Course.find();
      return res.status(200).json({ courses, success: true });
    } catch (err) {
      return res.status(500).json({ message: err.message, success: false });
    }
  }

  res.status(405).end(); // Method Not Allowed
}
