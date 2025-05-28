const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const SupportTicket = require('../models/SupportTicket');
const mongoose = require('mongoose');

// @desc    Create a support ticket
// @route   POST /api/support/tickets
// @access  Private
exports.createTicket = asyncHandler(async (req, res, next) => {
  const { subject, description } = req.body;

  const ticket = await SupportTicket.create({
    user: req.user.id,
    subject,
    description,
  });

  res.status(201).json({ success: true, data: ticket });
});

// @desc    Get all support tickets
// @route   GET /api/support/tickets
// @access  Private/Admin
exports.getTickets = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to access tickets', 403));
  }

  const tickets = await SupportTicket.find().populate('user', 'firstName lastName email');

  res.status(200).json({
    success: true,
    count: tickets.length,
    data: tickets,
  });
});

// @desc    Update support ticket
// @route   PUT /api/support/tickets/:id
// @access  Private/Admin
exports.updateTicket = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to update tickets', 403));
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid ticket ID format', 400));
  }

  const ticket = await SupportTicket.findById(id);
  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id of ${id}`, 404));
  }

  ticket.status = status || ticket.status;
  await ticket.save();

  res.status(200).json({ success: true, data: ticket });
});

// @desc Delete support ticket
// @route   DELETE /api//support/tickets/:id
// @access  Private/Admin
exports.deleteTicket = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to delete tickets', 403));
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid ticket ID format', 400));
  }

  const ticket = await SupportTicket.findById(id);
  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id of ${id}`, 404));
  }

  await SupportTicket.deleteOne({ _id: id });

  res.status(200).json({ success: true, data: {} });
});