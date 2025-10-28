

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendWhatsAppMessage } = require('../whatsapp');

const createClient = async (req, res) => {
  try {
    const { name, number, city, password } = req.body;

    const existingClient = await User.findOne({ number });
    if (existingClient)
      return res.status(400).json({ message: '❌ Ce numéro est déjà utilisé' });

    const hashed = await bcrypt.hash(password, 10);

    const client = await User.create({
      role: 'client',
      name,
      number,
      city,
      password: hashed,
      createdByVendor: req.user._id,
      createdByAdmin: req.user.createdByAdmin
    });

    const text = `👋 Bonjour ${name} !\nVotre compte a été créé ✅\nNuméro de connexion : ${number}\nMot de passe : ${password}`;

    try {
      await sendWhatsAppMessage(req.user.createdByAdmin, number, text);
      console.log('✅ Message envoyé au client');
    } catch (err) {
      console.error('❌ Erreur lors de l’envoi du message WhatsApp :', err);
    }

    res.status(201).json({ message: 'Client créé et message envoyé', client });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const editClient = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);

    const client = await User.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client introuvable' });
    if (client.createdByVendor?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Action non autorisée' });

    Object.assign(client, updates);
    await client.save();

    res.json({ message: '✅ Client modifié avec succès', client });
  } catch (err) {
    console.error('❌ Erreur lors de la modification du client :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const toggleClient = async (req, res) => {
  try {
    const client = await User.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client introuvable' });
    if (client.createdByVendor?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Action non autorisée' });

    client.disabled = !client.disabled;
    await client.save();

    res.json({ message: `✅ Client ${client.disabled ? 'désactivé' : 'activé'}`, client });
  } catch (err) {
    console.error('❌ Erreur lors de l’activation/désactivation :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { createClient, editClient, toggleClient };
