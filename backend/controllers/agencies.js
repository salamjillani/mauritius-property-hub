
const Agency = require('../models/Agency');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const path = require('path');

// @desc    Get all agencies
// @route   GET /api/agencies
// @access  Public
exports.getAgencies = asyncHandler(async (req, res, next) => {
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
  let query = Agency.find(JSON.parse(queryStr));

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
  const total = await Agency.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate
  query = query.populate([
    { path: 'user', select: 'firstName lastName email' },
    { path: 'agents' },
    { path: 'listingsCount' }
  ]);

  // Executing query
  const agencies = await query;

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
    count: agencies.length,
    pagination,
    data: agencies
  });
});

// @desc    Get single agency
// @route   GET /api/agencies/:id
// @access  Public
exports.getAgency = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findById(req.params.id)
    .populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'agents' },
      { path: 'properties' }
    ]);

  if (!agency) {
    return next(
      new ErrorResponse(`Agency not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: agency });
});

// @desc    Create new agency
// @route   POST /api/agencies
// @access  Private
exports.createAgency = asyncHandler(async (req, res, next) => {
  // Check if agency profile already exists for this user
  const existingAgency = await Agency.findOne({ user: req.user.id });

  if (existingAgency) {
    return next(
      new ErrorResponse(`You already have an agency profile`, 400)
    );
  }

  // Add user to req.body
  req.body.user = req.user.id;

  const agency = await Agency.create(req.body);

  // Update user role if needed
  if (req.user.role !== 'agency') {
    await User.findByIdAndUpdate(req.user.id, { role: 'agency' });
  }

  res.status(201).json({
    success: true,
    data: agency
  });
});

// @desc    Update agency
// @route   PUT /api/agencies/:id
// @access  Private
exports.updateAgency = asyncHandler(async (req, res, next) => {
  let agency = await Agency.findById(req.params.id);

  if (!agency) {
    return next(
      new ErrorResponse(`Agency not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is agency owner or admin
  if (
    agency.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this agency profile`,
        401
      )
    );
  }

  agency = await Agency.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: agency });
});

// @desc    Delete agency
// @route   DELETE /api/agencies/:id
// @access  Private
exports.deleteAgency = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    return next(
      new ErrorResponse(`Agency not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is agency owner or admin
  if (
    agency.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this agency profile`,
        401
      )
    );
  }

  await agency.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get premium agencies
// @route   GET /api/agencies/premium
// @access  Public
exports.getPremiumAgencies = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 4;
  
  const agencies = await Agency.find({ isPremium: true })
    .sort('-createdAt')
    .limit(limit)
    .populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'agents' },
      { path: 'listingsCount' }
    ]);

  res.status(200).json({
    success: true,
    count: agencies.length,
    data: agencies
  });
});

// @desc    Upload logo for agency
// @route   POST /api/agencies/:id/logo
// @access  Private
exports.uploadAgencyLogo = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    return next(
      new ErrorResponse(`Agency not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is agency owner or admin
  if (
    agency.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this agency`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `agency_logo_${agency._id}${path.parse(file.name).ext}`;

  // Upload file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Update agency logo
    await Agency.findByIdAndUpdate(req.params.id, { logoUrl: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
