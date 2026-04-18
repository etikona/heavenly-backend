import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    responsibilities: { type: String },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      default: "full-time",
    },
    salaryRange: { type: String }, // e.g. "50,000 - 80,000 BDT"
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    vacancies: { type: Number, default: 1 },
  },
  { timestamps: true },
);

const jobApplicantSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    coverLetter: { type: String },
    cvUrl: { type: String, required: true },
    cvPublicId: { type: String },
    status: {
      type: String,
      enum: ["new", "reviewed", "shortlisted", "rejected", "hired"],
      default: "new",
    },
    notes: { type: String }, // admin notes
  },
  { timestamps: true },
);

export const Job = mongoose.model("Job", jobSchema);
export const JobApplicant = mongoose.model("JobApplicant", jobApplicantSchema);

// module.exports = { Job, JobApplicant };

export default jobSchema;
