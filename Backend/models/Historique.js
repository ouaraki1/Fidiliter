const mongoose = require('mongoose');

const historiqueSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: { type: String, required: true },
  clientNumber: { type: String },
  clientCity: { type: String },

  vendeurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendeurName: { type: String, required: true },
  storeName: { type: String },

  produitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId },

  produitName: { type: String, required: true },
  produitSize: { type: String, required: true },
  produitUnit: { type: String, required: true },

  quantite: { type: Number, required: true },
  pointsAjoutes: { type: Number, required: true },
  totalPointsClient: { type: Number, required: true },
  type: {
    type: String,
    enum: ['ajout', 'cadeau'],
    required: true
  },
  ville: { type: String, required: true },
  dateOperation: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Historique', historiqueSchema);
