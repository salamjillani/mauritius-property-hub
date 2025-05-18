// routes/properties.js - Update with new Cloudinary route

const express = require('express');
const { 
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  uploadPropertyImages,
  getPropertiesByCategory,
  getCloudinarySignature  // Add this new function
} = require('../controllers/properties');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getProperties)
  .post(protect, createProperty);

router.get('/featured', getFeaturedProperties);
router.get('/category/:categorySlug', getPropertiesByCategory);

// Add new Cloudinary signature route
router.get('/cloudinary-signature', protect, getCloudinarySignature);

router.route('/:id')
  .get(getProperty)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

router.route('/:id/images')
  .post(protect, uploadPropertyImages);

module.exports = router;