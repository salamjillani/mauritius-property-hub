const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  featureProperty
} = require('../controllers/subscriptions');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/users');
const {
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/properties');

// Admin-only routes
router.use(protect, authorize('admin'));

router.route('/subscriptions')
  .get(getSubscriptions)
  .post(createSubscription);

router.route('/subscriptions/:id')
  .get(getSubscription)
  .put(updateSubscription);

router.route('/subscriptions/:id/feature-property')
  .post(featureProperty);

router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/properties')
  .get(getProperties);

router.route('/properties/:id')
  .get(getProperty)
  .put(updateProperty)
  .delete(deleteProperty);

module.exports = router;