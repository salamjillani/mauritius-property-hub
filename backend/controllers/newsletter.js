const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribeNewsletter = asyncHandler(async (req, res, next) => {
  const { email } = req.body.email;

  const existing = await Newsletter.findOne({ email });
  if (existing) {
    return next(new ErrorResponse('Email already subscribed', 400));
  }

  const subscriber = await Newsletter.create({ email });

  res.status(201).json({ success: true, data: subscriber });
});

// @desc  Get all newsletter subscribers
// @route   GET /api/admin/newsletter/subscribers
// @access  Private/Admin
exports.getSubscribers = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to access subscribers', 403));
  }

  const subscribers = await Newsletter.find();

  res.status(200).json({
    success: true,
    count: subscribers.length,
    data: subscribers,
  });
});

// @desc    Send newsletter campaign
// @route   POST /api/admin/newsletter/send
// @access  Private/Admin
exports.sendNewsletter = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to send newsletter', 403));
  }

  const { subject, content } = req.body;

  const subscribers = await Newsletter.find();

  // Simulate sending email (replace with actual email service like SendGrid)
  console.log(`Sending newsletter to ${subscribers.length} subscribers with subject: ${subject}`);
  // Example: await sendEmail(subscribers, subject, content);

  res.status(200).json({ success: true, message: 'Newsletter sent' });
});