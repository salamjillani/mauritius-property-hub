const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getContentPages,
  getContentPage,
  createContentPage,
  updateContentPage,
  deleteContentPage,
} = require('../controllers/content');

router.route('/')
  .get(getContentPages)
  .post(protect, authorize('admin', 'sub-admin'), createContentPage);
router.route('/:slug').get(getContentPage);
router.route('/:id')
  .put(protect, authorize('admin', 'sub-admin'), updateContentPage)
  .delete(protect, authorize('admin', 'sub-admin'), deleteContentPage);

module.exports = router;