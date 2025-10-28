

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports = { registerSuperAdmin, login };
