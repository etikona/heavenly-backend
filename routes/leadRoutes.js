import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  submitLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeads,
  markAllRead,
} from "../controllers/leadController.js";

// ── Public ──────────────────────────────────────────────────────────────────
const leadRouter = Router();
leadRouter.post("/", submitLead);

// ── Admin ────────────────────────────────────────────────────────────────────
leadRouter.get("/", protect, getLeads);
leadRouter.get("/export", protect, exportLeads);
leadRouter.put("/mark-all-read", protect, markAllRead);
leadRouter.get("/:id", protect, getLeadById);
leadRouter.put("/:id", protect, updateLead);
leadRouter.delete("/:id", protect, deleteLead);

export default leadRouter;
