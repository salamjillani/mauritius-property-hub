const Advertisement = require('../models/Advertisement');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../config/cloudinary');

// @desc    Create advertisement
// @route   POST /api/ads
// @access  Private
exports.createAd = asyncHandler(async (req, res, next) => {
  const { title, url, imageUrl, status } = req.body;
  
  // Validate input
  if (!title || !url || !imageUrl) {
    return next(new ErrorResponse('Title, URL, and image are required', 400));
  }
  
  const ad = await Advertisement.create({
    title,
    url,
    imageUrl,
    status: status || 'pending',
    user: req.user.id
  });

  res.status(201).json({
    success: true,
    data: ad
  });
});

// @desc    Get all advertisements
// @route   GET /api/ads
// @access  Private (Admin only)
exports.getAds = asyncHandler(async (req, res, next) => {
  const ads = await Advertisement.find().populate('user', 'firstName lastName email');
  
  res.status(200).json({
    success: true,
    count: ads.length,
    data: ads
  });
});

// @desc    Get single advertisement
// @route   GET /api/ads/:id
// @access  Private
exports.getAd = asyncHandler(async (req, res, next) => {
  const ad = await Advertisement.findById(req.params.id).populate('user', 'firstName lastName email');
  
  if (!ad) {
    return next(new ErrorResponse('Advertisement not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: ad
  });
});

// @desc    Update advertisement status
// @route   PUT /api/ads/:id
// @access  Private (Admin only)
exports.updateAdStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Invalid status value', 400));
  }
  
  const ad = await Advertisement.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  
  if (!ad) {
    return next(new ErrorResponse('Advertisement not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: ad
  });
});

// @desc    Delete advertisement
// @route   DELETE /api/ads/:id
// @access  Private (Admin only or owner)
exports.deleteAd = asyncHandler(async (req, res, next) => {
  const ad = await Advertisement.findById(req.params.id);
  
  if (!ad) {
    return next(new ErrorResponse('Advertisement not found', 404));
  }
  
  // Check if user is admin or owner of the advertisement
  if (req.user.role !== 'admin' && ad.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this advertisement', 403));
  }
  
  // Optional: Delete image from Cloudinary
  if (ad.imageUrl) {
    try {
      // Extract public_id from Cloudinary URL
      const publicId = ad.imageUrl.split('/').pop().split('.')[0];
      const folderPath = `advertisements/${publicId}`;
      
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(folderPath);
      console.log(`Image deleted from Cloudinary: ${folderPath}`);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      // Continue with deletion even if Cloudinary deletion fails
    }
  }
  
  // Delete the advertisement
  await Advertisement.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Advertisement deleted successfully'
  });
});

// @desc    Get active advertisement (for public display)
// @route   GET /api/ads/active
// @access  Public
exports.getActiveAd = asyncHandler(async (req, res, next) => {
  const ad = await Advertisement.findOne({ status: 'approved' })
    .sort({ createdAt: -1 });
  
  if (!ad) {
    return res.status(200).json({
      success: true,
      data: null
    });
  }
  
  res.status(200).json({
    success: true,
    data: ad
  });
});

// @desc    Get Cloudinary signature for upload
// @route   GET /api/ads/upload-signature
// @access  Private
exports.getCloudinarySignature = asyncHandler(async (req, res, next) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'advertisements';
    const upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET || 'mauritius';
    
    // Create parameters for signature
    const params = {
      folder,
      timestamp,
      upload_preset
    };
    
    console.log('Generating signature with params:', params);
    
    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    console.log('Generated signature for advertisement upload:', {
      timestamp,
      folder,
      upload_preset,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });

    res.status(200).json({
      success: true,
      data: {
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
        upload_preset
      }
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return next(new ErrorResponse('Failed to generate upload signature', 500));
  }
});