import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "editor"],
      default: "editor", // ← also needs quotes
    },

    isActive: { type: Boolean, default: true },

    lastLogin: { type: Date },
  },
  { timestamps: true },
);

// Hash Password before saving
adminSchema.pre("save", async function (next) {
  if (!this.modified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (CandidatePassword) {
  return bcrypt.compare(CandidatePassword, this.password);
};

export default adminSchema;
