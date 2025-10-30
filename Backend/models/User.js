const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['superadmin','admin','vendor','client'], required: true },

    name: { type: String },
number: { 
  type: String, 
  sparse: true, 
  required: function() { 
    return this.role !== 'superadmin'; 
  } 
},    email: { type: String },
    city: { type: String },
    img: { type: String },
    imgPublicId: { type: String }, 

    password: { type: String, required: true },

    store: { type: String },

    createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdByVendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    disabled: { type: Boolean, default: false },
    pending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
