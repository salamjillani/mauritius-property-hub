const express = require('express');
const router = express.Router();
const {
  getPromoters,
  getPromoter,
  createPromoter,
  updatePromoter,
  deletePromoter,
  getPromoterProjects,
  getMyPromoterProfile,
  updateMyPromoterProfile,
  getPromoterCloudinarySignature
} = require('../controllers/promoters');
const { protect, authorize } = require('../middleware/auth');

// Promoter-specific routes (no admin required)
router.get('/my-profile', protect, authorize('promoter'), getMyPromoterProfile);
router.put('/my-profile', protect, authorize('promoter'), updateMyPromoterProfile);
router.get('/cloudinary-signature', protect, authorize('promoter'), getPromoterCloudinarySignature);

// Allow promoters to create their own profile
router.post('/', protect, authorize('promoter'), createPromoter);

// Admin-only routes
router.use(protect);
router.use(authorize('admin'));

router.get('/', getPromoters);

router
  .route('/:id')
  .get(getPromoter)
  .put(updatePromoter)
  .delete(deletePromoter);

// Promoter Projects
router.get('/:id/projects', getPromoterProjects);

module.exports = router;