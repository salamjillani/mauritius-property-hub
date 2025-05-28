const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Verification = require('../models/Verification');
const Property = require('../models/Property');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');

// @desc    Submit verification documents
// @route   POST /api/verifications
// @access  Private
exports.submitVerification = asyncHandler(async (req, res, next) => {
  const { propertyId, documents } = req.body;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${propertyId}`, 404));
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to submit verification for this property', 403));
  }

  const verification = await Verification.create({
    user: req.user.id,
    property: propertyId,
    documents,
  });

  res.status(201).json({ success: true, data: verification });
});

// @desc    Get verifications for admin
// @route   GET /api/verifications
// @access  Private/Admin
exports.getVerifications = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access verifications', 403));
  }

  const verifications = await Verification.find()
    .populate('user', 'firstName lastName email')
    .populate('property', 'title');

  res.status(200).json({
    success: true,
    count: verifications.length,
    data: verifications,
  });
});

// @desc    Approve/reject verification
// @route   PUT /api/verifications/:id
// @access  Private/Admin
exports.updateVerification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid verification ID format', 400));
  }

  if (!['approved', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }

  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update verifications', 403));
  }

  const verification = await Verification.findById(id);
  if (!verification) {
    return next(new ErrorResponse(`Verification not found with id of ${id}`, 404));
  }

  verification.status = status;
  await verification.save();

  if (status === 'approved') {
    await Property.findByIdAndUpdate(verification.property, { isVerified: true });
  }

  res.status(200).json({ success: true, data: verification });
});

// @desc    Get Cloudinary signature for verification document upload
// @route   GET /api/verifications/cloudinary-signature
// @access  Private
exports.getCloudinarySignature = asyncHandler(async (req, res, next) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'verification-documents' },
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