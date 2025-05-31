const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Promoter = require('../models/Promoter');
const Property = require('../models/Property');
const AuditLog = require('../models/Log');

exports.getMyPromoterProfile = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findOne({ user: req.user.id });
  
  if (!promoter) {
    return next(new ErrorResponse('No promoter profile found for this user', 404));
  }

  res.status(200).json({ success: true, data: promoter });
});

// Get all promoters
exports.getPromoters = asyncHandler(async (req, res, next) => {
  const { name, status } = req.query;
  const query = {};
  if (name) query.name = { $regex: name, $options: 'i' };
  if (status) query.status = status;

  const promoters = await Promoter.find(query);
  res.status(200).json({ success: true, count: promoters.length, data: promoters });
});

// Get single promoter
exports.getPromoter = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findById(req.params.id);
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: promoter });
});

// Create promoter
exports.createPromoter = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.create(req.body);

  await AuditLog.create({
    user: req.user.id,
    action: 'create_promoter',
    resourceId: promoter._id,
    resourceType: 'Promoter',
  });

  res.status(201).json({ success: true, data: promoter });
});

exports.updatePromoter = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: promoter });
});

// Delete promoter
exports.deletePromoter = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findById(req.params.id);
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id ${req.params.id}`, 404));
  }

  // Check for associated properties
  const properties = await Property.find({ promoter: req.params.id });
  if (properties.length > 0) {
    return next(
      new ErrorResponse(
        'Cannot delete promoter with associated properties',
        400
      )
    );
  }

  await promoter.deleteOne();

  await AuditLog.create({
    user: req.user.id,
    action: 'delete_promoter',
    resourceId: req.params.id,
    resourceType: 'Promoter',
  });

  res.status(200).json({ success: true, data: {} });
});

// Get promoter projects/properties
exports.getPromoterProjects = asyncHandler(async (req, res, next) => {
  const promoter = await Promoter.findById(req.params.id);
  if (!promoter) {
    return next(new ErrorResponse(`Promoter not found with id ${req.params.id}`, 404));
  }

  const properties = await Property.find({ promoter: req.params.id }).select(
    'title price properties status'
  );
  res.status(200).json({ success: true, count: properties.length, data: properties });
});