// controllers/notifications.js
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Notification = require('../models/Notification');

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true, runValidators: true }
  );

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this notification', 403));
  }

  res.status(200).json({ success: true, data: notification });
});

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = asyncHandler(async (req, res, next) => {
  const { userId, type, message } = req.body;

  const notification = await Notification.create({
    user: userId,
    type,
    message,
  });

  res.status(201).json({ success: true, data: notification });
});