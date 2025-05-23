const express = require('express');
const { 
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  uploadAgentPhoto,
  getPremiumAgents,
  linkAgentToAgency,
  getAgentCloudinarySignature,
  approveAgent
} = require('../controllers/agents');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAgents)
  .post(protect, authorize('agent', 'admin'), createAgent);

router.get('/premium', getPremiumAgents);

router.get('/cloudinary-signature', protect, getAgentCloudinarySignature);

router.route('/:id')
  .get(getAgent)
  .put(protect, updateAgent)
  .delete(protect, deleteAgent);

router.route('/:id/photo')
  .post(protect, uploadAgentPhoto);

router.route('/:id/agency/:agencyId')
  .put(protect, linkAgentToAgency);

router.route('/:id/approve')
  .put(protect, authorize('agency', 'admin'), approveAgent);

module.exports = router;