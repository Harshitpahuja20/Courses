import { authenticate, authorizeRole } from "../../../lib/authMiddleware";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/user";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();

  try {
    const tokenuser = authenticate(req);
    authorizeRole(tokenuser, ["admin"]);

    const users = await User.find({ role: "user" })
      .select("name email role createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
}
