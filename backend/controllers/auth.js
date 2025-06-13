const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

const crypto = require('crypto');

exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, accountType, phone } = req.body;

 if (!['individual', 'agent', 'agency', 'promoter'].includes(accountType)) {
    return next(new ErrorResponse('Invalid account type', 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    role: accountType,
    approvalStatus: 'pending',
  });

  sendTokenResponse(user, 201, res);
});

exports.adminRegister = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, adminSecret } = req.body;

  if (process.env.ADMIN_SECRET && adminSecret !== process.env.ADMIN_SECRET) {
    return next(new ErrorResponse('Invalid admin secret', 403));
  }

  const existingAdmin = await User.findOne({ email, role: 'admin' });
  if (existingAdmin) {
    return next(new ErrorResponse('Admin with this email already exists', 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: 'admin',
    approvalStatus: 'approved',
  });

  sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

exports.adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email, role: 'admin' }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse('Invalid admin credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone } = req.body;
  
  const fieldsToUpdate = {
    firstName, 
    lastName,
    email,
    phone
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: user });
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
        listingLimit: user.listingLimit,
        goldCards: user.goldCards
      }
    });
};