import { Job, JobApplicant } from "../models/jobModel.js";
import cloudinary from "../config/cloudinary.js";
import { sendEmail } from "../config/email.js";

// ─── Public ───────────────────────────────────────────────────────────────────

// GET /api/jobs
export const getJobs = async (req, res) => {
  const { department } = req.query;
  const filter = { isActive: true };
  if (department) filter.department = department;

  const jobs = await Job.find(filter)
    .select(
      "title department location type salaryRange deadline vacancies createdAt",
    )
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: jobs.length, data: jobs });
};

// GET /api/jobs/:id
export const getJobById = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, isActive: true });
  if (!job)
    return res.status(404).json({ success: false, message: "Job not found." });
  res.status(200).json({ success: true, data: job });
};

// POST /api/jobs/:id/apply
export const applyForJob = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, isActive: true });
  if (!job)
    return res
      .status(404)
      .json({ success: false, message: "Job not found or no longer active." });

  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "CV/Resume file is required." });

  // Check for duplicate application
  const existing = await JobApplicant.findOne({
    jobId: req.params.id,
    email: req.body.email,
  });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "You have already applied for this position.",
    });
  }

  const applicant = await JobApplicant.create({
    jobId: req.params.id,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    coverLetter: req.body.coverLetter,
    cvUrl: req.file.path,
    cvPublicId: req.file.filename,
  });

  // Notify admin
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Application: ${job.title} — ${applicant.name}`,
    html: `
      <h2>New Job Application</h2>
      <p><strong>Position:</strong> ${job.title}</p>
      <p><strong>Applicant:</strong> ${applicant.name}</p>
      <p><strong>Email:</strong> ${applicant.email}</p>
      <p><strong>Phone:</strong> ${applicant.phone}</p>
      <p><strong>CV:</strong> <a href="${applicant.cvUrl}">Download CV</a></p>
      ${applicant.coverLetter ? `<p><strong>Cover Letter:</strong><br/>${applicant.coverLetter}</p>` : ""}
    `,
  }).catch(console.error);

  // Auto-reply to applicant
  await sendEmail({
    to: applicant.email,
    subject: `Application received — ${job.title}`,
    html: `
      <p>Dear ${applicant.name},</p>
      <p>Thank you for applying for <strong>${job.title}</strong>. We have received your application and will review it shortly.</p>
      <p>Best regards,<br/>HR Team</p>
    `,
  }).catch(console.error);

  res
    .status(201)
    .json({ success: true, message: "Application submitted successfully." });
};

// ─── Admin ────────────────────────────────────────────────────────────────────

// GET /api/jobs/admin/all
export const getAllJobsAdmin = async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: jobs });
};

// POST /api/jobs
export const createJob = async (req, res) => {
  const job = await Job.create(req.body);
  res.status(201).json({ success: true, data: job });
};

// PUT /api/jobs/:id
export const updateJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!job)
    return res.status(404).json({ success: false, message: "Job not found." });
  res.status(200).json({ success: true, data: job });
};

// DELETE /api/jobs/:id
export const deleteJob = async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job)
    return res.status(404).json({ success: false, message: "Job not found." });
  res.status(200).json({ success: true, message: "Job deleted." });
};

// ─── Applicants ───────────────────────────────────────────────────────────────

// GET /api/jobs/:id/applicants
export const getApplicants = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { jobId: req.params.id };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await JobApplicant.countDocuments(filter);
  const applicants = await JobApplicant.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: applicants,
  });
};

// GET /api/jobs/applicants/all  — all applicants across all jobs (admin inbox)
export const getAllApplicants = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await JobApplicant.countDocuments(filter);
  const applicants = await JobApplicant.find(filter)
    .populate("jobId", "title department")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: applicants,
  });
};

// PUT /api/jobs/applicants/:applicantId/status
export const updateApplicantStatus = async (req, res) => {
  const { status, notes } = req.body;
  const applicant = await JobApplicant.findByIdAndUpdate(
    req.params.applicantId,
    { status, notes },
    { new: true },
  );
  if (!applicant)
    return res
      .status(404)
      .json({ success: false, message: "Applicant not found." });
  res.status(200).json({ success: true, data: applicant });
};

// export default jobController;
