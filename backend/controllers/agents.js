
const Agent = require('../models/Agent');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const path = require('path');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Public
exports.getAgents = asyncHandler(async (req, res, next) => {
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
  let query = Agent.find(JSON.parse(queryStr));

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
  const total = await Agent.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate
  query = query.populate([
    { path: 'user', select: 'firstName lastName email avatarUrl' },
    { path: 'agency', select: 'name logoUrl' },
    { path: 'listingsCount' }
  ]);

  // Executing query
  const agents = await query;

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
    count: agents.length,
    pagination,
    data: agents
  });
});

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Public
exports.getAgent = asyncHandler(async (req, res, next) => {
  const agent = await Agent.findById(req.params.id)
    .populate([
      { path: 'user', select: 'firstName lastName email avatarUrl' },
      { path: 'agency', select: 'name logoUrl' },
      { path: 'properties' }
    ]);

  if (!agent) {
    return next(
      new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: agent });
});

// @desc    Create new agent
// @route   POST /api/agents
// @access  Private
exports.createAgent = asyncHandler(async (req, res, next) => {
  // Check if agent profile already exists for this user
  const existingAgent = await Agent.findOne({ user: req.user.id });

  if (existingAgent) {
    return next(
      new ErrorResponse(`You already have an agent profile`, 400)
    );
  }

  // Add user to req.body
  req.body.user = req.user.id;

  const agent = await Agent.create(req.body);

  // Update user role if needed
  if (req.user.role !== 'agent') {
    await User.findByIdAndUpdate(req.user.id, { role: 'agent' });
  }

  res.status(201).json({
    success: true,
    data: agent
  });
});

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private
exports.updateAgent = asyncHandler(async (req, res, next) => {
  let agent = await Agent.findById(req.params.id);

  if (!agent) {
    return next(
      new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is agent owner or admin
  if (
    agent.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this agent profile`,
        401
      )
    );
  }

  agent = await Agent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: agent });
});

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private
exports.deleteAgent = asyncHandler(async (req, res, next) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return next(
      new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is agent owner or admin
  if (
    agent.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this agent profile`,
        401
      )
    );
  }

  await agent.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get premium agents
// @route   GET /api/agents/premium
// @access  Public
exports.getPremiumAgents = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 4;
  
  const agents = await Agent.find({ isPremium: true })
    .sort('-createdAt')
    .limit(limit)
    .populate([
      { path: 'user', select: 'firstName lastName email avatarUrl' },
      { path: 'agency', select: 'name logoUrl' },
      { path: 'listingsCount' }
    ]);

  res.status(200).json({
    success: true,
    count: agents.length,
    data: agents
  });
});

// @desc    Upload photo for agent
// @route   POST /api/agents/:id/photo
// @access  Private
exports.uploadAgentPhoto = asyncHandler(async (req, res, next) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return next(
      new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is agent owner or admin
  if (
    agent.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this agent`,
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
  file.name = `agent_${agent._id}${path.parse(file.name).ext}`;

  // Upload file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Update user avatar
    await User.findByIdAndUpdate(agent.user, { avatarUrl: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

// @desc    Link agent to agency
// @route   PUT /api/agents/:id/agency/:agencyId
// @access  Private
exports.linkAgentToAgency = asyncHandler(async (req, res, next) => {
  const agent = await Agent.findById(req.params.id);
  const agency = await Agency.findById(req.params.agencyId);

  if (!agent) {
    return next(
      new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404)
    );
  }

  if (!agency) {
    return next(
      new ErrorResponse(`Agency not found with id of ${req.params.agencyId}`, 404)
    );
  }

  // Make sure user is agent owner or agency owner or admin
  if (
    agent.user.toString() !== req.user.id &&
    agency.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to link this agent with agency`,
        401
      )
    );
  }

  agent.agency = req.params.agencyId;
  await agent.save();

  res.status(200).json({ success: true, data: agent });
});
