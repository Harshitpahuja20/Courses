// /lib/mongodb.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in your environment");
}

// Cache across hot reloads in dev
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // Optional: tweak settings
    mongoose.set("strictQuery", true);

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,       // you had this behavior; we keep it
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
