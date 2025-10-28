

const venom = require('venom-bot');
const sessions = {}; 

async function createWhatsAppSession(adminId) {
  return new Promise((resolve, reject) => {
    if (sessions[adminId]) {
      return resolve(sessions[adminId].qr); 
    }

venom.create(
  `session-${adminId}`,
  (base64Qr) => {
    sessions[adminId] = { client: null, qr: base64Qr };
    console.log(`📲 QR code generated for Admin ${adminId}`);
  },
  (status) => console.log(`🟢 [${adminId}] WhatsApp status: ${status}`),
  {
    logQR: false,
    multidevice: true,
    headless: true,
    disableSpins: true,
    disableWelcome: true,
    folderNameToken: './whatsapp_sessions', // <=== مهم جداً
    mkdirFolderToken: './whatsapp_sessions', // ينشئ المجلد إذا لم يوجد
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-gpu',
    ],
  }
)
.then(client => {
      sessions[adminId].client = client;
      console.log(`✅ WhatsApp bot ready for Admin ${adminId}`);
    }).catch(err => reject(err));
  });
}

function getAdminQr(adminId) {
  return sessions[adminId]?.qr || null;
}

async function sendWhatsAppMessage(adminId, number, message) {
  const session = sessions[adminId]?.client;
  if (!session) throw new Error(`Bot for Admin ${adminId} not initialized`);

  const formatted = number.replace(/\D/g, '') + '@c.us';
  await session.sendText(formatted, message);
  console.log(`💬 Message sent to ${number} by Admin ${adminId}`);
}

module.exports = { createWhatsAppSession, getAdminQr, sendWhatsAppMessage };
