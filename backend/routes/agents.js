const express = require('express');
const { 
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  uploadAgentPhoto,
  getPremiumAgents,
  getMyAgentProfile,
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
router.get('/my-profile', protect, getMyAgentProfile);
router.route('/:id')
  .get(getAgent)
  .put(protect, updateAgent)
  .delete(protect, deleteAgent);

router.route('/:id/photo')
  .post(protect, uploadAgentPhoto);

router.post('/request-link', protect, requestLinkToAgency);
router.put('/:agentId/approve/:requestId', protect, authorize('agency', 'admin'), approveAgentLink);
router.put('/:agentId/reject/:requestId', protect, authorize('agency', 'admin'), rejectAgentLink);

module.exports = router;