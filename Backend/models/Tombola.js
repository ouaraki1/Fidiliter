const mongoose = require('mongoose');

const tombolaSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  dateDebut: {
    type: Date,
    required: true,
  },
  dateFin: {
    type: Date,
    required: true,
  },
  ville: {
    type: String,
    required: true,
  },
  nbGagnants: {
    type: Number,
    required: true,
    min: 1,
  },
  gagnants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Tombola', tombolaSchema);
