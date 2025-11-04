const mongoose = require('mongoose');

const TombolaSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  cities: [{ type: String, required: true }],
  winners: [{
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    number: String,
    city: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tombola', TombolaSchema);
