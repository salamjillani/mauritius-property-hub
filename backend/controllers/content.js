const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const ContentPage = require('../models/ContentPage');
const mongoose = require('mongoose');

// @desc    Get all content pages
// @route   GET /api/content
// @access  Public
exports.getContentPages = asyncHandler(async (req, res, next) => {
  const pages = await ContentPage.find();

  res.status(200).json({
    success: true,
    count: pages.length,
    data: pages,
  });
});

// @desc    Get single content page by slug
// @route   GET /api/content/:slug
// @access  Public
exports.getContentPage = asyncHandler(async (req, res, next) => {
  const page = await ContentPage.findOne({ slug: req.params.slug });

  if (!page) {
    return next(new ErrorResponse(`Page not found with slug of ${req.params.slug}`, 404));
  }

  res.status(200).json({ success: true, data: page });
});

// @desc    Create content page
// @route   POST /api/content
// @access  Private/Admin
exports.createContentPage = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to create content pages', 403));
  }

  const { slug, title, content, metaDescription } = req.body;

  const existingPage = await ContentPage.findOne({ slug });
  if (existingPage) {
    return next(new ErrorResponse('Page with this slug already exists', 400));
  }

  const page = await ContentPage.create({
    slug,
    title,
    content,
    metaDescription,
  });

  res.status(201).json({ success: true, data: page });
});

// @desc    Update content page
// @route   PUT /api/content/:id
// @access  Private/Admin
exports.updateContentPage = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to update content pages', 403));
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid page ID format', 400));
  }

  const page = await ContentPage.findById(id);
  if (!page) {
    return next(new ErrorResponse(`Page not found with id of ${id}`, 404));
  }

  const { slug, title, content, metaDescription } = req.body;
  page.slug = slug || page.slug;
  page.title = title || page.title;
  page.content = content || page.content;
  page.metaDescription = metaDescription || page.metaDescription;
  await page.save();

  res.status(200).json({ success: true, data: page });
});

// @desc    Delete content page
// @route   DELETE /api/content/:id
// @access  Private/Admin
exports.deleteContentPage = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to delete content pages', 403));
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid page ID format', 400));
  }

  const page = await ContentPage.findById(id);
  if (!page) {
    return next(new ErrorResponse(`Page not found with id of ${id}`, 404));
  }

  await ContentPage.deleteOne({ _id: id });

  res.status(200).json({ success: true, data: {} });
});