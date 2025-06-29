const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Advertisement = require('../models/Advertisement');
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinaryUpload');

// @desc    Get all advertisements
// @route   GET /api/advertisements
// @access  Public
exports.getAdvertisements = asyncHandler(async (req, res, next) => {
  const advertisements = await Advertisement.find();

  res.status(200).json({
    success: true,
    count: advertisements.length,
    data: advertisements,
  });
});

// @desc    Get single advertisement
// @route   GET /api/advertisements/:id
// @access  Public
exports.getAdvertisement = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid advertisement ID format', 400));
  }

  const advertisement = await Advertisement.findById(req.params.id);

  if (!advertisement) {
    return next(new ErrorResponse(`Advertisement not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: advertisement,
  });
});

// @desc    Create advertisement
// @route   POST /api/advertisements
// @access  Private/Admin
exports.createAdvertisement = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to create advertisements', 403));
  }

  const { title, link, isActive, imageUrl } = req.body;
  let finalImageUrl = '';
  
  // Handle different ways image can be provided
  if (req.files?.image) {
    // Image uploaded as file
    try {
      const result = await cloudinary.uploadImage(req.files.image.tempFilePath, 'advertisements');
      finalImageUrl = result.url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return next(new ErrorResponse('Image upload failed', 500));
    }
  } else if (imageUrl) {
    // Image URL provided directly (from frontend Cloudinary upload)
    finalImageUrl = imageUrl;
  } else {
    return next(new ErrorResponse('Please provide an image', 400));
  }

  const ad = await Advertisement.create({
    title,
    image: finalImageUrl, // Make sure this matches the model field name
    link,
    isActive: isActive !== undefined ? isActive : true
  });

  res.status(201).json({ 
    success: true, 
    data: ad 
  });
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

  const { title, link, isActive, imageUrl } = req.body;
  let updateData = {
    title: title || advertisement.title,
    link: link || advertisement.link,
    isActive: isActive !== undefined ? isActive : advertisement.isActive
  };

  // Handle image update
  if (req.files?.image) {
    // New image uploaded as file
    try {
      const result = await cloudinary.uploadImage(req.files.image.tempFilePath, 'advertisements');
      updateData.image = result.url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return next(new ErrorResponse('Image upload failed', 500));
    }
  } else if (imageUrl && imageUrl !== advertisement.image) {
    // New image URL provided
    updateData.image = imageUrl;
  }
  // If no new image provided, keep existing image

  const updatedAdvertisement = await Advertisement.findByIdAndUpdate(
    id, 
    updateData, 
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({ 
    success: true, 
    data: updatedAdvertisement 
  });
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