import GalleryItem from "../models/galleryModel.js";
import cloudinary from "../config/cloudinary.js";

// ─── Public ───────────────────────────────────────────────────────────────────

// GET /api/gallery
export const getGallery = async (req, res) => {
  const { type, category, page = 1, limit = 20 } = req.query;
  const filter = { isPublished: true };
  if (type) filter.type = type;
  if (category) filter.category = category;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await GalleryItem.countDocuments(filter);
  const items = await GalleryItem.find(filter)
    .sort({ sortOrder: 1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Distinct categories for filter UI
  const categories = await GalleryItem.distinct("category", {
    isPublished: true,
  });

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    categories,
    data: items,
  });
};

// ─── Admin ────────────────────────────────────────────────────────────────────

// GET /api/gallery/admin/all
export const getAllGalleryAdmin = async (req, res) => {
  const { type, category } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;

  const items = await GalleryItem.find(filter).sort({
    sortOrder: 1,
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: items });
};

// POST /api/gallery/photo
export const uploadPhoto = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No image uploaded." });

  const item = await GalleryItem.create({
    type: "photo",
    title: req.body.title,
    category: req.body.category,
    imageUrl: req.file.path,
    imagePublicId: req.file.filename,
    sortOrder: req.body.sortOrder || 0,
    isPublished: req.body.isPublished !== "false",
    projectRef: req.body.projectRef || undefined,
  });

  res.status(201).json({ success: true, data: item });
};

// POST /api/gallery/video
export const addVideo = async (req, res) => {
  const { title, category, videoUrl, thumbnailUrl, sortOrder, projectRef } =
    req.body;

  if (!videoUrl)
    return res
      .status(400)
      .json({ success: false, message: "videoUrl is required." });

  const item = await GalleryItem.create({
    type: "video",
    title,
    category,
    videoUrl,
    thumbnailUrl,
    sortOrder: sortOrder || 0,
    isPublished: req.body.isPublished !== false,
    projectRef,
  });

  res.status(201).json({ success: true, data: item });
};

// PUT /api/gallery/:id
export const updateGalleryItem = async (req, res) => {
  const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "Gallery item not found." });
  res.status(200).json({ success: true, data: item });
};

// DELETE /api/gallery/:id
export const deleteGalleryItem = async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "Gallery item not found." });

  if (item.imagePublicId) await cloudinary.uploader.destroy(item.imagePublicId);

  await item.deleteOne();
  res.status(200).json({ success: true, message: "Gallery item deleted." });
};

// PUT /api/gallery/reorder  — bulk update sort order
export const reorderGallery = async (req, res) => {
  // body: [{ id: "...", sortOrder: 0 }, ...]
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res
      .status(400)
      .json({ success: false, message: "items array is required." });
  }

  const ops = items.map(({ id, sortOrder }) => ({
    updateOne: { filter: { _id: id }, update: { sortOrder } },
  }));
  await GalleryItem.bulkWrite(ops);

  res.status(200).json({ success: true, message: "Gallery reordered." });
};

// export default galleryController;
