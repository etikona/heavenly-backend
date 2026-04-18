import slugify from "slugify";
import Blog from "../models/blogModel.js";
import cloudinary from "../config/cloudinary.js";

// ─── Public ───────────────────────────────────────────────────────────────────

// GET /api/blogs
export const getBlogs = async (req, res) => {
  const { page = 1, limit = 9, tag, category, search } = req.query;

  const filter = { isPublished: true };
  if (tag) filter.tags = tag;
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Blog.countDocuments(filter);

  const blogs = await Blog.find(filter)
    .select(
      "title slug excerpt coverImage tags category author publishedAt views",
    )
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: blogs,
  });
};

// GET /api/blogs/:slug
export const getBlogBySlug = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
  if (!blog)
    return res
      .status(404)
      .json({ success: false, message: "Article not found." });

  // Increment view count
  await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

  res.status(200).json({ success: true, data: blog });
};

// GET /api/blogs/tags  — list all unique tags
export const getAllTags = async (req, res) => {
  const tags = await Blog.distinct("tags", { isPublished: true });
  res.status(200).json({ success: true, data: tags });
};

// ─── Admin ───────────────────────────────────────────────────────────────────

// GET /api/blogs/admin/all
export const getAllBlogsAdmin = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (search)
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Blog.countDocuments(filter);

  const blogs = await Blog.find(filter)
    .select("title slug isPublished tags views publishedAt createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: blogs,
  });
};

// GET /api/blogs/admin/:id
export const getBlogById = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog)
    return res.status(404).json({ success: false, message: "Blog not found." });
  res.status(200).json({ success: true, data: blog });
};

// POST /api/blogs
export const createBlog = async (req, res) => {
  // Ensure unique slug
  let slug = slugify(req.body.title, { lower: true, strict: true });
  const existing = await Blog.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now()}`;
  req.body.slug = slug;

  if (req.file) {
    req.body.coverImage = req.file.path;
    req.body.coverImagePublicId = req.file.filename;
  }

  const blog = await Blog.create(req.body);
  res.status(201).json({ success: true, data: blog });
};

// PUT /api/blogs/:id
export const updateBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog)
    return res.status(404).json({ success: false, message: "Blog not found." });

  if (req.body.title && req.body.title !== blog.title) {
    let slug = slugify(req.body.title, { lower: true, strict: true });
    const existing = await Blog.findOne({ slug, _id: { $ne: blog._id } });
    if (existing) slug = `${slug}-${Date.now()}`;
    req.body.slug = slug;
  }

  if (req.file) {
    // Remove old cover image
    if (blog.coverImagePublicId)
      await cloudinary.uploader.destroy(blog.coverImagePublicId);
    req.body.coverImage = req.file.path;
    req.body.coverImagePublicId = req.file.filename;
  }

  const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updated });
};

// DELETE /api/blogs/:id
export const deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog)
    return res.status(404).json({ success: false, message: "Blog not found." });

  if (blog.coverImagePublicId)
    await cloudinary.uploader.destroy(blog.coverImagePublicId);

  await blog.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Blog deleted successfully." });
};

// export default blogController;
