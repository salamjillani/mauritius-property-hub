// routes/availability.js
const express = require('express');
const router = express.Router();
const { getAvailability, createAvailability } = require('../controllers/availability');
const { protect } = require('../middleware/auth');

router.get('/:propertyId', getAvailability);
router.post('/', protect, createAvailability);

module.exports = router;