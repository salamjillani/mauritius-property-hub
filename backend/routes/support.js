const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
} = require('../controllers/support');

router.route('/')
  .post(protect, createTicket)
  .get(protect, authorize('admin', 'sub-admin'), getTickets);
router.route('/:id')
  .put(protect, authorize('admin', 'sub-admin'), updateTicket)
  .delete(protect, authorize('admin', 'sub-admin'), deleteTicket);

module.exports = router;