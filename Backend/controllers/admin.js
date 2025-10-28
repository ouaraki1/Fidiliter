const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createVendor = async (req, res) => {
  try {
    const { name, number, city, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const vendor = await User.create({ role: 'vendor', name, number, city, password: hashed, assignedAdmin: req.user._id, pending: true, createdByAdmin: req.user._id });
    res.status(201).json({ vendor });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const editVendor = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    if (req.user.role === 'admin' && vendor.assignedAdmin?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not allowed' });
    Object.assign(vendor, updates);
    await vendor.save();
    res.json(vendor);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const toggleVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    if (req.user.role === 'admin' && vendor.assignedAdmin?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not allowed' });
    vendor.disabled = !vendor.disabled;
    await vendor.save();
    res.json({ vendor });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const listClients = async (req, res) => {
  try {
    const vendors = await User.find({ assignedAdmin: req.user._id, role: 'vendor' });
    const vendorIds = vendors.map(v => v._id);
    const clients = await User.find({ createdByVendor: { $in: vendorIds }, role: 'client' });
    res.json(clients);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};


const listVendors = async (req, res) => {
  try {
    const adminId = req.user._id; 
    const vendors = await User.find({ role: 'vendor', assignedAdmin: adminId }).select('-password');
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const listVendorsWithClients = async (req, res) => {
  try {
    const adminId = req.user._id;
    const vendors = await User.find({ role: 'vendor', assignedAdmin: adminId }).select('-password');

    const result = await Promise.all(
      vendors.map(async (vendor) => {
        const clients = await User.find({ role: 'client', createdByVendor: vendor._id }).select('-password');
        return {
          vendor,
          clients
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user._id; 
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    delete updates.role;
    delete updates.disabled;

    const updatedAdmin = await User.findByIdAndUpdate(adminId, updates, { new: true }).select('-password');

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      admin: updatedAdmin
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};




module.exports = { createVendor, editVendor, toggleVendor, listClients , listVendors, listVendorsWithClients, updateAdminProfile };
