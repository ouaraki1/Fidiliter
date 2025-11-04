const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWhatsAppMessage } = require('../whatsapp');

const registerSuperAdmin = async (req, res) => {
  try {
    const { name, number, email, password } = req.body;

    const count = await User.countDocuments({ role: 'superadmin' });
    if (count >= 3) {
      return res.status(403).json({ message: 'Maximum number of Super Admins reached' });
    }

    const existing = await User.findOne({ $or: [{ email }, { number }] });
    if (existing) {
      return res.status(400).json({ message: 'Email or phone number already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      role: 'superadmin',
      name,
      number,
      email,
      password: hashed
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'SuperAdmin created successfully',
      token,
      userId: user._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Provide credentials' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { number: identifier }]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.disabled) return res.status(403).json({ message: 'Account disabled' });

    if (user.pending) {
      return res.status(403).json({
        message: 'Account pending approval by superadmin'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Wrong credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      name: user.name,
      role: user.role,
      userId: user._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const otpStore = {}; 

const sendOtp = async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) return res.status(400).json({ message: 'Numéro requis' });

    const user = await User.findOne({ number });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expires = Date.now() + 5 * 60 * 1000; 

    otpStore[number] = { otp, expires };

    setTimeout(() => {
      if (otpStore[number] && otpStore[number].otp === otp) {
        delete otpStore[number];
        console.log(`OTP for ${number} expired and removed from store`);
      }
    }, 5 * 60 * 1000);

    await sendWhatsAppMessage(number, `🟢 Code de réinitialisation : ${otp}`);

    res.json({ message: 'Code envoyé sur WhatsApp' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const verifyOtpAndReset = async (req, res) => {
  try {
    const { number, otp, newPassword } = req.body;

    if (!number || !otp || !newPassword)
      return res.status(400).json({ message: 'Champs requis' });

    const record = otpStore[number];
    if (!record || record.otp !== otp)
      return res.status(400).json({ message: 'Code invalide' });

    if (Date.now() > record.expires)
      return res.status(400).json({ message: 'Code expiré' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ number }, { password: hashed });

    delete otpStore[number]; 
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  registerSuperAdmin, login,
  sendOtp,
  verifyOtpAndReset,
};
