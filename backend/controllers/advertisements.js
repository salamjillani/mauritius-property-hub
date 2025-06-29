const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Advertisement = require('../models/Advertisement');
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinaryUpload');
const fs = require('fs').promises;
const path = require('path');

// @desc    Get all advertisements
// @route   GET /api/advertisements
// @access  Public
exports.getAdvertisements = asyncHandler(async (req, res, next) => {
  const advertisements = await Advertisement.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: advertisements.length,
    data: advertisements,
  });
});

// @desc    Get active advertisements
// @route   GET /api/advertisements/active
// @access  Public
exports.getActiveAdvertisements = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const advertisements = await Advertisement.find({
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: { $exists: false } },
      { endDate: null },
      { endDate: { $gte: now } }
    ]
  }).sort({ createdAt: -1 });

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

  const { title, link, isActive, startDate, endDate } = req.body;
  
  // Validate required fields
  if (!title || !link) {
    return next(new ErrorResponse('Title and link are required', 400));
  }

  let imageUrl = '';

  // Handle image upload
  if (req.files && req.files.image) {
    const imageFile = req.files.image;
    
    // Validate file type
    if (!imageFile.mimetype.startsWith('image/')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Validate file size (10MB limit)
    if (imageFile.size > 10 * 1024 * 1024) {
      return next(new ErrorResponse('Image size cannot exceed 10MB', 400));
    }

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploadImage(imageFile.tempFilePath, 'advertisements');
      imageUrl = result.secure_url || result.url;
      
      // Clean up temp file
      try {
        await fs.unlink(imageFile.tempFilePath);
      } catch (unlinkError) {
        console.warn('Failed to delete temp file:', unlinkError.message);
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return next(new ErrorResponse('Image upload failed. Please try again.', 500));
    }
  } else {
    return next(new ErrorResponse('Please provide an image', 400));
  }

  // Create advertisement data
  const adData = {
    title: title.trim(),
    image: imageUrl,
    link: link.trim(),
    isActive: isActive !== undefined ? Boolean(isActive) : true
  };

  // Add optional dates if provided
  if (startDate) {
    adData.startDate = new Date(startDate);
  }
  if (endDate) {
    adData.endDate = new Date(endDate);
  }

  const advertisement = await Advertisement.create(adData);

  res.status(201).json({ 
    success: true, 
    data: advertisement 
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

  const { title, link, isActive, startDate, endDate } = req.body;
  
  // Prepare update data with existing values as fallback
  let updateData = {
    title: title ? title.trim() : advertisement.title,
    link: link ? link.trim() : advertisement.link,
    isActive: isActive !== undefined ? Boolean(isActive) : advertisement.isActive
  };

  // Handle optional dates
  if (startDate !== undefined) {
    updateData.startDate = startDate ? new Date(startDate) : advertisement.startDate;
  }
  if (endDate !== undefined) {
    updateData.endDate = endDate ? new Date(endDate) : advertisement.endDate;
  }

  // Handle image update
  if (req.files && req.files.image) {
    const imageFile = req.files.image;
    
    // Validate file type
    if (!imageFile.mimetype.startsWith('image/')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Validate file size (10MB limit)
    if (imageFile.size > 10 * 1024 * 1024) {
      return next(new ErrorResponse('Image size cannot exceed 10MB', 400));
    }

    try {
      // Upload new image to Cloudinary
      const result = await cloudinary.uploadImage(imageFile.tempFilePath, 'advertisements');
      updateData.image = result.secure_url || result.url;
      
      // Clean up temp file
      try {
        await fs.unlink(imageFile.tempFilePath);
      } catch (unlinkError) {
        console.warn('Failed to delete temp file:', unlinkError.message);
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return next(new ErrorResponse('Image upload failed. Please try again.', 500));
    }
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

  // Delete the advertisement
  await Advertisement.deleteOne({ _id: id });

  res.status(200).json({ 
    success: true, 
    data: {},
    message: 'Advertisement deleted successfully'
  });
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