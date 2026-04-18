import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadImage } from "../config/cloudinary.js";
import {
  getBlogs,
  getBlogBySlug,
  getAllTags,
  getAllBlogsAdmin,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

// ── Public ──────────────────────────────────────────────────────────────────

const blogRouter = Router();
blogRouter.get("/", getBlogs);
blogRouter.get("/tags", getAllTags);
blogRouter.get("/slug/:slug", getBlogBySlug);

// ── Admin ────────────────────────────────────────────────────────────────────
blogRouter.get("/admin/all", protect, getAllBlogsAdmin);
blogRouter.get("/admin/:id", protect, getBlogById);
blogRouter.post("/", protect, uploadImage.single("coverImage"), createBlog);
blogRouter.put("/:id", protect, uploadImage.single("coverImage"), updateBlog);
blogRouter.delete("/:id", protect, deleteBlog);

export default blogRouter;
