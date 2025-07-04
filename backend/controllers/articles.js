const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Article = require('../models/Article');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');

exports.getArticles = asyncHandler(async (req, res, next) => {
  const articles = await Article.find()
    .populate('author', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: articles.length,
    data: articles,
  });
});

exports.getArticle = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid article ID format', 400));
  }

  const article = await Article.findById(req.params.id)
    .populate('author', 'firstName lastName');

  if (!article) {
    return next(
      new ErrorResponse(`Article not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: article,
  });
});

exports.createArticle = asyncHandler(async (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to create articles', 403));
  }

  const { title, content, image, imagePublicId } = req.body;
  if (!title || !content) {
    return next(new ErrorResponse('Please provide title and content', 400));
  }

  req.body.author = req.user.id;

  try {
    const article = await Article.create({
      title,
      content,
      image: image || '',
      imagePublicId: imagePublicId || '',
      author: req.user.id,
    });

    await article.populate('author', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    return next(new ErrorResponse('Failed to create article', 500));
  }
});

exports.updateArticle = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid article ID format', 400));
  }

  let article = await Article.findById(req.params.id);

  if (!article) {
    return next(
      new ErrorResponse(`Article not found with id of ${req.params.id}`, 404)
    );
  }

  if (
    article.author.toString() !== req.user.id &&
    !['admin', 'sub-admin'].includes(req.user.role)
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this article`,
        401
      )
    );
  }

  let updateData = { ...req.body };
  delete updateData.author;

  if (updateData.image === '' || updateData.imagePublicId === '') {
    if (article.imagePublicId) {
      await cloudinary.uploader.destroy(article.imagePublicId);
    }
  }

  try {
    article = await Article.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('author', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    return next(new ErrorResponse('Failed to update article', 500));
  }
});

exports.deleteArticle = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid article ID format', 400));
  }

  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(
      new ErrorResponse(`Article not found with id of ${req.params.id}`, 404)
    );
  }

  if (
    article.author.toString() !== req.user.id &&
    !['admin', 'sub-admin'].includes(req.user.role)
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this article`,
        401
      )
    );
  }

  if (article.imagePublicId) {
    await cloudinary.uploader.destroy(article.imagePublicId);
  }

  await article.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});