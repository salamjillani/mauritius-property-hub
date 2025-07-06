const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Promoter = require('../models/Promoter');
const Property = require('../models/Property');
const AuditLog = require('../models/Log');
const cloudinary = require('../config/cloudinary');

exports.getMyPromoterProfile = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findOne({ user: req.user.id })
   .populate({
      path: 'user',
      select: 'firstName lastName email phone'
    });
  
  if (!promoter) {
    // Return empty promoter object instead of error
    return res.status(200).json({ 
      success: true, 
        data: {
          _id: null,
          name: "",
          logoUrl: "",
          description: "",
          establishedYear: null,
          website: "",
          facebook: "",
          twitter: "",
          linkedin: "",
          approvalStatus: "pending",
          isPremium: false,
          createdAt: new Date(),
          user: req.user.id
        }
    });
  }

  res.status(200).json({ success: true, data: promoter });
});

exports.getPromoterCloudinarySignature = asyncHandler(async (req, res, next) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: 'promoter-logos',
    upload_preset: 'mauritius'
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );

  res.status(200).json({
    success: true,
    data: {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    }
  });
});

exports.updateMyPromoterProfile = asyncHandler(async (req, res, next) => {
  let promoter = await Promoter.findOne({ user: req.user.id });

  if (!promoter) {
    // Create new promoter profile if not found
    promoter = await Promoter.create({ 
      ...req.body,
      user: req.user.id,
      name: req.user.firstName + ' ' + req.user.lastName
    });
    
    return res.status(201).json({ success: true, data: promoter });
  }

  promoter = await Promoter.findByIdAndUpdate(promoter._id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: promoter });
});

// Get all promoters
// controllers/promoters.js
exports.getPromoters = asyncHandler(async (req, res, next) => {
  const { name, approvalStatus } = req.query;
  const query = {};
  if (name) query.name = { $regex: name, $options: 'i' };
  if (approvalStatus) query.approvalStatus = approvalStatus; // Fixed field name

   const promoters = await Promoter.find(query)
    .populate({
      path: 'user',
      select: 'email phone'
    });
  res.status(200).json({ success: true, count: promoters.length, data: promoters });
});

// Get single promoter
exports.getPromoter = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'email phone'
    });
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: promoter });
});

// Create promoter
exports.createPromoter = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.create(req.body);

  await AuditLog.create({
    user: req.user.id,
    action: 'create_promoter',
    resourceId: promoter._id,
    resourceType: 'Promoter',
  });

  res.status(201).json({ success: true, data: promoter });
});

exports.updatePromoter = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: promoter });
});

// Delete promoter
exports.deletePromoter = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findById(req.params.id);
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id ${req.params.id}`, 404));
  }

  // Check for associated properties
  const properties = await Property.find({ promoter: req.params.id });
  if (properties.length > 0) {
    return next(
      new ErrorResponse(
        'Cannot delete promoter with associated properties',
        400
      )
    );
  }

  await promoter.deleteOne();

  await AuditLog.create({
    user: req.user.id,
    action: 'delete_promoter',
    resourceId: req.params.id,
    resourceType: 'Promoter',
  });

  res.status(200).json({ success: true, data: {} });
});

// Get promoter projects/properties
exports.getPromoterProjects = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findById(req.params.id);
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id ${req.params.id}`, 404));
  }

  const properties = await Property.find({ promoter: req.params.id }).select(
    'title price properties status'
  );
  res.status(200).json({ success: true, count: properties.length, data: properties });
});