const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');

router.post('/login', AuthController.login);// done
router.post('/register-superadmin', AuthController.registerSuperAdmin);// done

module.exports = router;
 