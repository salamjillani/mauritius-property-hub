// routes/admin.js
const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  updateUser,
  deleteUser,
  getAgents,
  getAgencies,
  getPromoters,
  getProperties,
  approveProperty,
  updateSubscription,
  getLogs,
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/agents', getAgents);
router.get('/agencies', getAgencies);
router.get('/promoters', getPromoters);
router.get('/properties', getProperties);
router.put('/properties/:id/approve', approveProperty);
router.put('/subscriptions/:id', updateSubscription);
router.get('/logs', getLogs);

module.exports = router;