// backend/routes/userRoutes.js
const express = require('express');
const {
  getUsers,
  getUser,
  getMe,
  createUser,
  updateUser,
  deleteUser,
  updateMe
} = require('../controllers/users');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Routes requiring authentication
router.use(protect);

// Current user profile - MUST come before /:id route
router.route('/getMe').get(getMe);
router.route('/me').put(updateMe);

// Admin-only routes
router
  .route('/')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUser);

// Parameterized routes should come AFTER specific routes
router
  .route('/:id')
  .get(authorize('admin'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;