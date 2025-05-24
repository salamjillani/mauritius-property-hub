const Property = require('../models/Property');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Agent = require('../models/Agent');
const Agency = require('../models/Agency');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Property.find(JSON.parse(queryStr)).setOptions({ isAuthenticated: !!req.user });

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort (prioritize premium properties)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort({ isPremium: -1, createdAt: -1 });
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
    {
      path: 'agent',
      select: 'user title isPremium',
      populate: {
        path: 'user',
        select: req.user ? 'firstName lastName email contactDetails' : 'firstName lastName'
      }
    },
    { path: 'agency', select: 'name logoUrl' }
  ]);

  // Executing query
  const properties = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
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
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid property ID format`, 400));
  }

  const query = Property.findById(req.params.id).setOptions({ isAuthenticated: !!req.user });
  const property = await query.populate([
    {
      path: 'agent',
      select: '_id user title isPremium',
      populate: {
        path: 'user',
        select: req.user ? 'firstName lastName email contactDetails avatarUrl' : 'firstName lastName'
      }
    },
    {
      path: 'agency',
      select: 'name logoUrl',
      populate: {
        path: 'agents',
        select: '_id user title isPremium approvalStatus',
        populate: {
          path: 'user',
          select: req.user ? 'firstName lastName email contactDetails avatarUrl' : 'firstName lastName'
        }
      }
    },
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

  // Validate user role
  if (!['agent', 'agency', 'promoter', 'admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Invalid user role for creating property', 403));
  }

  if (req.user.role === 'agent') {
    const agent = await Agent.findOne({ user: req.user.id });
    if (!agent) {
      return next(new ErrorResponse('Agent profile not found for this user', 400));
    }
    req.body.agent = agent._id;
    if (agent.agency) {
      req.body.agency = agent.agency;
    }
  }

  // If user is an agency, set the agency field and assign a linked agent
  if (req.user.role === 'agency') {
    const agency = await Agency.findOne({ user: req.user.id }).populate('agents');
    if (!agency) {
      return next(new ErrorResponse('Agency profile not found for this user', 400));
    }
    req.body.agency = agency._id;
    // If no agent is specified, assign the first approved agent from the agency
    if (!req.body.agent && agency.agents && agency.agents.length > 0) {
      const approvedAgent = agency.agents.find(agent => agent.approvalStatus === 'approved');
      if (approvedAgent) {
        req.body.agent = approvedAgent._id;
      }
    }
  }

  // If user is a promoter, set the agent field if they have an agent profile
  if (req.user.role === 'promoter') {
    const agent = await Agent.findOne({ user: req.user.id });
    if (agent) {
      req.body.agent = agent._id;
      if (agent.agency) {
        req.body.agency = agent.agency;
      }
    }
  }

  // Set contact details if provided
  if (req.user.role === 'agent' && req.user.contactDetails) {
    req.body.contactDetails = {
      phone: req.user.contactDetails.phone,
      email: req.user.contactDetails.email,
      isRestricted: true
    };
  }

  const property = await Property.create(req.body);

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid property ID format`, 400));
  }

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

  // Update contact details if provided
  if (req.body.contactDetails && req.user.role === 'agent') {
    req.body.contactDetails.isRestricted = true;
  }

  property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: property });
});

// @desc    Search properties and count results
// @route   GET /api/properties/search
// @access  Public
exports.searchProperties = asyncHandler(async (req, res, next) => {
  const { category, q, type, maxPrice } = req.query;

  // Build search query
  const filter = {};

  // Always filter by active status
  filter.status = 'active';

  // Filter by category if provided
  if (category) {
    filter.category = category;
  }

  // Filter by property type if provided and not 'all'
  if (type && type !== 'all') {
    filter.type = type.charAt(0).toUpperCase() + type.slice(1);
  }

  // Filter by maximum price if provided
  if (maxPrice && !isNaN(maxPrice)) {
    filter.price = { $lte: parseInt(maxPrice) };
  }

  // Add text search if search term provided
  if (q) {
    filter.$text = { $search: q };
  }

  // Count matching properties
  const count = await Property.countDocuments(filter);

  res.status(200).json({
    success: true,
    count,
    searchParams: {
      category,
      q,
      type,
      maxPrice
    }
  });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid property ID format`, 400));
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
        `User ${req.user.id} is not authorized to delete this property`,
        401
      )
    );
  }

  // Delete associated images from Cloudinary
  if (property.images && property.images.length > 0) {
    for (const image of property.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }
  }

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
    .setOptions({ isAuthenticated: !!req.user })
    .populate([
      {
        path: 'agent',
        select: 'user title isPremium',
        populate: {
          path: 'user',
          select: req.user ? 'firstName lastName email contactDetails' : 'firstName lastName'
        }
      },
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
    category: categorySlug,
    status: 'active'
  };

  // Count total properties in this category
  const total = await Property.countDocuments(filter);

  // Get properties for this page
  const properties = await Property.find(filter)
    .sort({ isPremium: -1, createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .setOptions({ isAuthenticated: !!req.user })
    .populate([
      {
        path: 'agent',
        select: 'user title isPremium',
        populate: {
          path: 'user',
          select: req.user ? 'firstName lastName email contactDetails' : 'firstName lastName'
        }
      },
      { path: 'agency', select: 'name logoUrl' }
    ]);

  // Pagination info
  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
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
    isMain: img.isMain || (index === 0) // Use provided isMain or set first image as main
  }));

  // Append new images to existing ones
  property.images = [...property.images, ...images];

  // Ensure only one image is marked as main
  const mainImages = property.images.filter(img => img.isMain);
  if (mainImages.length > 1) {
    mainImages.slice(1).forEach(img => (img.isMain = false));
  }

  await property.save();

  res.status(200).json({
    success: true,
    data: property.images
  });
});

// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private
exports.deletePropertyImage = asyncHandler(async (req, res, next) => {
  const { id, imageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse(`Invalid property ID format`, 400));
  }

  const property = await Property.findById(id);

  if (!property) {
    return next(
      new ErrorResponse(`Property not found with id of ${id}`, 404)
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

  // Find and remove the image
  const imageIndex = property.images.findIndex(img => img._id.toString() === imageId);
  if (imageIndex === -1) {
    return next(new ErrorResponse(`Image not found with id of ${imageId}`, 404));
  }

  const image = property.images[imageIndex];
  if (image.publicId) {
    await cloudinary.uploader.destroy(image.publicId);
  }

  property.images.splice(imageIndex, 1);
  await property.save();

  res.status(200).json({
    success: true,
    data: property.images
  });
});

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
    success: true,
    data: {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    }
  });
});