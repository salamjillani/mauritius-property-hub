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
  getAgentCloudinarySignature // Add this new import
} = require('../controllers/agents');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAgents)
  .post(protect, authorize('agent', 'admin'), createAgent);

router.get('/premium', getPremiumAgents);

// Add the new Cloudinary signature route
router.get('/cloudinary-signature', protect, getAgentCloudinarySignature);

router.route('/:id')
  .get(getAgent)
  .put(protect, updateAgent)
  .delete(protect, deleteAgent);

router.route('/:id/photo')
  .post(protect, uploadAgentPhoto);

router.route('/:id/agency/:agencyId')
  .put(protect, linkAgentToAgency);

module.exports = router;