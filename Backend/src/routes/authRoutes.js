const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const emailController = require('../controllers/emailController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/send-register-otp', emailController.sendRegisterOtp);
router.post('/verify-register-otp', emailController.verifyRegisterOtp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);
router.put('/change-email', authenticate, authController.changeEmail);
router.get('/users', authenticate, authorizeAdmin, authController.getAllUsers);

module.exports = router;
