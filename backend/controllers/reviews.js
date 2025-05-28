const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const Property = require('../models/Property');
const mongoose = require('mongoose');

// @desc    Get reviews for a property
// @route   GET /api/reviews/:propertyId
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const reviews = await Review.find({ property: propertyId })
    .populate('user', 'firstName lastName')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const { propertyId, rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${propertyId}`, 404));
  }

  const existingReview = await Review.findOne({ user: req.user.id, property: propertyId });
  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this property', 400));
  }

  const review = await Review.create({
    user: req.user.id,
    property: propertyId,
    rating,
    comment,
  });

  res.status(201).json({ success: true, data: review });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid review ID format', 400));
  }

  const review = await Review.findById(id);
  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${id}`, 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this review', 403));
  }

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;
  await review.save();

  res.status(200).json({ success: true, data: review });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid review ID format', 400));
  }

  const review = await Review.findById(id);
  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${id}`, 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 403));
  }

  await Review.deleteOne({ _id: id });

  res.status(200).json({ success: true, data: {} });
});