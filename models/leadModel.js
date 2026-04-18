import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["buyer", "landowner", "contact"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    message: { type: String },

    // Buyer-specific
    projectInterest: { type: String }, // project name or slug
    budget: { type: String },
    unitType: { type: String }, // "2 bed", "3 bed", etc.

    // Landowner-specific
    landLocation: { type: String },
    landSize: { type: String },
    landDocumentType: { type: String }, // "mutation", "registered deed", etc.

    // Admin management
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
    },
    notes: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Index for filtering
leadSchema.index({ type: 1, status: 1, createdAt: -1 });

// module.exports = mongoose.model("Lead", leadSchema);
export default mongoose.model("Lead", leadSchema);
