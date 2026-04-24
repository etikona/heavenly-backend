import mongoose from "mongoose";
import slugify from "slugify";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    content: { type: String, required: true }, // Rich text HTML from TipTap/Editor.js
    excerpt: { type: String, maxlength: 300 },
    coverImage: { type: String },
    coverImagePublicId: { type: String },
    tags: [{ type: String, lowercase: true, trim: true }],
    category: { type: String, trim: true },
    author: { type: String, default: "Admin" },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    ogImage: { type: String },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Auto-generate slug
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// Text index for search
blogSchema.index({ title: "text", content: "text", tags: "text" });

// module.exports = mongoose.model("Blog", blogSchema);

export default mongoose.model("Blog", blogSchema);
