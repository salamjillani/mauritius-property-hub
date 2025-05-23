// routes/favorites.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favorites');

router.post('/', protect, addFavorite);
router.delete('/:propertyId', protect, removeFavorite);
router.get('/', protect, getFavorites);

module.exports = router;