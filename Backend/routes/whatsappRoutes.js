const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const whatsappController = require('../controllers/whatsappController');

router.use(authMiddleware, roleMiddleware(['admin', 'superadmin']));

router.post('/create-bot', whatsappController.createBot);

router.get('/get-bot-qr', whatsappController.getBotQr);

module.exports = router;
