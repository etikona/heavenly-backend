import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadDocument } from "../config/cloudinary.js";
import {
  getJobs,
  getJobById,
  applyForJob,
  getAllJobsAdmin,
  createJob,
  updateJob,
  deleteJob,
  getApplicants,
  getAllApplicants,
  updateApplicantStatus,
} from "../controllers/jobController.js";

// ── Public ──────────────────────────────────────────────────────────────────
const jobRouter = Router();
jobRouter.get("/", getJobs);
jobRouter.get("/:id", getJobById);
jobRouter.post("/:id/apply", uploadDocument.single("cv"), applyForJob);

// ── Admin ────────────────────────────────────────────────────────────────────
jobRouter.get("/admin/all", protect, getAllJobsAdmin);
jobRouter.post("/", protect, createJob);
jobRouter.put("/:id", protect, updateJob);
jobRouter.delete("/:id", protect, deleteJob);

// Applicants
jobRouter.get("/applicants/all", protect, getAllApplicants);
jobRouter.get("/:id/applicants", protect, getApplicants);
jobRouter.put(
  "/applicants/:applicantId/status",
  protect,
  updateApplicantStatus,
);

export default jobRouter;
