import Lead from "../models/leadModel.js";
import { sendLeadNotification, sendLeadAutoReply } from "../config/email.js";

// ─── Public ───────────────────────────────────────────────────────────────────

// POST /api/leads
export const submitLead = async (req, res) => {
  const lead = await Lead.create(req.body);

  // Fire emails without blocking the response
  sendLeadNotification(lead).catch(console.error);
  sendLeadAutoReply(lead).catch(console.error);

  res.status(201).json({
    success: true,
    message: "Your inquiry has been received. We will contact you shortly.",
  });
};

// ─── Admin ────────────────────────────────────────────────────────────────────

// GET /api/leads
export const getLeads = async (req, res) => {
  const {
    type,
    status,
    isRead,
    page = 1,
    limit = 20,
    search,
    from,
    to,
  } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (isRead !== undefined) filter.isRead = isRead === "true";
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Lead.countDocuments(filter);
  const leads = await Lead.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Summary counts
  const unreadCount = await Lead.countDocuments({ isRead: false });

  res.status(200).json({
    success: true,
    total,
    unreadCount,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: leads,
  });
};

// GET /api/leads/:id
export const getLeadById = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead)
    return res.status(404).json({ success: false, message: "Lead not found." });

  // Auto-mark as read
  if (!lead.isRead) {
    lead.isRead = true;
    await lead.save();
  }

  res.status(200).json({ success: true, data: lead });
};

// PUT /api/leads/:id
export const updateLead = async (req, res) => {
  const allowed = ["status", "notes", "isRead"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const lead = await Lead.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });
  if (!lead)
    return res.status(404).json({ success: false, message: "Lead not found." });

  res.status(200).json({ success: true, data: lead });
};

// DELETE /api/leads/:id
export const deleteLead = async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead)
    return res.status(404).json({ success: false, message: "Lead not found." });
  res.status(200).json({ success: true, message: "Lead deleted." });
};

// GET /api/leads/export  — export filtered leads as CSV
export const exportLeads = async (req, res) => {
  const { type, status, from, to } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const leads = await Lead.find(filter).sort({ createdAt: -1 });

  const headers = [
    "ID",
    "Type",
    "Name",
    "Email",
    "Phone",
    "Message",
    "Project Interest",
    "Budget",
    "Land Location",
    "Land Size",
    "Status",
    "Is Read",
    "Created At",
  ];

  const rows = leads.map((l) => [
    l._id,
    l.type,
    l.name,
    l.email,
    l.phone || "",
    (l.message || "").replace(/,/g, ";").replace(/\n/g, " "),
    l.projectInterest || "",
    l.budget || "",
    l.landLocation || "",
    l.landSize || "",
    l.status,
    l.isRead,
    l.createdAt.toISOString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="leads-${Date.now()}.csv"`,
  );
  res.status(200).send(csv);
};

// PUT /api/leads/mark-all-read
export const markAllRead = async (req, res) => {
  await Lead.updateMany({ isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: "All leads marked as read." });
};

// export default leadController;
