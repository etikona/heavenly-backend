import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

const app = express();
dotenv.config();

// Middleware
/**{
    origin: "*" || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  } */
app.use(cors());

// Connect DB FIRST
await connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// ! APP Listening
app.listen(PORT, async () => {
  console.log(`Heavenly API Running on ${PORT}`);
});

export default app;
