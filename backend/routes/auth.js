const express = require('express');
const { register, login, adminRegister, adminLogin, getMe, updateProfile } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);

module.exports = router;