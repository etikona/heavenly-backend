import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadImage, uploadDocument } from "../config/cloudinary.js";
import {
  getProjects,
  getProjectBySlug,
  getAllProjectsAdmin,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectImage,
  deleteProjectImage,
  addConstructionUpdate,
  editConstructionUpdate,
  deleteConstructionUpdate,
  addFloorPlan,
  deleteFloorPlan,
  uploadBrochure,
} from "../controllers/projectController.js";

// ── Public routes ──────────────────────────────────────────────────────────
const projectRouter = Router();
projectRouter.get("/", getProjects);
projectRouter.get("/slug/:slug", getProjectBySlug);
projectRouter.get("/:id", getProjectById);

// ── Admin routes ───────────────────────────────────────────────────────────
projectRouter.get("/admin/all", protect, getAllProjectsAdmin);
projectRouter.get("/:id", protect, getProjectById);
projectRouter.post("/", protect, createProject);
projectRouter.put("/:id", protect, updateProject);
projectRouter.delete("/:id", protect, deleteProject);

// Project images
projectRouter.post(
  "/:id/images",
  protect,
  uploadImage.single("image"),
  addProjectImage,
);
projectRouter.delete("/:id/images/:imageId", protect, deleteProjectImage);

// Construction updates
projectRouter.post(
  "/:id/updates",
  protect,
  uploadImage.single("image"),
  addConstructionUpdate,
);
projectRouter.put("/:id/updates/:updateId", protect, editConstructionUpdate);
projectRouter.delete(
  "/:id/updates/:updateId",
  protect,
  deleteConstructionUpdate,
);

// Floor plans
projectRouter.post(
  "/:id/floor-plans",
  protect,
  uploadImage.single("image"),
  addFloorPlan,
);
projectRouter.delete("/:id/floor-plans/:planId", protect, deleteFloorPlan);

// Brochure
projectRouter.post(
  "/:id/brochure",
  protect,
  uploadDocument.single("brochure"),
  uploadBrochure,
);

export default projectRouter;
