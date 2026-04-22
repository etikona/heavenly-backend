import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/authRoutes.js";
import blogRouter from "./routes/blogRoutes.js";
import galleryRouter from "./routes/galleryRoutes.js";
import jobRouter from "./routes/jobRoutes.js";
import leadRouter from "./routes/leadRoutes.js";
import pageRouter from "./routes/pageRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
// import rateLimit from "express-rate-limit";

const app = express();
dotenv.config();

// Middleware
/**{
    origin: "*" || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  } */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect DB FIRST
await connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// ? Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/gallery", galleryRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/lead", leadRouter);
app.use("/api/v1/page", pageRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/upload", uploadRouter);
// ! APP Listening
app.listen(PORT, async () => {
  console.log(`Heavenly API Running on ${PORT}`);
});

export default app;
