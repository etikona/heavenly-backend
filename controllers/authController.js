import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

// Only used internally at registration time
export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Formats and sends the response with a given token
export const sendTokenResponse = (admin, token, statusCode, res) => {
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

// POST /api/auth/register  (superadmin only — or use a seed script)
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await Admin.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered." });
  }

  // Generate the token BEFORE saving so we can store it
  // We need the _id first, so create without token then update —
  // or insert and then update in one flow:
  const admin = await Admin.create({ name, email, password, role: "admin" });

  const token = signToken(admin._id); // ← generate once at registration
  admin.token = token; // ← persist it on the document
  await admin.save({ validateBeforeSave: false });

  sendTokenResponse(admin, token, 201, res);
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  // Select both password and token since both are select: false
  const admin = await Admin.findOne({ email }).select("+password +token");

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

  if (!admin.token) {
    return res.status(500).json({
      success: false,
      message:
        "No token found for this account. Please contact an administrator.",
    });
  }

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  // Return the token that was generated at registration — not a new one
  sendTokenResponse(admin, admin.token, 200, res);
};

// POST /api/auth/logout
export const logout = (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
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
