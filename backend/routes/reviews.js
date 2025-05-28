const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');

router.route('/:propertyId').get(getReviews);
router.route('/').post(protect, createReview);
router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);

module.exports = router;