import { Router } from "express";
import {
  login,
  logout,
  getMe,
  register,
  changePassword,
} from "../controllers/authController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", protect, logout);
authRouter.get("/me", protect, getMe);
authRouter.put("/change-password", protect, changePassword);

// Only superadmin can create new admin accounts
authRouter.post("/register", protect, restrictTo("superadmin"), register);

export default authRouter;
