const express = require('express');
const router = express.Router();
const {
  getPromoters,
  getPromoter,
  createPromoter,
  updatePromoter,
  deletePromoter,
  getPromoterProjects,
} = require('../controllers/promoters');
const { protect, authorize } = require('../middleware/auth');

// Apply admin-only middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// Promoter Management
router
  .route('/')
  .get(getPromoters)
  .post(createPromoter);

router
  .route('/:id')
  .get(getPromoter)
  .put(updatePromoter)
  .delete(deletePromoter);

// Promoter Projects
router.get('/:id/projects', getPromoterProjects);

module.exports = router;