const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Location = require('../models/Location');
const mongoose = require('mongoose');

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
exports.getLocations = asyncHandler(async (req, res, next) => {
  const locations = await Location.find();

  res.status(200).json({
    success: true,
    count: locations.length,
    data: locations,
  });
});

// @desc    Create location
// @route   POST /api/locations
// @access  Private/Admin
exports.createLocation = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to create locations', 403));
  }

  const { name, type, country, coordinates } = req.body;

  const location = await Location.create({
    name,
    type,
    country,
    coordinates,
  });

  res.status(201).json({ success: true, data: location });
});

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private/Admin
exports.updateLocation = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to update locations', 403));
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid location ID format', 400));
  }

  const location = await Location.findById(id);
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${id}`, 404));
  }

  const { name, type, country, coordinates } = req.body;
  location.name = name || location.name;
  location.type = type || location.type;
  location.country = country || location.country;
  location.coordinates = coordinates || location.coordinates;
  await location.save();

  res.status(200).json({ success: true, data: location });
});

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
exports.deleteLocation = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to delete locations', 403));
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid location ID format', 400));
  }

  const location = await Location.findById(id);
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${id}`, 404));
  }

  await Location.deleteOne({ _id: id });

  res.status(200).json({ success: true, data: {} });
});