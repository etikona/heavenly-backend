import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getPage,
  upsertPage,
  getAllPages,
} from "../controllers/pageController.js";

// ── Public ──────────────────────────────────────────────────────────────────
const pageRouter = Router();
pageRouter.get("/:pageKey", getPage);

// ── Admin ────────────────────────────────────────────────────────────────────
pageRouter.get("/", protect, getAllPages);
pageRouter.put("/:pageKey", protect, upsertPage);

export default pageRouter;
