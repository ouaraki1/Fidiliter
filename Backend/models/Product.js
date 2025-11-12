const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  unit: {
    type: String,
    enum: ['ml', 'l', 'kg', 'g', 'taille', 'Bouteille vide', 'personne', 'pas uniter',],
    default: 'pas uniter',
    required: true
  },
  points: { type: Number, required: true },
});

const ProductSchema = new mongoose.Schema({
  name: { type: String },
  code: { type: String, required: true },
  createdByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  variants: [variantSchema], 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
