const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const RegistrationRequest = require('../models/RegistrationRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createRegistrationRequest = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.approvalStatus !== 'pending') {
    return next(new ErrorResponse(`Your ${user.role} profile is already ${user.approvalStatus}`, 400));
  }

  const existingRequest = await RegistrationRequest.findOne({ user: req.user.id });
  if (existingRequest) {
    return next(new ErrorResponse('You already have a pending registration request', 400));
  }

  req.body.user = req.user.id;
  const request = await RegistrationRequest.create(req.body);

  await Notification.create({
    user: req.user.id,
    type: 'registration_submitted',
    message: 'Your registration request has been submitted and is pending approval.',
  });

  res.status(201).json({ success: true, data: request });
});