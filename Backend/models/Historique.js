const mongoose = require('mongoose');

const historiqueSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  vendeurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendeur',
    required: true,
  },
  produitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantite: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['ajout', 'retrait'],
    required: true,
  },
  ville: {
    type: String,
    required: true,
  },
  dateOperation: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Historique', historiqueSchema);
