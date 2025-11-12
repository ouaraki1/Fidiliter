const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); 
const { authMiddleware, roleMiddleware } = require('../middleware/auth'); 
const { getClientProfile, updateClientProfile, getClientHistorique ,getClientFiles ,downloadClientFile } = require('../controllers/client'); // ✅ تأكد أنك أضفت getClientHistorique

// =================== UPDATE PROFILE  =========================================================
router.put('/update-profile', upload.single('img'), authMiddleware, updateClientProfile); 

// =================== GET DATA CLIENT : HISTORIQUE | PROFILE  =============================
router.get('/profile', authMiddleware, getClientProfile); 
router.get('/historique', authMiddleware, roleMiddleware(['client']), getClientHistorique); 


// =================== GET DATA CLIENT : FILE | DOWNLOAD  =============================
router.get('/files', authMiddleware, roleMiddleware(['client']), getClientFiles);
router.get('/files/download/:fileId', authMiddleware, roleMiddleware(['client']), downloadClientFile);

module.exports = router;
