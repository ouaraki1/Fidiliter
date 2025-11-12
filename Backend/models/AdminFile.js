const mongoose = require('mongoose');

const adminFileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String, required: true },
  fileType: { type: String, enum: ['img', 'pdf'], required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientsAllowed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('AdminFile', adminFileSchema);
