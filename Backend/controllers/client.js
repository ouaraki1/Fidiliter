const User = require('../models/User');
const bcrypt = require('bcryptjs');

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
  if (updates.number) query.number = updates.number;

  const existing = await User.findOne(query);
  if (existing) {
    return res.status(400).json({ message: 'Email or number already in use' });
  }
}

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
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

module.exports = { getClientProfile, updateClientProfile };
