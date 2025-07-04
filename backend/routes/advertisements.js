const express = require('express');
const {
  getAdvertisements,
  getActiveAdvertisements,
  getAdvertisement,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement
} = require('../controllers/advertisements');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAdvertisements);
router.get('/active', getActiveAdvertisements);
router.get('/:id', getAdvertisement);

// Protected routes (Admin only) - using express-fileupload (no additional middleware needed)
router.post('/', protect, createAdvertisement);
router.put('/:id', protect, updateAdvertisement);
router.delete('/:id', protect, deleteAdvertisement);

module.exports = router;