import Page from "../models/pageModel.js";

// GET /api/pages/:pageKey  — public
export const getPage = async (req, res) => {
  const page = await Page.findOne({ pageKey: req.params.pageKey });
  if (!page)
    return res
      .status(404)
      .json({ success: false, message: "Page content not found." });
  res.status(200).json({ success: true, data: page });
};

// PUT /api/pages/:pageKey  — admin: create or update (upsert)
export const upsertPage = async (req, res) => {
  const { pageKey } = req.params;
  const validKeys = ["about", "buyers", "landowners", "home-stats"];

  if (!validKeys.includes(pageKey)) {
    return res.status(400).json({
      success: false,
      message: `Invalid page key. Must be one of: ${validKeys.join(", ")}`,
    });
  }

  const page = await Page.findOneAndUpdate(
    { pageKey },
    { content: req.body.content, lastUpdatedBy: req.admin?.name || "Admin" },
    { new: true, upsert: true, runValidators: true },
  );

  res.status(200).json({ success: true, data: page });
};

// GET /api/pages  — admin: list all pages and their keys
export const getAllPages = async (req, res) => {
  const pages = await Page.find().select("pageKey updatedAt lastUpdatedBy");
  res.status(200).json({ success: true, data: pages });
};

// export default pageController;
