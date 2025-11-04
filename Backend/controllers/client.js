const User = require('../models/User');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary'); 
const multer = require('../middleware/upload'); 

const getClientProfile = async (req, res) => {
  try {
    const clientId = req.user._id; 
    const client = await User.findById(clientId).select('-password'); 

    if (!client || client.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      message: 'Client profile fetched successfully',
      user: client
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateClientProfile = async (req, res) => {
  try {
    const clientId = req.user._id;
    const updates = req.body;

    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (updates.email || updates.number) {
      const query = { _id: { $ne: clientId } }; 
      if (updates.email) query.email = updates.email;
      if (updates.number) query.number = updates.number.replace(/\D/g, '');
      const existing = await User.findOne(query);
      if (existing) return res.status(400).json({ message: 'Email or number already in use' });
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    if (updates.number) updates.number = updates.number.replace(/\D/g, '');

    if (req.file) {
      if (client.imgPublicId) {
        await cloudinary.uploader.destroy(client.imgPublicId);
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'clients' }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        stream.end(req.file.buffer);
      });

      updates.img = result.secure_url;
      updates.imgPublicId = result.public_id;
    }

    const updatedClient = await User.findByIdAndUpdate(
      clientId,
      updates,
      { new: true, select: '-password' }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedClient
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const getClientHistorique = async (req, res) => {
  try {
    const clientId = req.user._id;
    const { ville, type, dateDebut, dateFin } = req.query; 

    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filtre = { clientId };

    if (ville) {
      filtre.ville = { $regex: new RegExp(ville, 'i') }; 
    }

    if (type) {
      filtre.type = type; 
    }

    if (dateDebut || dateFin) {
      filtre.createdAt = {};
      if (dateDebut) filtre.createdAt.$gte = new Date(dateDebut);
      if (dateFin) filtre.createdAt.$lte = new Date(dateFin);
    }

    const historique = await Historique.find(filtre)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Historique du client filtré avec succès ✅',
      filters: {
        ville: ville || 'toutes',
        type: type || 'tous',
        dateDebut: dateDebut || 'non spécifiée',
        dateFin: dateFin || 'non spécifiée'
      },
      count: historique.length,
      historique
    });

  } catch (err) {
    console.error('❌ Erreur lors de la récupération de l’historique du client :', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: err.message
    });
  }
};


module.exports = { getClientProfile, updateClientProfile ,getClientHistorique };
