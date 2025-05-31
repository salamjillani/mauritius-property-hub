const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Agency = require('../models/Agency');
const Promoter = require('../models/Promoter');
const Property = require('../models/Property');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const Log = require('../models/Log');
const RegistrationRequest = require('../models/RegistrationRequest');

/**
 * @desc    Get dashboard data
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboardData = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalProperties = await Property.countDocuments();
  const totalSubscriptions = await Subscription.countDocuments();
  const pendingRequests = await RegistrationRequest.countDocuments({ status: 'pending' });
  const goldCardsUsed = await Property.countDocuments({ isGoldCard: true });

  const recentActivity = await Property.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('owner', 'firstName lastName')
    .select('_id title owner createdAt');

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProperties,
      totalSubscriptions,
      pendingRequests,
      goldCardsUsed,
      recentActivity,
    },
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { role, sort, search, page = 1, limit = 10 } = req.query;

  let query = {};
  if (role && role !== 'all') {
    query.role = role;
  }
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const pagination = {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  };

  const users = await User.find(query)
    .sort(sort || '-createdAt')
    .skip(startIndex)
    .limit(parseInt(limit))
    .select('_id firstName lastName email role approvalStatus listingLimit goldCards createdAt');

  res.status(200).json({
    success: true,
    count: users.length,
    pagination,
    data: users,
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid user ID format', 400));
  }

  const {
    firstName,
    lastName,
    email,
    role,
    phone,
    approvalStatus,
    listingLimit,
    goldCards,
  } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${id}`, 404));
  }

  if (user.role === 'admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to modify admin users', 403));
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return next(new ErrorResponse('Invalid email format', 400));
  }

  const fieldsToUpdate = {};
  if (firstName) fieldsToUpdate.firstName = firstName;
  if (lastName) fieldsToUpdate.lastName = lastName;
  if (email) fieldsToUpdate.email = email;
  if (role) fieldsToUpdate.role = role;
  if (phone) fieldsToUpdate.phone = phone;
  if (approvalStatus) fieldsToUpdate.approvalStatus = approvalStatus;
  if (listingLimit !== undefined) fieldsToUpdate.listingLimit = parseInt(listingLimit);
  if (goldCards !== undefined) fieldsToUpdate.goldCards = parseInt(goldCards);

  const updatedUser = await User.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).select('-password');

  await Log.create({
    user: req.user.id,
    action: 'User updated',
    resource: 'User',
    resourceId: id,
    details: `User ${updatedUser.email} was updated by admin`,
  });

  res.status(200).json({ success: true, data: updatedUser });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid user ID format', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${id}`, 404));
  }

  if (user._id.toString() === req.user._id.toString()) {
    return next(new ErrorResponse('Cannot delete yourself', 400));
  }

  if (user.role === 'admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete admin users', 403));
  }

  await User.deleteOne({ _id: id });

  await Log.create({
    user: req.user.id,
    action: 'User deleted',
    resource: 'User',
    resourceId: id,
    details: `User ${user.email} was deleted by admin`,
  });

  res.status(200).json({ success: true, data: {} });
});

/**
 * @desc    Get all agents
 * @route   GET /api/admin/agents
 * @access  Private/Admin
 */
exports.getAgents = asyncHandler(async (req, res, next) => {
  const { status, sort, search, page = 1, limit = 10 } = req.query;

  let query = {};
  if (status && status !== 'all') {
    query.approvalStatus = status;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'user.firstName': { $regex: search, $options: 'i' } },
      { 'user.lastName': { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Agent.countDocuments(query);
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const pagination = {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  };

  const agents = await Agent.find(query)
    .populate('user', 'firstName lastName email')
    .sort(sort || '-createdAt')
    .skip(startIndex)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: agents.length,
    pagination,
    data: agents,
  });
});

/**
 * @desc    Update agent
 * @route   PUT /api/admin/agents/:id
 * @access  Private/Admin
 */
exports.updateAgent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid agent ID format', 400));
  }

  const { title, isPremium, approvalStatus } = req.body;

  const fieldsToUpdate = {};
  if (title) fieldsToUpdate.title = title;
  if (isPremium !== undefined) fieldsToUpdate.isPremium = isPremium;
  if (approvalStatus) fieldsToUpdate.approvalStatus = approvalStatus;

  const agent = await Agent.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).populate('user', 'firstName lastName email');

  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${id}`, 404));
  }

  await Log.create({
    user: req.user.id,
    action: 'Agent updated',
    resource: 'Agent',
    resourceId: id,
    details: `Agent ${agent.title} was updated by admin`,
  });

  res.status(200).json({ success: true, data: agent });
});

/**
 * @desc    Delete agent
 * @route   DELETE /api/admin/agents/:id
 * @access  Private/Admin
 */
exports.deleteAgent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid agent ID format', 400));
  }

  const agent = await Agent.findById(id);
  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${id}`, 404));
  }

  await Agent.deleteOne({ _id: id });

  await Log.create({
    user: req.user.id,
    action: 'Agent deleted',
    resource: 'Agent',
    resourceId: id,
    details: `Agent ${agent.title} was deleted by admin`,
  });

  res.status(200).json({ success: true, data: {} });
});

/**
 * @desc    Approve agent
 * @route   POST /api/admin/agents/:id/approve
 * @access  Private/Admin
 */
exports.approveAgent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid agent ID format', 400));
  }

  const agent = await Agent.findById(id).populate('user', 'firstName lastName email');
  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${id}`, 404));
  }

  agent.approvalStatus = 'approved';
  await agent.save();

  const user = await User.findById(agent.user._id);
  if (user) {
    user.approvalStatus = 'approved';
    await user.save();
  }

  await Notification.create({
    user: agent.user._id,
    type: 'agent_approved',
    message: `Your agent profile has been approved.`,
  });

  await Log.create({
    user: req.user.id,
    action: 'Agent approved',
    resource: 'Agent',
    resourceId: id,
    details: `Agent ${agent.title} was approved by admin`,
  });

  res.status(200).json({ success: true, data: agent });
});

/**
 * @desc    Reject agent
 * @route   POST /api/admin/agents/:id/reject
 * @access  Private/Admin
 */
exports.rejectAgent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid agent ID format', 400));
  }

  if (!reason) {
    return next(new ErrorResponse('Rejection reason is required', 400));
  }

  const agent = await Agent.findById(id).populate('user', 'firstName lastName email');
  if (!agent) {
    return next(new ErrorResponse(`Agent not found with id of ${id}`, 404));
  }

  agent.approvalStatus = 'rejected';
  agent.rejectionReason = reason;
  await agent.save();

  await Notification.create({
    user: agent.user._id,
    type: 'agent_rejected',
    message: `Your agent profile has been rejected. Reason: ${reason}`,
  });

  await Log.create({
    user: req.user.id,
    action: 'Agent rejected',
    resource: 'Agent',
    resourceId: id,
    details: `Agent ${agent.title} was rejected by admin`,
  });

  res.status(200).json({ success: true, data: agent });
});

/**
 * @desc    Get all agencies
 * @route   GET /api/admin/agencies
 * @access  Private/Admin
 */
exports.getAgencies = asyncHandler(async (req, res, next) => {
  const { status, sort, search, page = 1, limit = 10 } = req.query;

  let query = {};
  if (status && status !== 'all') {
    query.approvalStatus = status;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'user.firstName': { $regex: search, $options: 'i' } },
      { 'user.lastName': { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Agency.countDocuments(query);
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const pagination = {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  };

  const agencies = await Agency.find(query)
    .populate('user', 'firstName lastName email')
    .sort(sort || '-createdAt')
    .skip(startIndex)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: agencies.length,
    pagination,
    data: agencies,
  });
});

/**
 * @desc    Update agency
 * @route   PUT /api/admin/agencies/:id
 * @access  Private/Admin
 */
exports.updateAgency = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid agency ID format', 400));
  }

  const { name, logoUrl, approvalStatus } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (logoUrl) fieldsToUpdate.logoUrl = logoUrl;
  if (approvalStatus) fieldsToUpdate.approvalStatus = approvalStatus;

  const agency = await Agency.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).populate('user', 'firstName lastName email');

  if (!agency) {
    return next(new ErrorResponse(`Agency not found with id of ${id}`, 404));
  }

  await Log.create({
    user: req.user.id,
    action: 'Agency updated',
    resource: 'Agency',
    resourceId: id,
    details: `Agency ${agency.name} was updated by admin`,
  });

  res.status(200).json({ success: true, data: agency });
});

/**
 * @desc    Delete agency
 * @route   DELETE /api/admin/agencies/:id
 * @access  Private/Admin
 */
exports.deleteAgency = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid agency ID format', 400));
  }

  const agency = await Agency.findById(id);
  if (!agency) {
    return next(new ErrorResponse(`Agency not found with id of ${id}`, 404));
  }

  await Agency.deleteOne({ _id: id });

  await Log.create({
    user: req.user.id,
    action: 'Agency deleted',
    resource: 'Agency',
    resourceId: id,
    details: `Agency ${agency.name} was deleted by admin`,
  });

  res.status(200).json({ success: true, data: {} });
});

/**
 * @desc    Approve agency
 * @route   POST /api/admin/agencies/:id/approve
 * @access  Private/Admin
 */
exports.approveAgency = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid agency ID format', 400));
  }

  const agency = await Agency.findById(id).populate('user', 'firstName lastName email');
  if (!agency) {
    return next(new ErrorResponse(`Agency not found with id of ${id}`, 404));
  }

  agency.approvalStatus = 'approved';
  await agency.save();

  const user = await User.findById(agency.user._id);
  if (user) {
    user.approvalStatus = 'approved';
    await user.save();
  }

  await Notification.create({
    user: agency.user._id,
    type: 'agency_approved',
    message: `Your agency profile has been approved.`,
  });

  await Log.create({
    user: req.user.id,
    action: 'Agency approved',
    resource: 'Agency',
    resourceId: id,
    details: `Agency ${agency.name} was approved by admin`,
  });

  res.status(200).json({ success: true, data: agency });
});

/**
 * @desc    Reject agency
 * @route   POST /api/admin/agencies/:id/reject
 * @access  Private/Admin
 */
exports.rejectAgency = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid agency ID format', 400));
  }

  if (!reason) {
    return next(new ErrorResponse('Rejection reason is required', 400));
  }

  const agency = await Agency.findById(id).populate('user', 'firstName lastName email');
  if (!agency) {
    return next(new ErrorResponse(`Agency not found with id of ${id}`, 404));
  }

  agency.approvalStatus = 'rejected';
  agency.rejectionReason = reason;
  await agency.save();

  await Notification.create({
    user: agency.user._id,
    type: 'agency_rejected',
    message: `Your agency profile has been rejected. Reason: ${reason}`,
  });

  await Log.create({
    user: req.user.id,
    action: 'Agency rejected',
    resource: 'Agency',
    resourceId: id,
    details: `Agency ${agency.name} was rejected by admin`,
  });

  res.status(200).json({ success: true, data: agency });
});

/**
 * @desc    Get all promoters
 * @route   GET /api/admin/promoters
 * @access  Private/Admin
 */
exports.getPromoters = asyncHandler(async (req, res, next) => {
  const { status, sort, search, page = 1, limit = 10 } = req.query;

  let query = {};
  if (status && status !== 'all') {
    query.approvalStatus = status;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'user.firstName': { $regex: search, $options: 'i' } },
      { 'user.lastName': { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Promoter.countDocuments(query);
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const pagination = {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  };

  const promoters = await Promoter.find(query)
    .populate('user', 'firstName lastName email')
    .sort(sort || '-createdAt')
    .skip(startIndex)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: promoters.length,
    pagination,
    data: promoters,
  });
});

/**
 * @desc    Update promoter
 * @route   PUT /api/admin/promoters/:id
 * @access  Private/Admin
 */
exports.updatePromoter = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid promoter ID format', 400));
  }

  const { name, approvalStatus } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (approvalStatus) fieldsToUpdate.approvalStatus = approvalStatus;

  const promoter = await Promoter.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).populate('user', 'firstName lastName email');

  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id of ${id}`, 404));
  }

  await Log.create({
    user: req.user.id,
    action: 'Promoter updated',
    resource: 'Promoter',
    resourceId: id,
    details: `Promoter ${promoter.name} was updated by admin`,
  });

  res.status(200).json({ success: true, data: promoter });
});

/**
 * @desc    Delete promoter
 * @route   DELETE /api/admin/promoters/:id
 * @access  Private/Admin
 */
exports.deletePromoter = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid promoter ID format', 400));
  }

  const promoter = await Promoter.findById(id);
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id of ${id}`, 404));
  }

  await Promoter.deleteOne({ _id: id });

  await Log.create({
    user: req.user.id,
    action: 'Promoter deleted',
    resource: 'Promoter',
    resourceId: id,
    details: `Promoter ${promoter.name} was deleted by admin`,
  });

  res.status(200).json({ success: true, data: {} });
});

/**
 * @desc    Approve promoter
 * @route   POST /api/admin/promoters/:id/approve
 * @access  Private/Admin
 */
exports.approvePromoter = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid promoter ID format', 400));
  }

  const promoter = await Promoter.findById(id).populate('user', 'firstName lastName email');
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id of ${id}`, 404));
  }

  promoter.approvalStatus = 'approved';
  await promoter.save();

  const user = await User.findById(promoter.user._id);
  if (user) {
    user.approvalStatus = 'approved';
    await user.save();
  }

  await Notification.create({
    user: promoter.user._id,
    type: 'promoter_approved',
    message: `Your promoter profile has been approved.`,
  });

  await Log.create({
    user: req.user.id,
    action: 'Promoter approved',
    resource: 'Promoter',
    resourceId: id,
    details: `Promoter ${promoter.name} was approved by admin`,
  });

  res.status(200).json({ success: true, data: promoter });
});

/**
 * @desc    Reject promoter
 * @route   POST /api/admin/promoters/:id/reject
 * @access  Private/Admin
 */
exports.rejectPromoter = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid promoter ID format', 400));
  }

  if (!reason) {
    return next(new ErrorResponse('Rejection reason is required', 400));
  }

  const promoter = await Promoter.findById(id).populate('user', 'firstName lastName email');
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id of ${id}`, 404));
  }

  promoter.approvalStatus = 'rejected';
  promoter.rejectionReason = reason;
  await promoter.save();

  await Notification.create({
    user: promoter.user._id,
    type: 'promoter_rejected',
    message: `Your promoter profile has been rejected. Reason: ${reason}`,
  });

  await Log.create({
    user: req.user.id,
    action: 'Promoter rejected',
    resource: 'Promoter',
    resourceId: id,
    details: `Promoter ${promoter.name} was rejected by admin`,
  });

  res.status(200).json({ success: true, data: promoter });
});

/**
 * @desc    Get all registration requests
 * @route   GET /api/admin/requests
 * @access  Private/Admin
 */
exports.getRegistrationRequests = asyncHandler(async (req, res, next) => {
  const { status, sort, page = 1, limit = 10 } = req.query;

  let query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const total = await RegistrationRequest.countDocuments(query);
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const pagination = {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  };

  const requests = await RegistrationRequest.find(query)
    .populate('user', 'firstName lastName email role')
    .sort(sort || '-createdAt')
    .skip(startIndex)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: requests.length,
    pagination,
    data: requests,
  });
});

/**
 * @desc    Create registration request
 * @route   POST /api/registration-requests
 * @access  Private
 */
exports.createRegistrationRequest = asyncHandler(async (req, res, next) => {
  const {
    gender,
    firstName,
    lastName,
    phoneNumber,
    email,
    companyName,
    placeOfBirth,
    city,
    country,
    termsAccepted,
  } = req.body;

  if (!termsAccepted) {
    return next(new ErrorResponse('You must accept the terms and conditions', 400));
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

   const existingRequest = await RegistrationRequest.findOne({ 
    user: req.user.id, 
    status: 'pending' 
  });
  
  if (existingRequest) {
    return res.status(200).json({ 
      success: true, 
      message: 'You already have a pending registration request',
      request: existingRequest
    });
  }

  const request = await RegistrationRequest.create({
    user: req.user.id,
    gender,
    firstName,
    lastName,
    phoneNumber,
    email,
    companyName,
    placeOfBirth,
    city,
    country,
    status: 'pending',
  });

  await Notification.create({
    user: req.user.id,
    type: 'registration_request_submitted',
    message: 'Your registration request has been submitted and is pending approval.',
  });

  await Log.create({
    user: req.user.id,
    action: 'Registration request created',
    resource: 'RegistrationRequest',
    resourceId: request._id,
    details: `Registration request created by user ${user.email}`,
  });

  res.status(201).json({ success: true, data: request });
});

/**
 * @desc    Approve registration request
 * @route   POST /api/admin/requests/:id/approve
 * @access  Private/Admin
 */
exports.approveRegistrationRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { listingLimit, goldCards } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid request ID format', 400));
  }

 const validListingLimits = [15, 50, 100, 200, 300, 400, 'unlimited'];
// Convert string numbers to integers for comparison
const parsedLimit = isNaN(parseInt(listingLimit)) 
  ? listingLimit 
  : parseInt(listingLimit);

if (!validListingLimits.includes(parsedLimit)) {
  return next(new ErrorResponse('Invalid listing limit', 400));
}

  if (isNaN(goldCards) || goldCards < 0) {
    return next(new ErrorResponse('Invalid gold cards value', 400));
  }

  const request = await RegistrationRequest.findById(id).populate('user');
  if (!request) {
    return next(new ErrorResponse(`Request not found with id of ${id}`, 404));
  }

  const user = await User.findById(request.user._id);
  if (!user) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  user.approvalStatus = 'approved';
  user.listingLimit = listingLimit === 'unlimited' ? null : parseInt(listingLimit);
  user.goldCards = parseInt(goldCards);
  await user.save();

  request.status = 'approved';
  await request.save();

  let entity;
  if (user.role === 'agent') {
    entity = await Agent.findOneAndUpdate(
      { user: user._id },
      { approvalStatus: 'approved' },
      { new: true }
    );
  } else if (user.role === 'agency') {
    entity = await Agency.findOneAndUpdate(
      { user: user._id },
      { approvalStatus: 'approved' },
      { new: true }
    );
  } else if (user.role === 'promoter') {
    entity = await Promoter.findOneAndUpdate(
      { user: user._id },
      { approvalStatus: 'approved' },
      { new: true }
    );
  }

  await Notification.create({
    user: user._id,
    type: 'registration_approved',
    message: `Your ${user.role} profile has been approved. You can now create up to ${listingLimit === null ? 'unlimited' : listingLimit} listings with ${goldCards} gold cards.`,
  });

  await Log.create({
    user: req.user.id,
    action: 'Registration approved',
    resource: 'RegistrationRequest',
    resourceId: id,
    details: `Registration request for user ${user.email} was approved by admin with ${listingLimit} listings and ${goldCards} gold cards`,
  });

  res.status(200).json({ success: true, data: { user, entity } });
});

/**
 * @desc    Reject registration request
 * @route   POST /api/admin/requests/:id/reject
 * @access  Private/Admin
 */
exports.rejectRegistrationRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid request ID format', 400));
  }

  if (!reason) {
    return next(new ErrorResponse('Rejection reason is required', 400));
  }

  const request = await RegistrationRequest.findById(id).populate('user');
  if (!request) {
    return next(new ErrorResponse(`Request not found with id of ${id}`, 404));
  }

  request.status = 'rejected';
  request.rejectionReason = reason;
  await request.save();

  await Notification.create({
    user: request.user._id,
    type: 'registration_rejected',
    message: `Your registration request has been rejected. Reason: ${reason}`,
  });

  await Log.create({
    user: req.user.id,
    action: 'Registration rejected',
    resource: 'RegistrationRequest',
    resourceId: id,
    details: `Registration request for user ${request.user.email} was rejected by admin`,
  });

  res.status(200).json({ success: true, data: request });
});

/**
 * @desc    Get all properties
 * @route   GET /api/admin/properties
 * @access  Private/Admin
 */
exports.getProperties = asyncHandler(async (req, res, next) => {
  const { status, sort, search, page = 1, limit = 10 } = req.query;

  let query = {};
  if (status && status !== 'all') {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'owner.firstName': { $regex: search, $options: 'i' } },
      { 'owner.lastName': { $regex: search, $options: 'i' } },
      { 'owner.email': { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Property.countDocuments(query);
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const pagination = {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  };

  const properties = await Property.find(query)
    .populate('owner', 'firstName lastName email')
    .populate({
      path: 'agent',
      select: 'user title isPremium approvalStatus',
      populate: { path: 'user', select: 'firstName lastName email' },
    })
    .populate('agency', 'name logoUrl approvalStatus')
    .sort(sort || '-createdAt')
    .skip(startIndex)
    .limit(parseInt(limit))
    .select('_id title description status address owner agent agency rejectionReason isGoldCard isPremium createdAt category');

  res.status(200).json({
    success: true,
    count: properties.length,
    pagination,
    data: properties,
  });
});

/**
 * @desc    Approve property
 * @route   POST /api/admin/properties/:id/approve
 * @access  Private/Admin
 */
exports.approveProperty = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const property = await Property.findById(id).populate('owner', 'email firstName lastName');
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${id}`, 404));
  }

  if (property.status === 'inactive') {
    return next(new ErrorResponse('Cannot change status of inactive property', 403));
  }

  property.status = 'approved';
  property.rejectionReason = undefined;
  await property.save();

  await Notification.create({
    user: property.owner._id,
    type: 'property_approved',
    message: `Your property "${property.title}" has been approved.`,
  });

  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      user: admin._id,
      type: 'property_approved_admin',
      message: `Property "${property.title}" by ${property.owner.firstName} ${property.owner.lastName} has been approved.`,
    });
  }

  await Log.create({
    user: req.user.id,
    action: 'Property approved',
    resource: 'Property',
    resourceId: id,
    details: `Property ${property.title} was approved by admin`,
  });

  res.status(200).json({ success: true, data: property });
});

/**
 * @desc    Reject property
 * @route   POST /api/admin/properties/:id/reject
 * @access  Private/Admin
 */
exports.rejectProperty = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  if (!reason) {
    return next(new ErrorResponse('Rejection reason is required', 400));
  }

  const property = await Property.findById(id).populate('owner', 'email firstName lastName');
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${id}`, 404));
  }

  if (property.status === 'inactive') {
    return next(new ErrorResponse('Cannot change status of inactive property', 403));
  }

  property.status = 'rejected';
  property.rejectionReason = reason;
  await property.save();

  await Notification.create({
    user: property.owner._id,
    type: 'property_rejected',
    message: `Your property "${property.title}" has been rejected. Reason: ${reason}`,
  });

  await Log.create({
    user: req.user.id,
    action: 'Property rejected',
    resource: 'Property',
    resourceId: id,
    details: `Property ${property.title} was rejected by admin`,
  });

  res.status(200).json({ success: true, data: property });
});

/**
 * @desc    Update property
 * @route   PUT /api/admin/properties/:id
 * @access  Private/Admin
 */
exports.updateProperty = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const {
    title,
    description,
    price,
    address,
    bedrooms,
    bathrooms,
    size,
    category,
    isGoldCard,
    isPremium,
  } = req.body;

  const fieldsToUpdate = {};
  if (title) fieldsToUpdate.title = title;
  if (description) fieldsToUpdate.description = description;
  if (price) fieldsToUpdate.price = price;
  if (address) fieldsToUpdate.address = address;
  if (bedrooms) fieldsToUpdate.bedrooms = bedrooms;
  if (bathrooms) fieldsToUpdate.bathrooms = bathrooms;
  if (size) fieldsToUpdate.size = size;
  if (category) fieldsToUpdate.category = category;
  if (isGoldCard !== undefined) fieldsToUpdate.isGoldCard = isGoldCard;
  if (isPremium !== undefined) fieldsToUpdate.isPremium = isPremium;

  const property = await Property.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).populate('owner agent agency');

  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${id}`, 404));
  }

  await Log.create({
    user: req.user.id,
    action: 'Property updated',
    resource: 'Property',
    resourceId: id,
    details: `Property ${property.title} was updated by admin`,
  });

  res.status(200).json({ success: true, data: property });
});

/**
 * @desc    Delete property
 * @route   DELETE /api/admin/properties/:id
 * @access  Private/Admin
 */
exports.deleteProperty = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid property ID format', 400));
  }

  const property = await Property.findById(id);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${id}`, 404));
  }

  await Property.deleteOne({ _id: id });

  await Log.create({
    user: req.user.id,
    action: 'Property deleted',
    resource: 'Property',
    resourceId: id,
    details: `Property ${property.title} was deleted by admin`,
  });

  res.status(200).json({ success: true, data: {} });
});