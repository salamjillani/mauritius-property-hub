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

router.get('/my-profile', protect, authorize('promoter'), getMyPromoterProfile);
router.put('/my-profile', protect, authorize('promoter'), updateMyPromoterProfile);
router.get('/cloudinary-signature', protect, authorize('promoter'), getPromoterCloudinarySignature);

// PUBLIC ROUTES (no authentication required)
router.get('/', getPromoters); 
router.get('/:id', getPromoter); 
router.get('/:id/projects', getPromoterProjects);


// Allow promoters to create their own profile
router.post('/', protect, authorize('promoter'), createPromoter);

// ADMIN-ONLY ROUTES (admin authentication required)
router.put('/:id', protect, authorize('admin'), updatePromoter);
router.delete('/:id', protect, authorize('admin'), deletePromoter);

module.exports = router;