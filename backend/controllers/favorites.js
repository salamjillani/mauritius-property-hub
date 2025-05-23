// controllers/favorites.js
const Favorite = require('../models/Favorite');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');

exports.addFavorite = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const favorite = await Favorite.create({
    user: req.user.id,
    property: propertyId
  });

  res.status(201).json({ success: true, data: favorite });
});

exports.removeFavorite = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  await Favorite.deleteOne({ user: req.user.id, property: propertyId });

  res.status(200).json({ success: true, data: {} });
});

exports.getFavorites = asyncHandler(async (req, res, next) => {
  const favorites = await Favorite.find({ user: req.user.id })
    .populate({
      path: 'property',
      populate: [
        { path: 'agent', select: 'user title' },
        { path: 'agency', select: 'name logoUrl' }
      ]
    });

  res.status(200).json({ success: true, data: favorites });
});