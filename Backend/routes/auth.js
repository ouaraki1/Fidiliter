const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');

router.post('/register-superadmin', AuthController.registerSuperAdmin);// done
router.post('/login', AuthController.login);// done
router.post('/send-otp', AuthController.sendOtp); 
router.post('/verify-otp', AuthController.verifyOtpAndReset); 

module.exports = router;
  