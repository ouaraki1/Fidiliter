const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');


const createAdmin = async (req, res) => {
  try {
    const { name, store, number, email, city, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { number }] });
    if (existing)
      return res.status(400).json({ message: 'Email or phone number already in use' });

    const hashed = await bcrypt.hash(password, 10);

    let imageUrl = null;
    let publicId = null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'admins' }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const admin = await User.create({
      role: 'admin',
      name,
      store,
      number,
      email,
      city,
      password: hashed,
      img: imageUrl,
      imgPublicId: publicId
    });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '✅ Admin created successfully',
      admin,
      token
    });

  } catch (err) {
    console.error('❌ Error creating admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const editAdmin = async (req, res) => {
  try {
    const updates = req.body;
    const admin = await User.findById(req.params.id);

    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);

    if (req.file) {
      if (admin.imgPublicId) {
        await cloudinary.uploader.destroy(admin.imgPublicId);
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'admins' }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        stream.end(req.file.buffer);
      });

      updates.img = result.secure_url;
      updates.imgPublicId = result.public_id;
    }

    const updatedAdmin = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({
      message: '✅ Admin updated successfully',
      updatedAdmin
    });

  } catch (err) {
    console.error('❌ Error updating admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    await User.deleteMany({ _id: adminId, role: 'admin' });
    await User.deleteMany({ assignedAdmin: adminId });
    await User.deleteMany({ createdByVendor: { $in: (await User.find({ assignedAdmin: adminId })).map(v => v._id) } });
    return res.json({ message: 'Admin and related vendors/clients removed' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const disableAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    await User.findByIdAndUpdate(adminId, { disabled: true });
    const vendors = await User.updateMany({ assignedAdmin: adminId }, { disabled: true });
    await User.updateMany({ createdByVendor: { $in: (await User.find({ assignedAdmin: adminId })).map(v => v._id) } }, { disabled: true });
    return res.json({ message: 'Admin, its vendors and clients disabled' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};



const enableAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    const admin = await User.findOneAndUpdate(
      { _id: adminId, role: 'admin' },
      { disabled: false },
      { new: true }
    );

    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    await User.updateMany({ assignedAdmin: adminId }, { disabled: false });

    const vendors = await User.find({ assignedAdmin: adminId });
    const vendorIds = vendors.map(v => v._id);

    await User.updateMany({ createdByVendor: { $in: vendorIds } }, { disabled: false });

    return res.json({ message: 'Admin, its vendors and clients enabled' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createVendorForAdmin = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') return res.status(404).json({ message: 'Admin not found' });
    const { name, number, city, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const vendor = await User.create({ role: 'vendor', name, number, city, password: hashed, assignedAdmin: adminId });
    return res.status(201).json({ vendor });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const editVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const vendor = await User.findOneAndUpdate(
      { _id: vendorId, role: 'vendor' },
      updates,
      { new: true }
    );

    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    return res.json(vendor);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    const vendor = await User.findOne({ _id: vendorId, role: 'vendor' });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    await User.deleteMany({ createdByVendor: vendorId });

    await User.findByIdAndDelete(vendorId);

    return res.json({ message: 'Vendor and its clients deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const listPendingVendors = async (req, res) => {
  try {
    const pending = await User.find({ role: 'vendor', pending: true });
    res.json(pending);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const approveVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const vendor = await User.findByIdAndUpdate(vendorId, { pending: false }, { new: true });
    res.json(vendor);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const rejectVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    await User.findByIdAndDelete(vendorId);
    res.json({ message: 'Vendor rejected and deleted' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

const updateSuperAdminProfile = async (req, res) => {
  try {
    const superAdminId = req.user._id;
    const updates = req.body;

    const superAdmin = await User.findById(superAdminId);
    if (!superAdmin || superAdmin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (updates.email || updates.number) {
      const existing = await User.findOne({
        $or: [{ email: updates.email }, { number: updates.number }],
        _id: { $ne: superAdminId }
      });
      if (existing) {
        return res.status(400).json({ message: 'Email or number already in use' });
      }
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedSuperAdmin = await User.findByIdAndUpdate(
      superAdminId,
      updates,
      { new: true }
    );

    res.json({ message: 'Profile updated successfully', user: updatedSuperAdmin });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



const listAllAdmins = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json(admins);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const listAllVendors = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const vendors = await User.find({ role: 'vendor' })
      .populate('assignedAdmin', 'name email store')
      .select('-password');

    res.json(vendors);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { createAdmin, editAdmin, deleteAdmin, disableAdmin, enableAdmin, createVendorForAdmin, editVendor, deleteVendor, listPendingVendors, approveVendor, rejectVendor, updateSuperAdminProfile, listAllAdmins, listAllVendors };
