const Inquiry = require("../models/Inquiry");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

exports.createInquiry = asyncHandler(async (req, res, next) => {
  const inquiry = await Inquiry.create(req.body);

  res.status(201).json({
    success: true,
    data: inquiry,
  });
});

exports.getInquiries = asyncHandler(async (req, res, next) => {
  const query = req.user.role === "agent"
    ? { agent: req.body.agentId }
    : req.user.role === "admin"
    ? {}
    : {};

  const inquiries = await Inquiry.find(query)
    .populate("property", "title")
    .populate("agent", "user")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: inquiries.length,
    data: inquiries,
  });
});