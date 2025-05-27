// routes/reviews.js
const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/reviews');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/:propertyId', getReviews);

module.exports = router;