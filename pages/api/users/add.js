import { authenticate, authorizeRole } from "../../../lib/authMiddleware";
import { connectToDatabase } from "../../../lib/mongodb";
import  User  from "../../../models/user";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();

  const { name, email, password,expireAt, role } = req.body;

  if (!name || !email || !password || !expireAt) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const tokenuser = authenticate(req);
    authorizeRole(tokenuser, ["admin"]);
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log({
      name,
      expireAt : new Date(expireAt),
      email,
      password: hashedPassword,
      role: role || "user",
    })
    const user = await User.create({
      name,
      expireAt : new Date(expireAt),
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
