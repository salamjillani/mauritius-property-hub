const Agency = require('../models/Agency');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');

exports.getAgencies = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let query = Agency.find({ ...JSON.parse(queryStr), approvalStatus: 'approved' });

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
  const total = await Agency.countDocuments({ ...JSON.parse(queryStr), approvalStatus: 'approved' });

  query = query.skip(startIndex).limit(limit);

  query = query.populate([
    { path: 'user', select: 'firstName lastName email' },
    { path: 'agents' },
    { path: 'listingsCount' }
  ]);

  const agencies = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: agencies.length,
    pagination,
    data: agencies
  });
});

exports.getAgency = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findOne({ _id: req.params.id, approvalStatus: 'approved' })
    .populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'agents' },
      { path: 'properties' }
    ]);

  if (!agency) {
    return next(
      new ErrorResponse(`Agency not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: agency });
});

exports.getMyAgency = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findOne({ user: req.user.id })
    .populate('subscription')
    .populate({
      path: 'agents',
      populate: {
        path: 'user',
        select: 'firstName lastName email avatarUrl'
      }
    });

  if (!agency) {
    return next(new ErrorResponse('No agency associated with this user', 404));
  }

  res.status(200).json({ success: true, data: agency });
});

// @desc    Upgrade agency plan
// @route   POST /api/agencies/upgrade-plan
// @access  Private
exports.upgradePlan = asyncHandler(async (req, res, next) => {
  const { plan } = req.body;
  const validPlans = ['basic', 'premium', 'enterprise'];

  if (!validPlans.includes(plan)) {
    return next(new ErrorResponse('Invalid plan type', 400));
  }

  const user = await User.findById(req.user.id).populate('agency');
  if (!user || !user.agency) {
    return next(new ErrorResponse('No agency associated with this user', 404));
  }

  const agency = await Agency.findById(user.agency._id).populate('subscription');
  if (!agency.subscription) {
    return next(new ErrorResponse('No subscription found for this agency', 404));
  }

  agency.subscription.plan = plan;
  agency.subscription.listingLimit = plan === 'basic' ? 10 : plan === 'premium' ? 50 : 100;
  await agency.subscription.save();

  res.status(200).json({ success: true, data: agency });
});

// @desc    Create new agency
// @route   POST /api/agencies
// @access  Private
exports.createAgency = asyncHandler(async (req, res, next) => {
  const existingAgency = await Agency.findOne({ user: req.user.id });

  if (existingAgency) {
    return next(
      new ErrorResponse(`You already have an agency profile`, 400)
    );
  }

  req.body.user = req.user.id;

  const agency = await Agency.create(req.body);

  if (req.user.role !== 'agency') {
    await User.findByIdAndUpdate(req.user.id, { role: 'agency' });
  }

  res.status(201).json({
    success: true,
    data: agency
  });
});

exports.updateAgency = asyncHandler(async (req, res, next) => {
  let agency = await Agency.findById(req.params.id);

  if (!agency) {
    return next(new ErrorResponse(`Agency not found with id of ${req.params.id}`, 404));
  }

  if (agency.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this agency profile`, 401));
  }

  agency = await Agency.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: agency });
});

// @desc    Delete agency
// @route   DELETE /api/agencies/:id
// @access  Private
exports.deleteAgency = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    return next(
      new ErrorResponse(`Agency not found with id of ${req.params.id}`, 404)
    );
  }

  if (
    agency.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this agency profile`,
        401
      )
    );
  }

  await agency.remove();

  res.status(200).json({ success: true, data: {} });
});

exports.getPremiumAgencies = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 4;

  const agencies = await Agency.find({ isPremium: true, approvalStatus: 'approved' })
    .sort('-createdAt')
    .limit(limit)
    .populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'agents' },
      { path: 'listingsCount' }
    ]);

  res.status(200).json({
    success: true,
    count: agencies.length,
    data: agencies
  });
});

exports.uploadAgencyLogo = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    return next(new ErrorResponse(`Agency not found with id of ${req.params.id}`, 404));
  }

  if (agency.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this agency`, 401));
  }

  if (!req.body.cloudinaryUrl) {
    return next(new ErrorResponse(`Please provide a Cloudinary URL`, 400));
  }

  await Agency.findByIdAndUpdate(req.params.id, { logoUrl: req.body.cloudinaryUrl });
  res.status(200).json({ success: true, data: { logoUrl: req.body.cloudinaryUrl } });
});

exports.getApprovedAgencies = asyncHandler(async (req, res, next) => {
  const agencies = await Agency.find({ approvalStatus: 'approved' })
    .select('name logoUrl')
    .sort('name');

  res.status(200).json({ success: true, data: agencies });
});

// @desc    Get Cloudinary signature for agency logo upload
// @route   GET /api/agencies/cloudinary-signature
// @access  Private
exports.getAgencyCloudinarySignature = asyncHandler(async (req, res, next) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: 'agency-logos',
    upload_preset: 'mauritius'
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );

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