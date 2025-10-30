const { getClientProfile, updateClientProfile } = require('../controllers/client');
const {authMiddleware} = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); 

router.get('/profile', authMiddleware, getClientProfile); // done
router.put('/update-profile', upload.single('img'), authMiddleware, updateClientProfile); // done

module.exports = router;
