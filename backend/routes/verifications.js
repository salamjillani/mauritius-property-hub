const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitVerification,
  getVerifications,
  updateVerification,
} = require('../controllers/verification');

router.route('/').post(protect, submitVerification).get(protect, authorize('admin'), getVerifications);
router.route('/:id').put(protect, authorize('admin'), updateVerification);

module.exports = router;