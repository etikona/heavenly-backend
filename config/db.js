import mongoose from "mongoose";
import { DB_URL } from "./env.js";

const connectDB = async () => {
  try {
    if (!DB_URL) {
      throw new Error("❌ DB_URL is missing in environment variables");
    }

    await mongoose.connect(DB_URL);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // stop app if DB fails
  }
};

export default connectDB;
