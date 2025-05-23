const express = require('express');
const { createInquiry, getAgentInquiries } = require('../controllers/inquiries');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', createInquiry);
router.get('/agent/:agentId', protect, authorize('agent', 'admin'), getAgentInquiries);

module.exports = router;