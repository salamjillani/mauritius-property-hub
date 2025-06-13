const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  getFeaturedProperties,
  getPropertiesByCategory,
  getPropertyByCategory,
  uploadPropertyImages,
  deletePropertyImage,
  getCloudinarySignature,
} = require('../controllers/properties');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// CRITICAL: Place specific routes BEFORE parameterized routes
// This prevents route conflicts where specific paths are treated as parameters

// Cloudinary signature route - MUST come first
router.route('/cloudinary-signature').get(protect, getCloudinarySignature);

// Search route
router.route('/search').get(searchProperties);

// Featured properties route
router.route('/featured').get(getFeaturedProperties);

// Category-based routes
router.route('/category/:categorySlug').get(getPropertiesByCategory);

// Main properties routes (base route)
router
  .route('/')
  .get(getProperties)
  .post(protect, authorize('individual', 'agent', 'agency', 'promoter', 'admin'), createProperty);

// Routes with ID parameter - MUST come after all specific routes
router
  .route('/:id')
  .get(getProperty)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

// Image management routes (these use :id parameter)
router
  .route('/:id/images')
  .post(protect, uploadPropertyImages);

router
  .route('/:id/images/:imageId')
  .delete(protect, deletePropertyImage);

// Category and ID route (this uses both :category and :id parameters)
router.route('/:category/:id').get(getPropertyByCategory);

module.exports = router;