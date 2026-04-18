import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadImage, uploadDocument } from "../config/cloudinary.js";
import cloudinary from "../config/cloudinary.js";

// POST /api/upload/image  — general image upload (for rich text editor, etc.)
const uploadRouter = Router();
uploadRouter.post(
  "/image",
  protect,
  uploadImage.single("image"),
  (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    res.status(200).json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename,
    });
  },
);

// POST /api/upload/images  — multiple images at once (up to 10)
uploadRouter.post(
  "/images",
  protect,
  uploadImage.array("images", 10),
  (req, res) => {
    if (!req.files || !req.files.length) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded." });
    }
    const files = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    res.status(200).json({ success: true, files });
  },
);

// POST /api/upload/document  — PDF/Word upload
uploadRouter.post(
  "/document",
  protect,
  uploadDocument.single("document"),
  (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    res.status(200).json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename,
    });
  },
);

// DELETE /api/upload/:publicId  — delete a file from Cloudinary
uploadRouter.delete("/:publicId", protect, async (req, res) => {
  const { resourceType = "image" } = req.query;
  await cloudinary.uploader.destroy(req.params.publicId, {
    resource_type: resourceType,
  });
  res
    .status(200)
    .json({ success: true, message: "File deleted from storage." });
});

export default uploadRouter;
