import slugify from "slugify";
import Project from "../models/projectModel.js";
import cloudinary from "../config/cloudinary.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

export const buildSlug = async (title, excludeId = null) => {
  let base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let counter = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Project.findOne(query);
    if (!exists) break;
    slug = `${base}-${counter++}`;
  }
  return slug;
};

// ─── Public ──────────────────────────────────────────────────────────────────

// GET /api/projects
export const getProjects = async (req, res) => {
  const { category, featured, page = 1, limit = 12, search } = req.query;

  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (featured === "true") filter.isFeatured = true;
  if (search)
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Project.countDocuments(filter);

  const projects = await Project.find(filter)
    .select(
      "title slug category summary location bannerImage isFeatured completionDate createdAt",
    )
    .sort({ isFeatured: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: projects,
  });
};

// GET /api/projects/:slug
export const getProjectBySlug = async (req, res) => {
  const project = await Project.findOne({
    slug: req.params.slug,
    isPublished: true,
  });
  if (!project) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });
  }
  res.status(200).json({ success: true, data: project });
};

// ─── Admin ───────────────────────────────────────────────────────────────────

// GET /api/projects/admin/all
export const getAllProjectsAdmin = async (req, res) => {
  const { category, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (category) filter.category = category;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .select("title slug category isPublished isFeatured location createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: projects,
  });
};

// GET /api/projects/admin/:id
export const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });
  }
  res.status(200).json({ success: true, data: project });
};

// POST /api/projects
export const createProject = async (req, res) => {
  const { title } = req.body;
  req.body.slug = await buildSlug(title);

  const project = await Project.create(req.body);
  res.status(201).json({ success: true, data: project });
};

// PUT /api/projects/:id
export const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });
  }

  if (req.body.title && req.body.title !== project.title) {
    req.body.slug = await buildSlug(req.body.title, project._id);
  }

  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updated });
};

// DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });
  }

  // Remove images from Cloudinary
  const ids = [
    project.bannerImagePublicId,
    project.brochurePublicId,
    ...project.images.map((i) => i.imagePublicId),
    ...project.floorPlans.map((f) => f.imagePublicId),
    ...project.constructionUpdates.map((u) => u.imagePublicId),
  ].filter(Boolean);

  if (ids.length) await cloudinary.api.delete_resources(ids);

  await project.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Project deleted successfully." });
};

// ─── Project Images ──────────────────────────────────────────────────────────

// POST /api/projects/:id/images
export const addProjectImage = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No image file uploaded." });
  }

  const project = await Project.findById(req.params.id);
  if (!project)
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });

  const newImage = {
    imageUrl: req.file.path,
    imagePublicId: req.file.filename,
    caption: req.body.caption || "",
    isFeatured: req.body.isFeatured === "true",
  };

  project.images.push(newImage);
  await project.save();

  res.status(201).json({ success: true, data: project.images });
};

// DELETE /api/projects/:id/images/:imageId
export const deleteProjectImage = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project)
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });

  const image = project.images.id(req.params.imageId);
  if (!image)
    return res
      .status(404)
      .json({ success: false, message: "Image not found." });

  if (image.imagePublicId)
    await cloudinary.uploader.destroy(image.imagePublicId);

  image.deleteOne();
  await project.save();

  res.status(200).json({ success: true, message: "Image removed." });
};

// ─── Construction Updates ─────────────────────────────────────────────────────

// POST /api/projects/:id/updates
export const addConstructionUpdate = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project)
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });

  const update = {
    title: req.body.title,
    description: req.body.description,
    date: req.body.date || new Date(),
    imageUrl: req.file ? req.file.path : undefined,
    imagePublicId: req.file ? req.file.filename : undefined,
  };

  project.constructionUpdates.unshift(update); // newest first
  await project.save();

  res.status(201).json({ success: true, data: project.constructionUpdates });
};

// PUT /api/projects/:id/updates/:updateId
export const editConstructionUpdate = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project)
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });

  const update = project.constructionUpdates.id(req.params.updateId);
  if (!update)
    return res
      .status(404)
      .json({ success: false, message: "Update not found." });

  Object.assign(update, req.body);
  await project.save();

  res.status(200).json({ success: true, data: update });
};

// DELETE /api/projects/:id/updates/:updateId
export const deleteConstructionUpdate = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project)
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });

  const update = project.constructionUpdates.id(req.params.updateId);
  if (!update)
    return res
      .status(404)
      .json({ success: false, message: "Update not found." });

  if (update.imagePublicId)
    await cloudinary.uploader.destroy(update.imagePublicId);

  update.deleteOne();
  await project.save();

  res.status(200).json({ success: true, message: "Update deleted." });
};

// ─── Floor Plans ──────────────────────────────────────────────────────────────

// POST /api/projects/:id/floor-plans
export const addFloorPlan = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No image uploaded." });

  const project = await Project.findById(req.params.id);
  if (!project)
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });

  project.floorPlans.push({
    title: req.body.title,
    area: req.body.area,
    imageUrl: req.file.path,
    imagePublicId: req.file.filename,
  });
  await project.save();

  res.status(201).json({ success: true, data: project.floorPlans });
};

// DELETE /api/projects/:id/floor-plans/:planId
export const deleteFloorPlan = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project)
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });

  const plan = project.floorPlans.id(req.params.planId);
  if (!plan)
    return res
      .status(404)
      .json({ success: false, message: "Floor plan not found." });

  if (plan.imagePublicId) await cloudinary.uploader.destroy(plan.imagePublicId);

  plan.deleteOne();
  await project.save();

  res.status(200).json({ success: true, message: "Floor plan deleted." });
};

// ─── Brochure ─────────────────────────────────────────────────────────────────

// POST /api/projects/:id/brochure
export const uploadBrochure = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded." });

  const project = await Project.findById(req.params.id);
  if (!project)
    return res
      .status(404)
      .json({ success: false, message: "Project not found." });

  // Delete old brochure if exists
  if (project.brochurePublicId) {
    await cloudinary.uploader.destroy(project.brochurePublicId, {
      resource_type: "raw",
    });
  }

  project.brochureUrl = req.file.path;
  project.brochurePublicId = req.file.filename;
  await project.save();

  res.status(200).json({ success: true, brochureUrl: project.brochureUrl });
};

// export default projectController;
