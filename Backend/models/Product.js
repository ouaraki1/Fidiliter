const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String },
  unit: {
    type: String,
    required: true,
    enum: ['ml', 'l', 'kg', 'g', 'taille', 'pas uniter'],
    default: 'pas uniter'
  },
  points: { type: Number, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
