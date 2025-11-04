// Whatsapp.js
require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


/**
 * @param {string} number 
 * @param {string} message
 */
const sendWhatsAppMessage = async (number, message) => {
  try {
    const formattedNumber = number.startsWith('+') ? number : `+${number}`;
    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${formattedNumber}`,
      body: message,
    });
    console.log(`✅ WhatsApp envoyé à ${formattedNumber}`);
    return response.sid;
  } catch (error) {
    console.error('❌ Erreur envoi WhatsApp:', error.message);
    throw error;
  }
};

module.exports = { sendWhatsAppMessage };
