import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String }, // icon name or URL
});

const constructionUpdateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const floorPlanSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "2 Bed - Type A"
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String },
  area: { type: String }, // e.g. "1200 sqft"
});

const projectImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String },
  caption: { type: String },
  isFeatured: { type: Boolean, default: false },
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ["ongoing", "upcoming", "completed"],
      required: true,
    },
    description: { type: String, required: true },
    summary: { type: String, maxlength: 300 }, // short summary for cards
    location: { type: String, required: true },
    mapEmbedUrl: { type: String },
    bannerImage: { type: String },
    bannerImagePublicId: { type: String },
    images: [projectImageSchema],
    amenities: [amenitySchema],
    constructionUpdates: [constructionUpdateSchema],
    floorPlans: [floorPlanSchema],
    brochureUrl: { type: String },
    brochurePublicId: { type: String },
    totalUnits: { type: Number },
    totalArea: { type: String }, // e.g. "50,000 sqft"
    completionDate: { type: Date },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true },
);

// Auto-generate slug from title
projectSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    const slugify = require("slugify");
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// module.exports = mongoose.model("Project", projectSchema);

export default mongoose.model("Project", projectSchema);
