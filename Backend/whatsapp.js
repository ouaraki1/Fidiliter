// whatsapp.js
require('dotenv').config();
const axios = require('axios');

const sendWhatsAppMessage = async (number, message) => {
  try {
    const response = await axios.post(
      'https://wasenderapi.com/api/send-message',
      {
        to: number.startsWith('+') ? number : `+${number}`,
        text: message
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WASENDER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Le message a été envoyé avec succès à :', number);
    return response.data;
  } catch (err) {
    console.error('❌ Erreur lors de l’envoi du message WhatsApp : ', err.response?.data || err.message);
  }
};

module.exports = { sendWhatsAppMessage };
