const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Article = require('../models/Article');
const cloudinary = require('../utils/cloudinaryUpload');
const mongoose = require('mongoose');

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
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

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Public
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

// @desc    Create new article
// @route   POST /api/articles
// @access  Private/Admin
exports.createArticle = asyncHandler(async (req, res, next) => {
  // Check authorization
  if (!['admin', 'sub-admin'].includes(req.user.role)) {
    return next(new ErrorResponse('Not authorized to create articles', 403));
  }

  // Validate required fields
  const { title, content } = req.body;
  if (!title || !content) {
    return next(new ErrorResponse('Please provide title and content', 400));
  }

  // Add user to req.body
  req.body.author = req.user.id;

  let imageUrl = '';
  let publicId = '';

  // Handle image upload
  if (req.files && req.files.image) {
    const file = req.files.image;
    
    // Validate file
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }
    
    // Check file size (default to 5MB if not set)
    const maxFileSize = process.env.MAX_FILE_UPLOAD || 5000000;
    if (file.size > maxFileSize) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${maxFileSize / 1000000}MB`,
          400
        )
      );
    }

    // Upload to Cloudinary
    try {
      const result = await cloudinary.uploadImage(file.tempFilePath, 'articles');
      imageUrl = result.url;
      publicId = result.public_id || result.publicId; // Handle both possible property names
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return next(new ErrorResponse('Problem with image upload', 500));
    }
  }

  try {
    const article = await Article.create({
      title,
      content,
      author: req.user.id,
      image: imageUrl,
      imagePublicId: publicId,
    });

    // Populate author before sending response
    await article.populate('author', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Article creation error:', error);
    
    // Clean up uploaded image if article creation fails
    if (publicId) {
      try {
        await cloudinary.deleteImage(publicId);
      } catch (deleteError) {
        console.error('Error cleaning up uploaded image:', deleteError);
      }
    }
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    
    return next(new ErrorResponse('Failed to create article', 500));
  }
});

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private/Admin
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

  // Verify ownership
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
  delete updateData.author; // Prevent author from being changed

  // Handle image upload if new image is provided
  if (req.files && req.files.image) {
    const file = req.files.image;
    
    // Validate file
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }
    
    // Check file size
    const maxFileSize = process.env.MAX_FILE_UPLOAD || 5000000;
    if (file.size > maxFileSize) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${maxFileSize / 1000000}MB`,
          400
        )
      );
    }

    // Upload to Cloudinary
    try {
      const result = await cloudinary.uploadImage(file.tempFilePath, 'articles');
      updateData.image = result.url;
      updateData.imagePublicId = result.public_id || result.publicId;
      
      // Delete old image if exists
      if (article.imagePublicId) {
        try {
          await cloudinary.deleteImage(article.imagePublicId);
        } catch (err) {
          console.error(`Error deleting old image: ${article.imagePublicId}`, err);
        }
      }
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return next(new ErrorResponse('Problem with image upload', 500));
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
    console.error('Article update error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    
    return next(new ErrorResponse('Failed to update article', 500));
  }
});

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
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

  // Verify ownership
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

  // Delete image from Cloudinary if exists
  if (article.imagePublicId) {
    try {
      await cloudinary.deleteImage(article.imagePublicId);
    } catch (err) {
      console.error(`Error deleting image: ${article.imagePublicId}`, err);
    }
  }

  await article.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});