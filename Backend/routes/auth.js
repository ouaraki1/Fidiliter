const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');

// =========== REGISTER 3 SUPERADMIN SI TOUS  ========================
router.post('/register-superadmin', AuthController.registerSuperAdmin);  // D

// =========== LOGIN  ==============
router.post('/login', AuthController.login);  // D

// =========== FORGOUT PASSWORD =====================
router.post('/send-otp', AuthController.sendOtp);   // ATT
router.post('/verify-otp', AuthController.verifyOtpAndReset);  // ATT


module.exports = router;
   