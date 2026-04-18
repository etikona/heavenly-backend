import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["photo", "video"], required: true },
    title: { type: String, trim: true },
    category: { type: String, trim: true }, // e.g. "Office", "Projects", "Events"
    // Photo fields
    imageUrl: { type: String },
    imagePublicId: { type: String },
    // Video fields
    videoUrl: { type: String }, // YouTube embed URL
    thumbnailUrl: { type: String },
    // Ordering
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    projectRef: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // optional link to project
  },
  { timestamps: true },
);

// module.exports = mongoose.model("GalleryItem", galleryItemSchema);

export default mongoose.model("GalleryItem", galleryItemSchema);
