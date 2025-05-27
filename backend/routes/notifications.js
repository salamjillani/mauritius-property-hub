// routes/notifications.js
const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  createNotification,
} = require('../controllers/notifications');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/', authorize('admin'), createNotification);

module.exports = router;