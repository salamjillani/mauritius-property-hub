const express = require('express');
const router = express.Router();
const {
  createAd,
  getAds,
  updateAdStatus,
  getActiveAd,
  getCloudinarySignature,
} = require('../controllers/adController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.route('/active').get(getActiveAd);

// Protected routes
router.use(protect);

router.route('/').post(createAd);
router.route('/cloudinary-signature').get(getCloudinarySignature);

// Admin routes
router.use(authorize('admin', 'sub-admin'));
router.route('/').get(getAds); // Changed to /api/ads
router.route('/:id').put(updateAdStatus);

module.exports = router;