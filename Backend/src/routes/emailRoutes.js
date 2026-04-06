const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/forgot-password', emailController.forgotPassword);
router.post('/verify-otp', emailController.verifyOtp);
router.post('/reset-password', emailController.resetPassword);

module.exports = router;
