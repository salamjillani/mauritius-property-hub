const Property = require('../models/Property');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Agent = require('../models/Agent');
const Agency = require('../models/Agency');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = asyncHandler(async (req, res, next) => {
  if (req.query.agent && !mongoose.Types.ObjectId.isValid(req.query.agent)) {
  return next(new ErrorResponse('Invalid agent ID format', 400));
}
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Property.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Property.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate
  query = query.populate([
    { path: 'agent', select: 'user title' },
    { path: 'agency', select: 'name logoUrl' }
  ]);

  // Executing query
  const properties = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: properties.length,
    pagination,
    data: properties
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id)
    .populate([
      { 
        path: 'agent', 
        select: '_id user title isPremium',
        populate: {
          path: 'user',
          select: 'firstName lastName email contactDetails'
        }
      },
      { path: 'agency', select: 'name logoUrl' },
      { path: 'owner', select: 'firstName lastName' }
    ]);

  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  // Ensure agent field exists and has a valid _id before sending
  if (property.agent && !property.agent._id) {
    property.agent = null;
  }

  res.status(200).json({ success: true, data: property });
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
exports.createProperty = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.owner = req.user.id;

  // If user is an agent, set the agent field
  if (req.user.role === 'agent') {
    const agent = await Agent.findOne({ user: req.user.id });
    if (agent) {
      req.body.agent = agent._id;
      // If agent belongs to an agency, set agency field too
      if (agent.agency) {
        req.body.agency = agent.agency;
      }
    }
  }

  // If user is an agency, set the agency field
  if (req.user.role === 'agency') {
    const agency = await Agency.findOne({ user: req.user.id });
    if (agency) {
      req.body.agency = agency._id;
    }
  }

  const property = await Property.create(req.body);

  res.status(201).json({
    success: true,
    data: property
  });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = asyncHandler(async (req, res, next) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is property owner or admin
  if (
    property.owner.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this property`,
        401
      )
    );
  }

  property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: property });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is property owner or admin
  if (
    property.owner.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this property`,
        401
      )
    );
  }

  // Updated to use deleteOne instead of remove()
  await Property.deleteOne({ _id: req.params.id });

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 6;
  
  const properties = await Property.find({ featured: true, status: 'active' })
    .sort({ isPremium: -1, createdAt: -1 })
    .limit(limit)
    .populate([
      { path: 'agent', select: 'user title' },
      { path: 'agency', select: 'name logoUrl' }
    ]);

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties
  });
});

// @desc    Get properties by category
// @route   GET /api/properties/category/:categorySlug
// @access  Public
exports.getPropertiesByCategory = asyncHandler(async (req, res, next) => {
  const { categorySlug } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // Create filter based on category
 const filter = { 
  category: req.params.categorySlug,
  status: 'active'
};

  // Count total properties in this category
  const total = await Property.countDocuments(filter);
  
  // Get properties for this page
  const properties = await Property.find(filter)
    .sort({ isPremium: -1, createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate([
      { path: 'agent', select: 'user title' },
      { path: 'agency', select: 'name logoUrl' }
    ]);

  // Pagination info
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: properties.length,
    pagination,
    total,
    data: properties
  });
});

// @desc    Upload images for property
// @route   POST /api/properties/:id/images
// @access  Private
exports.uploadPropertyImages = asyncHandler(async (req, res, next) => {
  const { cloudinaryUrls } = req.body;
  
  if (!cloudinaryUrls || !Array.isArray(cloudinaryUrls) || cloudinaryUrls.length === 0) {
    return next(new ErrorResponse('Please provide valid image data', 400));
  }

  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is property owner or admin
  if (
    property.owner.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this property`,
        401
      )
    );
  }

  // Format images array for MongoDB
  const images = cloudinaryUrls.map((img, index) => ({
    url: img.url,
    publicId: img.publicId,
    caption: img.caption || `Image ${index + 1}`,
    isMain: index === 0 // First image is main
  }));

  // Update property with new images
  property.images = images;
  await property.save();

  res.status(200).json({
    success: true,
    data: property.images
  });
});

// New function to handle direct Cloudinary upload URLs
// @desc    Get Cloudinary signature for direct uploads
// @route   GET /api/properties/cloudinary-signature
// @access  Private
exports.getCloudinarySignature = asyncHandler(async (req, res, next) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: 'property-images',
    upload_preset: 'mauritius'
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );

  res.status(200).json({
    data: {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    }
  });
});