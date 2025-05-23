const Inquiry = require('../models/Inquiry');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Public
const createInquiry = asyncHandler(async (req, res, next) => {
  const inquiry = await Inquiry.create(req.body);
  res.status(201).json({ success: true, data: inquiry });
});

// @desc    Get inquiries for an agent
// @route   GET /api/inquiries/agent/:agentId
// @access  Private
const getAgentInquiries = asyncHandler(async (req, res, next) => {
  const inquiries = await Inquiry.find({ agentId: req.params.agentId }).populate('propertyId', 'title');
  res.status(200).json({ success: true, data: inquiries });
});

module.exports = { createInquiry, getAgentInquiries };