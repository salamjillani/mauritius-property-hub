const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  getCloudinarySignature,
} = require('../controllers/advertisements');

router.route('/')
  .get(protect, authorize('admin', 'sub-admin'), getAdvertisements)
  .post(protect, authorize('admin', 'sub-admin'), createAdvertisement);
router.route('/:id')
  .put(protect, authorize('admin', 'sub-admin'), updateAdvertisement)
  .delete(protect, authorize('admin', 'sub-admin'), deleteAdvertisement);
router.route('/cloudinary-signature')
  .get(protect, authorize('admin', 'sub-admin'), getCloudinarySignature);

module.exports = router;