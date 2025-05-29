const Agent = require("../models/Agent");
const User = require("../models/User");
const Agency = require("../models/Agency");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');

exports.getAgentCloudinarySignature = asyncHandler(async (req, res, next) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: 'agent-photos',
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

exports.getAgents = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  let query = Agent.find({ ...JSON.parse(queryStr), approvalStatus: 'approved' })
    .sort({ isPremium: -1, createdAt: -1 });

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
  const total = await Agent.countDocuments({ ...JSON.parse(queryStr), approvalStatus: 'approved' });

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

exports.getAgent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse(`Invalid agent ID format`, 400));
  }

  const agent = await Agent.findOne({ _id: id, approvalStatus: 'approved' }).populate([
    { path: "user", select: "firstName lastName email avatarUrl contactDetails" },
    { path: "agency", select: "name logoUrl" },
    { path: "properties" },
    { path: "linkingRequests.agency", select: "name logoUrl" }
  ]);

  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${id}`, 404));
  }

  res.status(200).json({ success: true, data: agent });
});

exports.createAgent = asyncHandler(async (req, res, next) => {
  const existingAgent = await Agent.findOne({ user: req.user.id });

  if (existingAgent) {
    return next(new ErrorResponse(`You already have an agent profile`, 400));
  }

  req.body.user = req.user.id;
  const agent = await Agent.create({
    ...req.body,
    photoUrl: req.body.photoUrl || "default-avatar.jpg",
  });

  if (req.user.role !== "agent") {
    await User.findByIdAndUpdate(req.user.id, { role: "agent", avatarUrl: req.body.photoUrl || "default-avatar.jpg" });
  }

  res.status(201).json({
    success: true,
    data: agent,
  });
});

exports.updateAgent = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid agent ID format`, 400));
  }

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
    { ...req.body, photoUrl: req.body.photoUrl || agent.photoUrl },
    { new: true, runValidators: true }
  );

  if (req.body.photoUrl) {
    await User.findByIdAndUpdate(agent.user, { avatarUrl: req.body.photoUrl });
  }

  res.status(200).json({ success: true, data: agent });
});

exports.deleteAgent = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid agent ID format`, 400));
  }

  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404));
  }

  if (agent.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete this agent profile`, 401)
    );
  }

  await Agent.deleteOne({ _id: req.params.id });

  res.status(200).json({ success: true, data: {} });
});

exports.requestAgencyLink = asyncHandler(async (req, res, next) => {
  const { agencyId } = req.body;
  const agentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(agentId) || !mongoose.Types.ObjectId.isValid(agencyId)) {
    return next(new ErrorResponse('Invalid agent or agency ID format', 400));
  }

  const agent = await Agent.findById(agentId);
  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${agentId}`, 404));
  }

  const agency = await Agency.findById(agencyId);
  if (!agency) {
    return next(new ErrorResponse(`Agency not found with id of ${agencyId}`, 404));
  }

  if (agency.approvalStatus !== 'approved') {
    return next(new ErrorResponse('Cannot link to an unapproved or ineligible agency', 403));
  }

  const existingRequest = agent.linkingRequests.find(
    (request) => request.agency.toString() === agencyId && request.status === 'pending'
  );

  if (existingRequest) {
    return next(new ErrorResponse('A pending linking request already exists for this agency', 400));
  }

  agent.linkingRequests.push({ agency: agencyId });
  await agent.save();

  await Notification.create({
    user: agent.user,
    type: 'agency_link_request',
    message: `Your request to link with ${agency.name} has been submitted.`,
  });

  await Notification.create({
    user: agency.user,
    type: 'agency_link_request_received',
    message: `Agent ${agent.user.firstName} ${agent.user.lastName} has requested to link with your agency.`,
  });

  res.status(200).json({ success: true, data: agent });
});

exports.approveAgencyLink = asyncHandler(async (req, res, next) => {
  const { agentId, agencyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(agentId) || !mongoose.Types.ObjectId.isValid(agencyId)) {
    return next(new ErrorResponse('Invalid agent or agency ID format', 400));
  }

  const agent = await Agent.findById(agentId);
  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${agentId}`, 404));
  }

  const agency = await Agency.findById(agencyId);
  if (!agency) {
    return next(new ErrorResponse(`Agency not found with id of ${agencyId}`, 404));
  }

  if (agency.approvalStatus !== 'approved') {
    return next(new ErrorResponse('Cannot approve link to an unapproved or ineligible agency', 403));
  }

  const linkRequest = agent.linkingRequests.find(
    (request) => request.agency.toString() === agencyId && request.status === 'pending'
  );

  if (!linkRequest) {
    return next(new ErrorResponse('No pending linking request found', 404));
  }

  linkRequest.status = 'approved';
  agent.agency = agencyId;
  await agent.save();

  agency.agents.push(agentId);
  await agency.save();

  await Notification.create({
    user: agent.user,
    type: 'agency_link_approved',
    message: `Your request to link with ${agency.name} has been approved.`,
  });

  res.status(200).json({ success: true, data: agent });
});

exports.getPremiumAgents = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 4;

  const agents = await Agent.find({ isPremium: true, approvalStatus: 'approved' })
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

exports.uploadAgentPhoto = asyncHandler(async (req, res, next) => {
  const { cloudinaryUrl } = req.body;

  if (!cloudinaryUrl) {
    return next(new ErrorResponse('Please provide image data', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid agent ID format`, 400));
  }

  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return next(
      new ErrorResponse(`Agent not found with id of ${req.params.id}`, 404)
    );
  }

  if (agent.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this agent profile`,
        401
      )
    );
  }

  await Agent.findByIdAndUpdate(req.params.id, { photoUrl: cloudinaryUrl });
  await User.findByIdAndUpdate(agent.user, { avatarUrl: cloudinaryUrl });

  res.status(200).json({
    success: true,
    data: { photoUrl: cloudinaryUrl }
  });
});

exports.requestLinkToAgency = asyncHandler(async (req, res, next) => {
  const { agencyId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(agencyId)) {
    return next(new ErrorResponse(`Invalid agency ID format`, 400));
  }

  const agent = await Agent.findOne({ user: req.user.id });
  const agency = await Agency.findById(agencyId);

  if (!agent) {
    return next(new ErrorResponse(`Agent not found for user ${req.user.id}`, 404));
  }

  if (!agency) {
    return next(new ErrorResponse(`Agency not found with id of ${agencyId}`, 404));
  }

  const existingRequest = agent.linkingRequests.find(
    (req) => req.agency.toString() === agencyId && req.status === 'pending'
  );

  if (existingRequest) {
    return next(new ErrorResponse(`You already have a pending request to this agency`, 400));
  }

  agent.linkingRequests.push({ agency: agencyId });
  await agent.save();

  res.status(200).json({ success: true, data: agent });
});

exports.approveAgentLink = asyncHandler(async (req, res, next) => {
  const { agentId, requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(agentId)) {
    return next(new ErrorResponse(`Invalid agent ID format: ${agentId}`, 400));
  }
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return next(new ErrorResponse(`Invalid request ID format: ${requestId}`, 400));
  }

  const agent = await Agent.findById(agentId);
  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${agentId}`, 404));
  }

  const agency = await Agency.findOne({ user: req.user.id });
  if (!agency) {
    return next(new ErrorResponse(`Agency not found for user ${req.user.id}`, 404));
  }

  if (req.user.role !== 'admin' && agency.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to approve this agent`, 401)
    );
  }

  const request = agent.linkingRequests.find(req => req._id.toString() === requestId);
  if (!request) {
    return next(new ErrorResponse(`Linking request not found with id of ${requestId}`, 404));
  }

  if (request.agency.toString() !== agency._id.toString()) {
    return next(
      new ErrorResponse(`Linking request does not belong to agency ${agency._id}`, 403)
    );
  }

  request.status = 'approved';
  agent.agency = agency._id;
  agent.approvalStatus = 'approved';

  agent.linkingRequests.forEach(req => {
    if (req._id.toString() !== requestId && req.status === 'pending') {
      req.status = 'rejected';
    }
  });

  await agent.save();

  res.status(200).json({ success: true, data: agent });
});

exports.rejectAgentLink = asyncHandler(async (req, res, next) => {
  const { agentId, requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(agentId) || !mongoose.Types.ObjectId.isValid(requestId)) {
    return next(new ErrorResponse(`Invalid ID format`, 400));
  }

  const agent = await Agent.findById(agentId);
  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${agentId}`, 404));
  }

  const agency = await Agency.findOne({ user: req.user.id });
  if (!agency) {
    return next(new ErrorResponse(`Agency not found for user ${req.user.id}`, 404));
  }

  if (req.user.role !== 'admin' && agency.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to reject this agent`, 401)
    );
  }

  const request = agent.linkingRequests.id(requestId);
  if (!request) {
    return next(new ErrorResponse(`Linking request not found`, 404));
  }

  if (request.agency.toString() !== agency._id.toString()) {
    return next(
      new ErrorResponse(`Linking request does not belong to agency ${agency._id}`, 403)
    );
  }

  request.status = 'rejected';
  await agent.save();

  agent.linkingRequests = agent.linkingRequests.filter(req => req.status !== 'rejected');
  await agent.save();

  res.status(200).json({ success: true, data: agent });
});

exports.getLinkingRequests = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findOne({ user: req.user.id });
  if (!agency) {
    return next(new ErrorResponse(`Agency not found for user ${req.user.id}`, 404));
  }

  const agents = await Agent.find({
    'linkingRequests.agency': agency._id,
    'linkingRequests.status': 'pending'
  }).populate('user', 'firstName lastName email');

  res.status(200).json({ success: true, data: agents });
});