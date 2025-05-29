// backend/routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const { createRegistrationRequest } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('agent', 'agency', 'promoter'));

router.post('/', createRegistrationRequest);

module.exports = router;