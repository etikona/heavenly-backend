import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadImage } from "../config/cloudinary.js";
import {
  getGallery,
  getAllGalleryAdmin,
  uploadPhoto,
  addVideo,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGallery,
} from "../controllers/galleryController.js";

const galleryRouter = Router();

// ── Public ──────────────────────────────────────────────────────────────────
galleryRouter.get("/", getGallery);

// ── Admin ────────────────────────────────────────────────────────────────────
galleryRouter.get("/admin/all", protect, getAllGalleryAdmin);
galleryRouter.post("/photo", protect, uploadImage.single("image"), uploadPhoto);
galleryRouter.post("/video", protect, addVideo);
galleryRouter.put("/reorder", protect, reorderGallery);
galleryRouter.put("/:id", protect, updateGalleryItem);
galleryRouter.delete("/:id", protect, deleteGalleryItem);

export default galleryRouter;
