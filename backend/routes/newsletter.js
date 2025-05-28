const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  subscribeNewsletter,
  getSubscribers,
  sendNewsletter,
} = require('../controllers/newsletter');

router.route('/subscribe').post(subscribeNewsletter);
router.route('/subscribers').get(protect, authorize('admin', 'sub-admin'), getSubscribers);
router.route('/send').post(protect, authorize('admin', 'sub-admin'), sendNewsletter);

module.exports = router;