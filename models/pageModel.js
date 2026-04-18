import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    pageKey: {
      type: String,
      unique: true,
      required: true,
      enum: ["about", "buyers", "landowners", "home-stats"],
    },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    // content is flexible JSON so each page can have its own structure
    // e.g. buyers page: { guidelines: "...", paymentSteps: [...], bankPartners: [...] }
    // e.g. about page:  { story: "...", vision: "...", mission: "...", team: [...] }
    lastUpdatedBy: { type: String },
  },
  { timestamps: true },
);

// module.exports = mongoose.model("Page", pageSchema);

export default mongoose.model("Page", pageSchema);
