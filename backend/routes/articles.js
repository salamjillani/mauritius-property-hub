const express = require('express');
const { protect, authorize } = require('../middleware/auth');

// Remove duplicate controller imports
const { 
  getArticles, 
  getArticle, 
  createArticle, 
  updateArticle, 
  deleteArticle 
} = require('../controllers/articles');

const router = express.Router();

// Use controller functions instead of inline handlers
router.get('/', getArticles);
router.get('/:id', getArticle);
router.post('/', protect, authorize('admin', 'sub-admin'), createArticle);
router.put('/:id', protect, authorize('admin', 'sub-admin'), updateArticle);
router.delete('/:id', protect, authorize('admin', 'sub-admin'), deleteArticle);

module.exports = router;