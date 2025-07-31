// pages/api/auth/user-login.js
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  await connectToDatabase();

  const user = await User.findOne({ email, role: "user" });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const now = new Date();
  const expiry = new Date(user.expireAt);

  if (expiry && now > expiry) {
    return res
      .status(403)
      .json({ message: "Account expired!", code: "ACCOUNT_EXPIRED" });
  }

  const token = jwt.sign(
    { userId: user._id, role: "user" },
    process.env.JWT_SECRET
  );

  return res.status(200).json({ token });
}
