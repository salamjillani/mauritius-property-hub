const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Agency = require('../models/Agency');
const Promoter = require('../models/Promoter');
const Property = require('../models/Property');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const Log = require('../models/Log');


// @desc    Get all properties for admin
// @route   GET /api/admin/properties
// @access  Private/Admin
exports.getAdminProperties = asyncHandler(async (req, res, next) => {
  const properties = await Property.find()
    .populate('owner', 'email firstName lastName')
    .populate({
      path: 'agent',
      select: 'user title isPremium',
      populate: {
        path: 'user',
        select: 'firstName lastName email',
      },
    })
    .populate('agency', 'name logoUrl');

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

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

  const { firstName, lastName, email, role, phone } = req.body;

  const fieldsToUpdate = {};
  if (firstName) fieldsToUpdate.firstName = firstName;
  if (lastName) fieldsToUpdate.lastName = lastName;
  if (email) fieldsToUpdate.email = email;
  if (role) fieldsToUpdate.role = role;
  if (phone) fieldsToUpdate.phone = phone;

  const user = await User.findByIdAndUpdate(
    id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${id}`, 404));
  }

  await Log.create({
    user: req.user.id,
    action: 'User updated',
    resource: 'User',
    resourceId: id,
    details: `User ${user.email} was updated by admin`,
  });

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

  await Log.create({
    user: req.user.id,
    action: 'User deleted',
    resource: 'User',
    resourceId: id,
    details: `User ${user.email} was deleted by admin`,
  });

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

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }

  const property = await Property.findById(id).populate('owner', 'email firstName lastName');

  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${id}`, 404));
  }

  if (property.status === 'inactive') {
    return next(new ErrorResponse('Cannot change status of inactive property', 403));
  }

  const updatedProperty = await Property.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('owner', 'email firstName lastName');

  await Notification.create({
    user: updatedProperty.owner._id,
    type: `property_${status}`,
    message: `Your property "${updatedProperty.title}" has been ${status}.`,
  });

  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      user: admin._id,
      type: 'property_status_updated',
      message: `Property "${updatedProperty.title}" has been ${status} by ${req.user.email}.`,
    });
  }

  await Log.create({
    user: req.user.id,
    action: `Property ${status}`,
    resource: 'Property',
    resourceId: id,
    details: `Property ${updatedProperty.title} was ${status} by admin`,
  });

  res.status(200).json({ success: true, data: updatedProperty });
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

  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update subscriptions', 403));
  }

  const updates = {};
  if (plan && ['basic', 'premium', 'enterprise'].includes(plan)) {
    updates.plan = plan;
  }
  if (listingLimit !== undefined && !isNaN(listingLimit) && listingLimit >= 0) {
    updates.listingLimit = parseInt(listingLimit);
  }
  if (status && ['active', 'inactive', 'cancelled'].includes(status)) {
    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    return next(new ErrorResponse('No valid updates provided', 400));
  }

  const subscription = await Subscription.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName email');

  if (!subscription) {
    return next(new ErrorResponse(`Subscription not found with id of ${id}`, 404));
  }

  await Notification.create({
    user: subscription.user._id,
    type: 'subscription_updated',
    message: `Your ${subscription.plan} subscription has been updated.`,
  });

  await Log.create({
    user: req.user.id,
    action: 'Subscription updated',
    resource: 'Subscription',
    resourceId: id,
    details: `Subscription for user ${subscription.user.email} updated by admin`,
  });

  res.status(200).json({ success: true, data: subscription });
});

// @desc    Get all subscriptions
// @route   GET /api/admin/subscriptions
// @access  Private/Admin
exports.getSubscriptions = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access subscriptions', 403));
  }

  const subscriptions = await Subscription.find()
    .populate('user', 'firstName lastName email')
    .select('user plan listingLimit listingsUsed status startDate endDate');

  res.status(200).json({
    success: true,
    count: subscriptions.length,
    data: subscriptions,
  });
});

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getLogs = asyncHandler(async (req, res, next) => {
  const logs = await Log.find()
    .populate('user', 'firstName lastName email')
    .sort('-createdAt')
    .limit(50);
  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

// @desc    Notify admins of new property submission
// @route   POST /api/admin/notify-new-property
// @access  Private (Called internally)
exports.notifyNewProperty = asyncHandler(async (property) => {
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      user: admin._id,
      type: 'new_property',
      message: `New property "${property.title}" submitted by ${property.owner.email} awaits approval.`,
    });
  }
});