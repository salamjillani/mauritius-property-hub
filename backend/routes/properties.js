
const express = require('express');
const { 
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  uploadPropertyImages,
  getPropertiesByCategory
} = require('../controllers/properties');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getProperties)
  .post(protect, createProperty);

router.get('/featured', getFeaturedProperties);
router.get('/category/:categorySlug', getPropertiesByCategory);

router.route('/:id')
  .get(getProperty)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

router.route('/:id/images')
  .post(protect, uploadPropertyImages);

module.exports = router;
