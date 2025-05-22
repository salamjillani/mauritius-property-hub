const Agent = require("../models/Agent");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const path = require("path");

// @desc    Get all agents
// @route   GET /api/agents
// @access  Public
exports.getAgents = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  let query = Agent.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Agent.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  query = query.populate([
    { path: "user", select: "firstName lastName email avatarUrl" },
    { path: "agency", select: "name logoUrl" },
    { path: "listingsCount" },
  ]);

  const agents = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: agents.length,
    pagination,
    data: agents,
  });
});

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Public
exports.getAgent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse(`Invalid agent ID format`, 400));
  }

  const agent = await Agent.findById(id).populate([
    { path: "user", select: "firstName lastName email avatarUrl" },
    { path: "agency", select: "name logoUrl" },
    { path: "properties" },
  ]);

  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${id}`, 404));
  }

  res.status(200).json({ success: true, data: agent });
});

// @desc    Create new agent
// @route   POST /api/agents
// @access  Private
exports.createAgent = asyncHandler(async (req, res, next) => {
  const existingAgent = await Agent.findOne({ user: req.user.id });

  if (existingAgent) {
    return next(new ErrorResponse(`You already have an agent profile`, 400));
  }

  req.body.user = req.user.id;
  const agent = await Agent.create({
    ...req.body,
    avatarUrl: req.body.avatarUrl || "default-avatar.jpg",
  });

  if (req.user.role !== "agent") {
    await User.findByIdAndUpdate(req.user.id, { role: "agent", avatarUrl: req.body.avatarUrl || "default-avatar.jpg" });
  }

  res.status(201).json({
    success: true,
    data: agent,
  });
});

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private
exports.updateAgent = asyncHandler(async (req, res, next) => {
  let agent = await Agent.findById(req.params.id);

  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404));
  }

  if (agent.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this agent profile`, 401)
    );
  }

  agent = await Agent.findByIdAndUpdate(
    req.params.id,
    { ...req.body, avatarUrl: req.body.avatarUrl || agent.user.avatarUrl },
    { new: true, runValidators: true }
  );

  if (req.body.avatarUrl) {
    await User.findByIdAndUpdate(agent.user, { avatarUrl: req.body.avatarUrl });
  }

  res.status(200).json({ success: true, data: agent });
});

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private
exports.deleteAgent = asyncHandler(async (req, res, next) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404));
  }

  if (agent.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete this agent profile`, 401)
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
    .sort("-createdAt")
    .limit(limit)
    .populate([
      { path: "user", select: "firstName lastName email avatarUrl" },
      { path: "agency", select: "name logoUrl" },
      { path: "listingsCount" },
    ]);

  res.status(200).json({
    success: true,
    count: agents.length,
    data: agents,
  });
});

// @desc    Upload photo for agent
// @route   POST /api/agents/:id/photo
// @access  Private
exports.uploadAgentPhoto = asyncHandler(async (req, res, next) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404));
  }

  if (agent.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this agent`, 401)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)
    );
  }

  file.name = `agent_${agent._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await User.findByIdAndUpdate(agent.user, { avatarUrl: file.name });
    await Agent.findByIdAndUpdate(req.params.id, { avatarUrl: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
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
    return next(new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404));
  }

  if (!agency) {
    return next(new ErrorResponse(`Agency not found with id of ${req.params.agencyId}`, 404));
  }

  if (agent.user.toString() !== req.user.id && agency.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to link this agent with agency`, 401)
    );
  }

  agent.agency = req.params.agencyId;
  await agent.save();

  res.status(200).json({ success: true, data: agent });
});