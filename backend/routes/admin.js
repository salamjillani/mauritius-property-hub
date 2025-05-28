const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  updateUser,
  deleteUser,
  getAgents,
  approveAgent,
  updateAgent,
  deleteAgent,
  getAgencies,
  updateAgency,
  deleteAgency,
  getDevelopers,
  getProperties,
  approveProperty,
  rejectProperty,
  updateProperty,
  deleteProperty,
  updateSubscription,
  notifyNewProperty,
  getSubscriptions,
  getAuditLogs,
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

// Apply admin-only middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// User Management
router
  .route('/users')
  .get(getUsers);
router
  .route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

// Agent Management
router
  .route('/agents')
  .get(getAgents);
router
  .route('/agents/:id')
  .put(updateAgent)
  .delete(deleteAgent);
router.post('/agents/:id/approve', approveAgent);

// Agency Management
router
  .route('/agencies')
  .get(getAgencies);
router
  .route('/agencies/:id')
  .put(updateAgency)
  .delete(deleteAgency);

// Developer Management (replacing 'promoters')
router
  .route('/developers')
  .get(getDevelopers);

// Property Management
router
  .route('/properties')
  .get(getProperties);
router
  .route('/properties/:id')
  .put(updateProperty)
  .delete(deleteProperty);
router.post('/properties/:id/approve', approveProperty);
router.post('/properties/:id/reject', rejectProperty);
router.post('/properties/notify', notifyNewProperty);

// Subscription Management
router
  .route('/subscriptions')
  .get(getSubscriptions);
router
  .route('/subscriptions/:id')
  .put(updateSubscription);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;