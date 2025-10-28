const { getClientProfile, updateClientProfile } = require('../controllers/client');
const {authMiddleware} = require('../middleware/auth');

const express = require('express');
const router = express.Router();

router.get('/profile', authMiddleware, getClientProfile);
router.put('/update-profile', authMiddleware, updateClientProfile);

module.exports = router;
