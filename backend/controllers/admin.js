// controllers/admin.js
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Agency = require('../models/Agency');
const Promoter = require('../models/Promoter');
const Property = require('../models/Property');
const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalProperties = await Property.countDocuments();
  const totalSubscriptions = await Subscription.countDocuments();
  const recentActivity = await Property.find()
    .sort('-createdAt')
    .limit(10)
    .populate('owner', 'firstName lastName email');

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProperties,
      totalSubscriptions,
      recentActivity,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('firstName lastName email role createdAt');
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid user ID format', 400));
  }

  const user = await User.findByIdAndUpdate(
    id,
    { ...req.body, role: req.body.role || 'individual' },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${id}`, 404));
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid user ID format', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${id}`, 404));
  }

  await User.deleteOne({ _id: id });
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get all agents
// @route   GET /api/admin/agents
// @access  Private/Admin
exports.getAgents = asyncHandler(async (req, res, next) => {
  const agents = await Agent.find().populate('user', 'firstName lastName email');
  res.status(200).json({
    success: true,
    count: agents.length,
    data: agents,
  });
});

// @desc    Get all agencies
// @route   GET /api/admin/agencies
// @access  Private/Admin
exports.getAgencies = asyncHandler(async (req, res, next) => {
  const agencies = await Agency.find().populate('user', 'firstName lastName email');
  res.status(200).json({
    success: true,
    count: agencies.length,
    data: agencies,
  });
});

// @desc    Get all promoters
// @route   GET /api/admin/promoters
// @access  Private/Admin
exports.getPromoters = asyncHandler(async (req, res, next) => {
  const promoters = await Promoter.find().populate('user', 'firstName lastName email');
  res.status(200).json({
    success: true,
    count: promoters.length,
    data: promoters,
  });
});

// @desc    Get all properties
// @route   GET /api/admin/properties
// @access  Private/Admin
exports.getProperties = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let query = Property.find(JSON.parse(queryStr));

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
  const total = await Property.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit).populate('owner', 'firstName lastName email');

  const properties = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: properties.length,
    pagination,
    data: properties,
  });
});

// @desc    Approve or reject property
// @route   PUT /api/admin/properties/:id/approve
// @access  Private/Admin
exports.approveProperty = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  if (!['approved', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }

  const property = await Property.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${id}`, 404));
  }

  res.status(200).json({ success: true, data: property });
});

// @desc    Update subscription
// @route   PUT /api/admin/subscriptions/:id
// @access  Private/Admin
exports.updateSubscription = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { plan, listingLimit, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid subscription ID format', 400));
  }

  const subscription = await Subscription.findByIdAndUpdate(
    id,
    { plan, listingLimit, status },
    { new: true, runValidators: true }
  );

  if (!subscription) {
    return next(new ErrorResponse(`Subscription not found with id of ${id}`, 404));
  }

  res.status(200).json({ success: true, data: subscription });
});

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getLogs = asyncHandler(async (req, res, next) => {
  // Placeholder: Implement actual logging mechanism
  res.status(200).json({
    success: true,
    data: [],
  });
});