// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getUsers,
  updateUser,
  deleteUser,
  getAgents,
  updateAgent,
  deleteAgent,
  approveAgent,
  rejectAgent,
  getAgencies,
  updateAgency,
  deleteAgency,
  approveAgency,
  rejectAgency,
  getPromoters,
  updatePromoter,
  deletePromoter,
  approvePromoter,
  rejectPromoter,
  getRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  getProperties,
  approveProperty,
  rejectProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'sub-admin'));

router.get('/dashboard', getDashboardData);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/agents', getAgents);
router.put('/agents/:id', updateAgent);
router.delete('/agents/:id', deleteAgent);
router.post('/agents/:id/approve', approveAgent);
router.post('/agents/:id/reject', rejectAgent);
router.get('/agencies', getAgencies);
router.put('/agencies/:id', updateAgency);
router.delete('/agencies/:id', deleteAgency);
router.post('/agencies/:id/approve', approveAgency);
router.post('/agencies/:id/reject', rejectAgency);
router.get('/promoters', getPromoters);
router.put('/promoters/:id', updatePromoter);
router.delete('/promoters/:id', deletePromoter);
router.post('/promoters/:id/approve', approvePromoter);
router.post('/promoters/:id/reject', rejectPromoter);
router.get('/requests', getRegistrationRequests);
router.post('/requests/:id/approve', approveRegistrationRequest);
router.post('/requests/:id/reject', rejectRegistrationRequest);
router.get('/properties', getProperties);
router.post('/properties/:id/approve', approveProperty);
router.post('/properties/:id/reject', rejectProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);

module.exports = router;