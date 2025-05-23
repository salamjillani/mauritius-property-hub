const express = require('express');
const { 
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  uploadAgentPhoto,
  getPremiumAgents,
  getAgentCloudinarySignature,
  requestLinkToAgency,
  approveAgentLink,
  rejectAgentLink,
  getLinkingRequests
} = require('../controllers/agents');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAgents)
  .post(protect, authorize('agent', 'admin'), createAgent);

router.get('/premium', getPremiumAgents);

router.get('/cloudinary-signature', protect, getAgentCloudinarySignature);

router.get('/linking-requests', protect, authorize('agency', 'admin'), getLinkingRequests);

router.route('/:id')
  .get(getAgent)
  .put(protect, updateAgent)
  .delete(protect, deleteAgent);

router.route('/:id/photo')
  .post(protect, uploadAgentPhoto);

router.route('/request-link')
  .post(protect, authorize('agent', 'admin'), requestLinkToAgency);

router.route('/:agentId/approve/:requestId')
  .put(protect, authorize('agency', 'admin'), approveAgentLink);

router.route('/:agentId/reject/:requestId')
  .put(protect, authorize('agency', 'admin'), rejectAgentLink);

module.exports = router;