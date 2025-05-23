const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Project = require('../models/Project');
const mongoose = require('mongoose');

exports.getProjects = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  let query = Project.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Project.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  query = query.populate('promoter', 'firstName lastName email');

  const projects = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: projects.length,
    pagination,
    data: projects
  });
});

exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id).populate('promoter', 'firstName lastName email');
  if (!project) {
    return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: project });
});

exports.createProject = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'promoter' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to create projects', 403));
  }
  req.body.promoter = req.user.id;
  const project = await Project.create(req.body);
  res.status(201).json({ success: true, data: project });
});

exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);
  if (!project) {
    return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
  }
  if (project.promoter.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this project`, 401));
  }
  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ success: true, data: project });
});

exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
  }
  if (project.promoter.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete this project`, 401));
  }
  await Project.deleteOne({ _id: req.params.id });
  res.status(200).json({ success: true, data: {} });
});

exports.uploadProjectImages = asyncHandler(async (req, res, next) => {
  const { cloudinaryUrls } = req.body;
  if (!cloudinaryUrls || !Array.isArray(cloudinaryUrls) || cloudinaryUrls.length === 0) {
    return next(new ErrorResponse('Please provide valid image data', 400));
  }
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
  }
  if (project.promoter.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this project`, 401));
  }
  const images = cloudinaryUrls.map((img, index) => ({
    url: img.url,
    publicId: img.publicId,
    caption: img.caption || `Image ${index + 1}`,
    isMain: index === 0
  }));
  project.images = images;
  await project.save();
  res.status(200).json({ success: true, data: project.images });
});

exports.getCloudinarySignature = asyncHandler(async (req, res, next) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: 'project-images',
    upload_preset: 'mauritius'
  };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  res.status(200).json({
    data: {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    }
  });
});