const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); 
const { authMiddleware, roleMiddleware } = require('../middleware/auth'); // ✅ إضافة هنا
const { getClientProfile, updateClientProfile, getClientHistorique } = require('../controllers/client'); // ✅ تأكد أنك أضفت getClientHistorique

router.get('/profile', authMiddleware, getClientProfile); // done
router.put('/update-profile', upload.single('img'), authMiddleware, updateClientProfile); // done
router.get('/historique', authMiddleware, roleMiddleware(['client']), getClientHistorique); // ✅ done

module.exports = router;
