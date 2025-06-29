const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Article = require('../models/Article');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/articles', asyncHandler(async (req, res, next) => {
  const articles = await Article.find().populate('author', 'firstName lastName');
  res.status(200).json({ success: true, count: articles.length, data: articles });
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id).populate('author', 'firstName lastName');
  if (!article) {
    return next(new ErrorResponse(`Article not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: article });
}));

router.post('/', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  req.body.author = req.user.id;
  const article = await Article.create(req.body);
  res.status(201).json({ success: true, data: article });
}));

router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let article = await Article.findById(req.params.id);
  if (!article) {
    return next(new ErrorResponse(`Article not found with id of ${req.params.id}`, 404));
  }
  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this article`, 401));
  }
  article = await Article.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ success: true, data: article });
}));

router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    return next(new ErrorResponse(`Article not found with id of ${req.params.id}`, 404));
  }
  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete this article`, 401));
  }
  await article.deleteOne();
  res.status(200).json({ success: true, data: {} });
}));

module.exports = router;