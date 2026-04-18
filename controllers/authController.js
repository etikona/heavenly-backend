import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const sendTokenResponse = (admin, statusCode, res) => {
  const token = signToken(admin._id);
  res.status(statusCode).json({
    success: true,
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin || !(await admin.comparePassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password." });
  }

  if (!admin.isActive) {
    return res
      .status(403)
      .json({ success: false, message: "Your account has been deactivated." });
  }

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  sendTokenResponse(admin, 200, res);
};

// POST /api/auth/logout
export const logout = (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
};

// POST /api/auth/register  (superadmin only — or use a seed script)
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await Admin.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered." });
  }

  const admin = await Admin.create({ name, email, password, role });
  sendTokenResponse(admin, 201, res);
};

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin._id).select("+password");
  if (!(await admin.comparePassword(currentPassword))) {
    return res
      .status(401)
      .json({ success: false, message: "Current password is incorrect." });
  }

  admin.password = newPassword;
  await admin.save();

  res
    .status(200)
    .json({ success: true, message: "Password changed successfully." });
};
