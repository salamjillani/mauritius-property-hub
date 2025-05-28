const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Advertisement = require('../models/Advertisement');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');

// @desc    Get all advertisements
// @route   GET /api/advertisements
// @access  Private/Admin
exports.getAdvertisements = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to access advertisements', 403));
  }

  const advertisements = await Advertisement.find();

  res.status(200).json({
    success: true,
    count: advertisements.length,
    data: advertisements,
  });
});

// @desc    Create advertisement
// @route   POST /api/advertisements
// @access  Private/Admin
exports.createAdvertisement = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to create advertisements', 403));
  }

  const { title, imageUrl, publicId, link, status } = req.body;

  const advertisement = await Advertisement.create({
    title,
    imageUrl,
    publicId,
    link,
    status,
  });

  res.status(201).json({ success: true, data: advertisement });
});

// @desc    Update advertisement
// @route   PUT /api/advertisements/:id
// @access  Private/Admin
exports.updateAdvertisement = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to update advertisements', 403));
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid advertisement ID format', 400));
  }

  const advertisement = await Advertisement.findById(id);
  if (!advertisement) {
    return next(new ErrorResponse(`Advertisement not found with id of ${id}`, 404));
  }

  const { title, imageUrl, publicId, link, status } = req.body;
  advertisement.title = title || advertisement.title;
  advertisement.imageUrl = imageUrl || advertisement.imageUrl;
  advertisement.publicId = publicId || advertisement.publicId;
  advertisement.link = link || advertisement.link;
  advertisement.status = status || advertisement.status;
  await advertisement.save();

  res.status(200).json({ success: true, data: advertisement });
});

// @desc    Delete advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private/Admin
exports.deleteAdvertisement = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to delete advertisements', 403));
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid advertisement ID format', 400));
  }

  const advertisement = await Advertisement.findById(id);
  if (!advertisement) {
    return next(new ErrorResponse(`Advertisement not found with id of ${id}`, 404));
  }

  await Advertisement.deleteOne({ _id: id });

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get Cloudinary signature for advertisement upload
// @route   GET /api/advertisements/cloudinary-signature
// @access  Private/Admin
exports.getCloudinarySignature = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to access Cloudinary signature', 403));
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'advertisements' },
    process.env.CLOUDINARY_API_SECRET
  );

  res.status(200).json({
    success: true,
    data: {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    },
  });
});