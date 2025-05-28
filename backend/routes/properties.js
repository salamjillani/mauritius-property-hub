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
  getPropertyByCategory,
  getCloudinarySignature,
  searchProperties,
} = require('../controllers/properties');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/category/:categorySlug', getPropertiesByCategory);
router.get('/search', searchProperties);
router.get('/:category/:id', getPropertyByCategory);
router.get('/:id', getProperty);

// Protected routes
router.post('/', protect, authorize('agent', 'agency', 'promoter', 'admin'), createProperty);
router.get('/cloudinary-signature', protect, getCloudinarySignature);
router
  .route('/:id')
  .put(protect, authorize('agent', 'agency', 'promoter', 'admin'), updateProperty)
  .delete(protect, authorize('agent', 'agency', 'promoter', 'admin'), deleteProperty);
router.route('/:id/images').post(protect, authorize('agent', 'agency', 'promoter', 'admin'), uploadPropertyImages);
router
  .route('/:id/images/:imageId')
  .delete(protect, authorize('agent', 'agency', 'promoter', 'admin'), require('../controllers/properties').deletePropertyImage);

module.exports = router;