const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private/Admin
exports.getSubscriptions = asyncHandler(async (req, res, next) => {
  const subscriptions = await Subscription.find().populate('user', 'firstName lastName email role');
  res.status(200).json({ success: true, data: subscriptions });
});

// @desc    Get single subscription
// @route   GET /api/subscriptions/:id
// @access  Private/Admin
exports.getSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id).populate('user', 'firstName lastName email role');
  if (!subscription) {
    return next(new ErrorResponse(`Subscription not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: subscription });
});

// @desc    Create subscription
// @route   POST /api/subscriptions
// @access  Private/Admin
exports.createSubscription = asyncHandler(async (req, res, next) => {
  const { userId, plan, listingLimit } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${userId}`, 404));
  }

  const existingSubscription = await Subscription.findOne({ user: userId });
  if (existingSubscription) {
    return next(new ErrorResponse(`User already has a subscription`, 400));
  }

  const subscription = await Subscription.create({
    user: userId,
    plan,
    listingLimit,
    status: 'active',
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  });

  await User.findByIdAndUpdate(userId, { subscription: subscription._id });

  res.status(201).json({ success: true, data: subscription });
});

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private/Admin
exports.updateSubscription = asyncHandler(async (req, res, next) => {
  const { plan, listingLimit, status, paymentStatus } = req.body;

  const subscription = await Subscription.findById(req.params.id);
  if (!subscription) {
    return next(new ErrorResponse(`Subscription not found with id of ${req.params.id}`, 404));
  }

  const updateData = { plan, listingLimit, status, paymentStatus };
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  const updatedSubscription = await Subscription.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: updatedSubscription });
});

// @desc    Feature a property
// @route   POST /api/subscriptions/:id/feature-property
// @access  Private/Admin
exports.featureProperty = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.body;
  const subscription = await Subscription.findById(req.params.id).populate('user');

  if (!subscription) {
    return next(new ErrorResponse(`Subscription not found with id of ${req.params.id}`, 404));
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${propertyId}`, 404));
  }

  if (subscription.user._id.toString() !== property.owner.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to feature this property`, 401));
  }

  const maxFeatured = Math.floor(subscription.listingLimit * 0.25);
  if (subscription.featuredListings.length >= maxFeatured) {
    return next(new ErrorResponse(`Featured listing limit reached (${maxFeatured})`, 400));
  }

  if (subscription.plan !== 'platinum') {
    return next(new ErrorResponse(`Only Platinum users can feature listings`, 403));
  }

  subscription.featuredListings.push(propertyId);
  property.featured = true;
  await Promise.all([subscription.save(), property.save()]);

  res.status(200).json({ success: true, data: subscription });
});