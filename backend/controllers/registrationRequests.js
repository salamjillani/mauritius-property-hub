const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const RegistrationRequest = require('../models/RegistrationRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Log = require('../models/Log');

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
    termsAccepted
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