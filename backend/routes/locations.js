const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} = require('../controllers/locations');

router.route('/')
  .get(getLocations)
  .post(protect, authorize('admin', 'sub-admin'), createLocation);
router.route('/:id')
  .put(protect, authorize('admin', 'sub-admin'), updateLocation)
  .delete(protect, authorize('admin', 'sub-admin'), deleteLocation);

module.exports = router;