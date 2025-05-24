const Promoter = require('../models/Promoter');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const cloudinary = require('../config/cloudinary');

exports.getPromoters = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let query = Promoter.find(JSON.parse(queryStr));

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
  const total = await Promoter.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  query = query.populate('user', 'firstName lastName email');

  const promoters = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: promoters.length,
    pagination,
    data: promoters
  });
});

exports.getPromoter = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('projects');

  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: promoter });
});

exports.createPromoter = asyncHandler(async (req, res, next) => {
  const existingPromoter = await Promoter.findOne({ user: req.user.id });

  if (existingPromoter) {
    return next(new ErrorResponse(`You already have a promoter profile`, 400));
  }

  req.body.user = req.user.id;
  const promoter = await Promoter.create(req.body);

  if (req.user.role !== 'promoter') {
    await User.findByIdAndUpdate(req.user.id, { role: 'promoter' });
  }

  res.status(201).json({ success: true, data: promoter });
});

exports.updatePromoter = asyncHandler(async (req, res, next) => {
  let promoter = await Promoter.findById(req.params.id);

  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id of ${req.params.id}`, 404));
  }

  if (promoter.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this promoter profile`, 401));
  }

  promoter = await Promoter.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: promoter });
});

exports.deletePromoter = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findById(req.params.id);

  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id of ${req.params.id}`, 404));
  }

  if (promoter.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this promoter profile`, 401));
  }

  await promoter.remove();

  res.status(200).json({ success: true, data: {} });
});

exports.uploadPromoterLogo = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findById(req.params.id);

  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id of ${req.params.id}`, 404));
  }

  if (promoter.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this promoter`, 401));
  }

  if (!req.body.cloudinaryUrl) {
    return next(new ErrorResponse(`Please provide a Cloudinary URL`, 400));
  }

  await Promoter.findByIdAndUpdate(req.params.id, { logoUrl: req.body.cloudinaryUrl });

  res.status(200).json({
    success: true,
    data: { logoUrl: req.body.cloudinaryUrl }
  });
});

exports.getPromoterCloudinarySignature = asyncHandler(async (req, res, next) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: 'promoter-logos',
    upload_preset: 'mauritius'
  };

  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

  res.status(200).json({
    success: true,
    data: {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    }
  });
});