const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const Agency = require('../models/Agency');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { notifyNewProperty } = require('./admin');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = asyncHandler(async (req, res, next) => {
  if (req.query.agent && !mongoose.Types.ObjectId.isValid(req.query.agent)) {
    return next(new ErrorResponse('Invalid agent ID format', 400));
  }

  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Default to approved properties for non-admins
  if (!reqQuery.owner || (req.user && reqQuery.owner !== req.user.id)) {
    if (!req.user || req.user.role !== 'admin') {
      reqQuery.status = 'approved';
    }
  }

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  let query = Property.find(JSON.parse(queryStr)).setOptions({ isAuthenticated: !!req.user });

  // Text search
  if (req.query.search) {
    query = query.find({
      $text: { $search: req.query.search },
    });
  }

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort results
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort({ isFeatured: -1, isPremium: -1, createdAt: -1 });
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Property.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate related data
  query = query.populate([
    {
      path: 'agent',
      select: 'user title isPremium',
      populate: {
        path: 'user',
        select: req.user ? 'firstName lastName email contactDetails avatarUrl' : 'firstName lastName',
      },
    },
    { path: 'agency', select: 'name logoUrl' },
    { path: 'owner', select: 'firstName lastName email' },
  ]);

  const properties = await query;

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
    data: properties,
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const property = await Property.findById(req.params.id)
    .setOptions({ isAuthenticated: !!req.user })
    .populate([
      {
        path: 'agent',
        select: '_id user title isPremium',
        populate: {
          path: 'user',
          select: req.user ? 'firstName lastName email contactDetails avatarUrl' : 'firstName lastName',
        },
      },
      {
        path: 'agency',
        select: 'name logoUrl',
        populate: {
          path: 'agents',
          select: '_id user title isPremium approvalStatus',
          populate: {
            path: 'user',
            select: req.user ? 'firstName lastName email contactDetails avatarUrl' : 'firstName lastName',
          },
        },
      },
      { path: 'owner', select: 'firstName lastName email' },
    ]);

  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
  }

  if (['pending', 'rejected', 'inactive'].includes(property.status) && (!req.user || (req.user.role !== 'admin' && property.owner.toString() !== req.user.id))) {
    return next(new ErrorResponse('Not authorized to view this property', 403));
  }

  res.status(200).json({ success: true, data: property });
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
exports.createProperty = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('subscription');
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (!user.subscription) {
    return next(new ErrorResponse('No active subscription found', 403));
  }

  const subscription = await Subscription.findById(user.subscription);
  if (!subscription || subscription.status !== 'active') {
    return next(new ErrorResponse('Your subscription is not active', 403));
  }

  if (subscription.listingsUsed >= subscription.listingLimit) {
    return next(new ErrorResponse('Listing limit reached for your subscription', 403));
  }

  if (!['agent', 'agency', 'promoter', 'admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Invalid user role for creating property', 403));
  }

  req.body.owner = req.user.id;
  req.body.status = 'pending';

  // Handle agent and agency assignments
  if (req.user.role === 'agent') {
    const agent = await Agent.findOne({ user: req.user.id });
    if (!agent) {
      return next(new ErrorResponse('Agent profile not found for this user', 400));
    }
    req.body.agent = agent._id;
    if (agent.agency) {
      req.body.agency = agent.agency;
      const agency = await Agency.findById(agent.agency).populate('user');
      const agencySubscription = await Subscription.findOne({ user: agency.user });
      if (agencySubscription && (agencySubscription.status !== 'active' || agencySubscription.listingsUsed >= agencySubscription.listingLimit)) {
        return next(new ErrorResponse('Agency subscription is not active or listing limit reached', 403));
      }
    }
  }

  if (req.user.role === 'agency') {
    const agency = await Agency.findOne({ user: req.user.id }).populate('agents');
    if (!agency) {
      return next(new ErrorResponse('Agency profile not found for this user', 400));
    }
    req.body.agency = agency._id;
    if (!req.body.agent && agency.agents?.length > 0) {
      const approvedAgent = agency.agents.find((agent) => agent.approvalStatus === 'approved');
      if (approvedAgent) {
        req.body.agent = approvedAgent._id;
      }
    }
  }

  if (req.user.role === 'promoter') {
    const agent = await Agent.findOne({ user: req.user.id });
    if (agent) {
      req.body.agent = agent._id;
      if (agent.agency) {
        req.body.agency = agent.agency;
      }
    }
  }

  // Set contact details for agents
  if (req.user.role === 'agent' && req.user.contactDetails) {
    req.body.contactDetails = {
      phone: req.user.contactDetails.phone,
      email: req.user.contactDetails.email,
      isRestricted: true,
    };
  }

  // Validate isFeatured and isPremium
  if (req.body.isFeatured && !['elite', 'platinum'].includes(subscription.plan)) {
    return next(new ErrorResponse('Featured properties require Elite or Platinum subscription', 403));
  }
  if (req.body.isPremium && subscription.plan === 'basic') {
    return next(new ErrorResponse('Premium properties require non-basic subscription', 403));
  }

  const property = await Property.create(req.body);

  // Update subscription usage
  subscription.listingsUsed += 1;
  if (req.body.isFeatured && ['elite', 'platinum'].includes(subscription.plan)) {
    const maxFeatured = Math.floor(subscription.listingLimit * 0.25);
    if (subscription.featuredListings.length >= maxFeatured) {
      return next(new ErrorResponse('Featured listing limit reached', 403));
    }
    subscription.featuredListings.push(property._id);
  }

  // Update agency subscription if applicable
  if (req.user.role === 'agent' && req.body.agency) {
    const agency = await Agency.findById(req.body.agency).populate('user');
    const agencySubscription = await Subscription.findOne({ user: agency.user });
    if (agencySubscription) {
      agencySubscription.listingsUsed += 1;
      await agencySubscription.save();
    }
  }

  await Promise.all([property.save(), subscription.save()]);

  await notifyNewProperty(property);

  res.status(201).json({ success: true, data: property });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  let property = await Property.findById(req.params.id);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this property`, 403));
  }

  const subscription = await Subscription.findById(req.user.subscriptionId);
  if (!subscription) {
    return next(new ErrorResponse('No active subscription found', 403));
  }

  // Handle status updates
  if (req.body.status) {
    if (req.user.role === 'admin') {
      if (!['pending', 'approved', 'rejected', 'active', 'inactive'].includes(req.body.status)) {
        return next(new ErrorResponse('Invalid status value', 400));
      }
    } else {
      if (!['active', 'inactive'].includes(req.body.status)) {
        return next(new ErrorResponse('Invalid status for owner', 400));
      }
      if (req.body.status === 'active') {
        req.body.status = 'pending';
        await notifyNewProperty(property);
      }
    }
  }

  // Validate isFeatured and isPremium
  if (req.body.isFeatured && !['elite', 'platinum'].includes(subscription.plan)) {
    return next(new ErrorResponse('Featured properties require Elite or Platinum subscription', 403));
  }
  if (req.body.isPremium && subscription.plan === 'basic') {
    return next(new ErrorResponse('Premium properties require non-basic subscription', 403));
  }

  // Update contact details for agents
  if (req.body.contactDetails && req.user.role === 'agent') {
    req.body.contactDetails.isRestricted = true;
  }

  property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: property });
});

// @desc    Search properties and count results
// @route   GET /api/properties/search
// @access  Public
exports.searchProperties = asyncHandler(async (req, res, next) => {
  const { category, q, type, maxPrice, minBeds, minBaths, minArea, amenities } = req.query;

  const filter = { status: 'approved' };

  if (category) {
    filter.category = category;
  }

  if (type && type !== 'all') {
    filter.type = type.charAt(0).toUpperCase() + type.slice(1);
  }

  if (maxPrice && !isNaN(maxPrice)) {
    filter.price = { $lte: parseFloat(maxPrice) };
  }

  if (minBeds && !isNaN(minBeds)) {
    filter.bedrooms = { $gte: parseInt(minBeds) };
  }

  if (minBaths && !isNaN(minBaths)) {
    filter.bathrooms = { $gte: parseFloat(minBaths) };
  }

  if (minArea && !isNaN(minArea)) {
    filter.area = { $gte: parseFloat(minArea) };
  }

  if (amenities) {
    const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
    filter.amenities = { $all: amenitiesArray };
  }

  if (q) {
    filter.$text = { $search: q };
  }

  const count = await Property.countDocuments(filter);
  const properties = await Property.find(filter)
    .sort({ isFeatured: -1, isPremium: -1, createdAt: -1 })
    .limit(20)
    .select('title price currency category type address location bedrooms bathrooms area images isFeatured isPremium')
    .populate([
      { path: 'agent', select: 'user title', populate: { path: 'user', select: 'firstName lastName' } },
      { path: 'agency', select: 'name logoUrl' },
    ]);

  res.status(200).json({
    success: true,
    count,
    data: properties,
    searchParams: { category, q, type, maxPrice, minBeds, minBaths, minArea, amenities },
  });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this property`, 403));
  }

  // Delete associated images from Cloudinary
  if (property.images?.length > 0) {
    for (const image of property.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId).catch((err) => console.error('Cloudinary delete error:', err));
      }
    }
  }

  await Property.deleteOne({ _id: req.params.id });

  // Update subscription usage
  const subscription = await Subscription.findById(req.user.subscription);
  if (subscription) {
    subscription.listingsUsed = Math.max(0, subscription.listingsUsed - 1);
    subscription.featuredListings = subscription.featuredListings.filter(
      (id) => id.toString() !== req.params.id
    );
    await subscription.save();
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get property by category and ID
// @route   GET /api/properties/:category/:id
// @access  Public
exports.getPropertyByCategory = asyncHandler(async (req, res, next) => {
  const { category, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const validCategories = ['for-sale', 'for-rent', 'offices', 'office-rent', 'land'];
  if (!validCategories.includes(category)) {
    return next(new ErrorResponse('Invalid property category', 400));
  }

  const property = await Property.findOne({ _id: id, category })
    .setOptions({ isAuthenticated: !!req.user })
    .populate([
      { path: 'owner', select: 'firstName lastName email' },
      {
        path: 'agent',
        select: 'user title isPremium',
        populate: { path: 'user', select: 'firstName lastName email contactDetails avatarUrl' },
      },
      { path: 'agency', select: 'name logoUrl' },
    ]);

  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${id} in category ${category}`, 404));
  }

  res.status(200).json({ success: true, data: property });
});

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 6;

  const properties = await Property.find({ isFeatured: true, status: 'approved' })
    .sort({ isPremium: -1, createdAt: -1 })
    .limit(limit)
    .setOptions({ isAuthenticated: !!req.user })
    .populate([
      {
        path: 'agent',
        select: 'user title isPremium',
        populate: {
          path: 'user',
          select: req.user ? 'firstName lastName email contactDetails avatarUrl' : 'firstName lastName',
        },
      },
      { path: 'agency', select: 'name logoUrl' },
    ]);

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

// @desc    Get properties by category
// @route   GET /api/properties/category/:categorySlug
// @access  Public
exports.getPropertiesByCategory = asyncHandler(async (req, res, next) => {
  const { categorySlug } = req.params;
  const limit = parseInt(req.query.limit, 10) || 20;
  const page = parseInt(req.query.page, 10) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const validCategories = ['for-sale', 'for-rent', 'offices', 'office-rent', 'land'];
  if (!validCategories.includes(categorySlug)) {
    return next(new ErrorResponse('Invalid property category', 400));
  }

  const filter = { category: categorySlug, status: 'approved' };
  const total = await Property.countDocuments(filter);

  const properties = await Property.find(filter)
    .sort({ isFeatured: -1, isPremium: -1, createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .setOptions({ isAuthenticated: !!req.user })
    .populate([
      {
        path: 'agent',
        select: 'user title isPremium',
        populate: {
          path: 'user',
          select: req.user ? 'firstName lastName email contactDetails avatarUrl' : 'firstName lastName',
        },
      },
      { path: 'agency', select: 'name logoUrl' },
    ]);

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
    data: properties,
  });
});

// @desc    Upload images for property
// @route   POST /api/properties/:id/images
// @access  Private
exports.uploadPropertyImages = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const { cloudinaryUrls } = req.body;
  if (!cloudinaryUrls || !Array.isArray(cloudinaryUrls) || cloudinaryUrls.length === 0) {
    return next(new ErrorResponse('Please provide valid image data', 400));
  }

  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this property`, 403));
  }

  const images = cloudinaryUrls.map((img, index) => ({
    url: img.url,
    publicId: img.publicId,
    caption: img.caption || `Image ${property.images.length + index + 1}`,
    isMain: img.isMain || (property.images.length === 0 && index === 0),
  }));

  property.images = [...property.images, ...images];

  // Ensure only one main image
  const mainImages = property.images.filter((img) => img.isMain);
  if (mainImages.length > 1) {
    mainImages.slice(1).forEach((img) => (img.isMain = false));
  }
  if (mainImages.length === 0 && property.images.length > 0) {
    property.images[0].isMain = true;
  }

  await property.save();

  res.status(200).json({ success: true, data: property.images });
});

// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private
exports.deletePropertyImage = asyncHandler(async (req, res, next) => {
  const { id, imageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const property = await Property.findById(id);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${id}`, 404));
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this property`, 403));
  }

  const imageIndex = property.images.findIndex((img) => img._id.toString() === imageId);
  if (imageIndex === -1) {
    return next(new ErrorResponse(`Image not found with id of ${imageId}`, 404));
  }

  const image = property.images[imageIndex];
  if (image.publicId) {
    await cloudinary.uploader.destroy(image.publicId).catch((err) => console.error('Cloudinary delete error:', err));
  }

  property.images.splice(imageIndex, 1);
  if (image.isMain && property.images.length > 0) {
    property.images[0].isMain = true;
  }

  await property.save();

  res.status(200).json({ success: true, data: property.images });
});

// @desc    Get Cloudinary signature for direct uploads
// @route   GET /api/properties/cloudinary-signature
// @access  Private
exports.getCloudinarySignature = asyncHandler(async (req, res, next) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: `properties/${req.user.id}`,
    upload_preset: 'real_estate',
  };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

  res.status(200).json({
    success: true,
    data: {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder,
      uploadPreset: params.upload_preset,
    },
  });
});