
const express = require('express');
const { 
  getAgencies,
  getAgency,
  createAgency,
  updateAgency,
  deleteAgency,
  uploadAgencyLogo,
  getPremiumAgencies
} = require('../controllers/agencies');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAgencies)
  .post(protect, authorize('agency', 'admin'), createAgency);

router.get('/premium', getPremiumAgencies);

router.route('/:id')
  .get(getAgency)
  .put(protect, authorize('agency', 'admin'), updateAgency)
  .delete(protect, authorize('agency', 'admin'), deleteAgency);

router.route('/:id/logo')
  .post(protect, authorize('agency', 'admin'), uploadAgencyLogo);

module.exports = router;
