// controllers/availability.js
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Availability = require('../models/Availability');
const Property = require('../models/Property');
const mongoose = require('mongoose');

// @desc    Get availability for a property
// @route   GET /api/availability/:propertyId
// @access  Public
exports.getAvailability = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const availability = await Availability.find({ property: propertyId });

  res.status(200).json({
    success: true,
    count: availability.length,
    data: availability,
  });
});

// @desc    Create availability for a property
// @route   POST /api/availability
// @access  Private
exports.createAvailability = asyncHandler(async (req, res, next) => {
  const { propertyId, startDate, endDate, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${propertyId}`, 404));
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this property', 403));
  }

  const availability = await Availability.create({
    property: propertyId,
    startDate,
    endDate,
    status,
  });

  res.status(201).json({ success: true, data: availability });
});