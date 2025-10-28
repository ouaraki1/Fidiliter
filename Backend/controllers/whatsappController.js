const { createWhatsAppSession, getAdminQr } = require('../whatsapp');

const createBot = async (req, res) => {
  try {
    const adminId = req.user.id; 
    const result = await createWhatsAppSession(adminId);
    res.json(result);
  } catch (error) {
    console.error('❌ create-bot error:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
};

// 🟡 جلب QR code الخاص بالـ Admin
const getBotQr = async (req, res) => {
  try {
    const adminId = req.user.id;
    const qr = getAdminQr(adminId);
    if (!qr) return res.status(404).json({ message: 'QR not found yet' });

    res.json({ qr });
  } catch (error) {
    console.error('❌ get-bot-qr error:', error);
    res.status(500).json({ error: 'Failed to get QR' });
  }
};

 
module.exports = { createBot, getBotQr };