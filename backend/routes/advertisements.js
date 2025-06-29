const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Advertisement = require('../models/Advertisement');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res, next) => {
  const ads = await Advertisement.find();
  res.status(200).json({ success: true, count: ads.length, data: ads });
}));

router.get('/active', asyncHandler(async (req, res, next) => {
  const now = new Date();
  const ads = await Advertisement.find({
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: { $exists: false } },
      { endDate: null },
      { endDate: { $gte: now } }
    ]
  });
  res.status(200).json({ success: true, count: ads.length, data: ads });
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  const ad = await Advertisement.findById(req.params.id);
  if (!ad) {
    return next(new ErrorResponse(`Advertisement not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: ad });
}));

router.post('/', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const ad = await Advertisement.create(req.body);
  res.status(201).json({ success: true, data: ad });
}));

router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let ad = await Advertisement.findById(req.params.id);
  if (!ad) {
    return next(new ErrorResponse(`Advertisement not found with id of ${req.params.id}`, 404));
  }
  ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ success: true, data: ad });
}));

router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const ad = await Advertisement.findById(req.params.id);
  if (!ad) {
    return next(new ErrorResponse(`Advertisement not found with id of ${req.params.id}`, 404));
  }
  await ad.deleteOne();
  res.status(200).json({ success: true, data: {} });
}));

module.exports = router;