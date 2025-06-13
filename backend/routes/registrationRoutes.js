// backend/routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const { createRegistrationRequest } = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('individual', 'agent', 'agency', 'promoter'));

router.post('/', createRegistrationRequest);

module.exports = router;