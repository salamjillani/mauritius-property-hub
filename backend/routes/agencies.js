const express = require('express');
const {
  getAgencies,
  getAgency,
  createAgency,
  updateAgency,
  deleteAgency,
  getApprovedAgencies,
  uploadAgencyLogo,
  getPremiumAgencies,
  getAgencyCloudinarySignature,
  getMyAgency,
  upgradePlan,
} = require('../controllers/agencies');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAgencies)
  .post(protect, authorize('agency', 'admin'), createAgency);

router.get('/premium', getPremiumAgencies);

router.get('/cloudinary-signature', protect, authorize('agency', 'admin'), getAgencyCloudinarySignature);

router.get('/approved', protect, getApprovedAgencies);
router.get('/my-agency', protect, getMyAgency);
router.put('/:id', protect, authorize('agency', 'admin'), updateAgency);
router.post('/:id/logo', protect, authorize('agency', 'admin'), uploadAgencyLogo);
router.route('/upgrade-plan').post(protect, upgradePlan);

module.exports = router;