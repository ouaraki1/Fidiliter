const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');
const Historique = require('../models/Historique');

const createAdmin = async (req, res) => {
  try {
    const { name, store, number, email, city, password, maxClients, maxVendors } = req.body;

    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: '🚫 Access denied. Only superadmin can create admins.' });
    }

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
      imgPublicId: publicId,
      maxClients: maxClients,
      maxVendors: maxVendors,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: '✅ Admin created successfully',
      admin,
    });

  } catch (err) {
    console.error('❌ Error creating admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



const editAdmin = async (req, res) => {
  try {
    const updates = req.body;
    const adminId = req.params.id;

    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: '🚫 Access denied. Only superadmin can edit admins.' });
    }

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

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

    const allowedFields = ['name', 'store', 'number', 'email', 'city', 'password', 'img', 'imgPublicId', 'maxClients', 'maxVendors'];
    const finalUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        finalUpdates[key] = updates[key];
      }
    }

    const updatedAdmin = await User.findByIdAndUpdate(adminId, finalUpdates, { new: true }).select('-password');

    res.json({
      message: '✅ Admin updated successfully',
      updatedAdmin
    });

  } catch (err) {
    console.error('❌ Error updating admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
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

// const listAllAdmins = async (req, res) => {
//   try {
//     if (req.user.role !== 'superadmin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     const admins = await User.find({ role: 'admin' }).select('-password');
//     res.json(admins);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const listAllAdmins = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 10 } = req.query;

    const adminsQuery = User.find({ role: 'admin' }).select('-password');

    const total = await adminsQuery.clone().countDocuments();

    const admins = await adminsQuery
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: admins.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      admins,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



// const createVendorForAdmin = async (req, res) => {
//   try {
//     // فقط superadmin يمكنه إنشاء بائعين
//     if (req.user.role !== 'superadmin') {
//       return res.status(403).json({ message: '🚫 Only superadmin can create vendors for admins.' });
//     }

//     const adminId = req.params.adminId;
//     const { name, number, city, password, email } = req.body;

//     // التحقق من وجود admin
//     const admin = await User.findOne({ _id: adminId, role: 'admin' });
//     if (!admin) {
//       return res.status(404).json({ message: 'Admin not found' });
//     }

//     // التحقق من عدم تجاوز الحد الأقصى للبائعين
//     const currentVendorsCount = await User.countDocuments({ assignedAdmin: adminId, role: 'vendor' });
//     const maxVendors = admin.maxVendors ?? 5;

//     if (currentVendorsCount >= maxVendors) {
//       return res.status(400).json({ message: `🚫 Max vendor limit reached (${maxVendors}) for this admin.` });
//     }

//     // التحقق من تكرار البريد أو الرقم
//     const existing = await User.findOne({ $or: [{ number }] });
//     if (existing) {
//       return res.status(400).json({ message: 'phone number already in use' });
//     }

//     // تشفير كلمة المرور
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // إنشاء البائع الجديد
//     const vendor = await User.create({
//       role: 'vendor',
//       name,
//       number,
//       email,
//       city,
//       password: hashedPassword,
//       assignedAdmin: adminId,
//       createdByAdmin: adminId,
//     });

//     res.status(201).json({
//       success: true,
//       message: '✅ Vendor created successfully for admin',
//       vendor,
//     });

//   } catch (err) {
//     console.error('❌ Error creating vendor for admin:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// const editVendor = async (req, res) => {
//   try {
//     // التحقق من صلاحيات المستخدم
//     if (req.user.role !== 'superadmin') {
//       return res.status(403).json({ message: '🚫 Only superadmin can edit vendors.' });
//     }

//     const vendorId = req.params.vendorId;
//     const { name, number, city, email, password, assignedAdmin } = req.body;

//     // التحقق من وجود البائع
//     const vendor = await User.findOne({ _id: vendorId, role: 'vendor' });
//     if (!vendor) {
//       return res.status(404).json({ message: 'Vendor not found.' });
//     }

//     // إذا تم تمرير admin جديد، التحقق من وجوده
//     if (assignedAdmin) {
//       const admin = await User.findOne({ _id: assignedAdmin, role: 'admin' });
//       if (!admin) {
//         return res.status(400).json({ message: 'Assigned admin not found.' });
//       }
//       vendor.assignedAdmin = assignedAdmin;
//     }

//     // التحقق من البريد أو الرقم (لتفادي التكرار)
//     if (email && email !== vendor.email) {
//       const emailExists = await User.findOne({ email });
//       if (emailExists) {
//         return res.status(400).json({ message: 'Email already in use.' });
//       }
//       vendor.email = email;
//     }

//     if (number && number !== vendor.number) {
//       const numberExists = await User.findOne({ number });
//       if (numberExists) {
//         return res.status(400).json({ message: 'Phone number already in use.' });
//       }
//       vendor.number = number;
//     }

//     // تحديث باقي الحقول
//     if (name) vendor.name = name;
//     if (city) vendor.city = city;

//     // إذا تم تمرير كلمة مرور جديدة، نقوم بتشفيرها
//     if (password) {
//       vendor.password = await bcrypt.hash(password, 10);
//     }

//     // حفظ التعديلات
//     await vendor.save();

//     res.status(200).json({
//       success: true,
//       message: '✅ Vendor updated successfully.',
//       vendor,
//     });
//   } catch (err) {
//     console.error('❌ Error editing vendor:', err);
//     res.status(500).json({ message: 'Server error.' });
//   }
// };



const createVendorForAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: '🚫 Only superadmin can create vendors for admins.' });
    }

    const adminId = req.params.adminId;
    const { name, number, city, password, email } = req.body;

    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });

    const currentVendorsCount = await User.countDocuments({ assignedAdmin: adminId, role: 'vendor' });
    const maxVendors = admin.maxVendors ?? 5;
    if (currentVendorsCount >= maxVendors) {
      return res.status(400).json({ message: `🚫 Max vendor limit reached (${maxVendors}) for this admin.` });
    }

    // ✅ التحقق من تكرار رقم الهاتف لأي بائع آخر في النظام
    const existingVendor = await User.findOne({ role: 'vendor', number });
    if (existingVendor) {
      return res.status(400).json({ message: '🚫 Phone number already in use by another vendor.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = await User.create({
      role: 'vendor',
      name,
      number,
      email,
      city,
      password: hashedPassword,
      assignedAdmin: adminId,
      createdByAdmin: adminId,
    });

    res.status(201).json({
      success: true,
      message: '✅ Vendor created successfully for admin',
      vendor,
    });

  } catch (err) {
    console.error('❌ Error creating vendor for admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const editVendor = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: '🚫 Only superadmin can edit vendors.' });
    }

    const vendorId = req.params.vendorId;
    const { name, number, city, email, password, assignedAdmin } = req.body;

    const vendor = await User.findOne({ _id: vendorId, role: 'vendor' });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });

    if (assignedAdmin) {
      const admin = await User.findOne({ _id: assignedAdmin, role: 'admin' });
      if (!admin) return res.status(400).json({ message: 'Assigned admin not found.' });
      vendor.assignedAdmin = assignedAdmin;
    }

    if (email && email !== vendor.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: vendor._id } });
      if (emailExists) return res.status(400).json({ message: 'Email already in use.' });
      vendor.email = email;
    }

    // ✅ التحقق من تكرار رقم الهاتف لأي بائع آخر في النظام
    if (number && number !== vendor.number) {
      const numberExists = await User.findOne({ role: 'vendor', number, _id: { $ne: vendor._id } });
      if (numberExists) return res.status(400).json({ message: 'Phone number already in use by another vendor.' });
      vendor.number = number;
    }

    if (name) vendor.name = name;
    if (city) vendor.city = city;
    if (password) vendor.password = await bcrypt.hash(password, 10);

    await vendor.save();

    res.status(200).json({
      success: true,
      message: '✅ Vendor updated successfully.',
      vendor,
    });
  } catch (err) {
    console.error('❌ Error editing vendor:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};




// const listAllVendors = async (req, res) => {
//   try {
//     if (req.user.role !== 'superadmin') {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     const vendors = await User.find({ role: 'vendor' })
//       .populate('assignedAdmin', 'name email store')
//       .select('-password');

//     res.json(vendors);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const listAllVendors = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 10 } = req.query;

    const vendorsQuery = User.find({ role: 'vendor' })
      .populate('assignedAdmin', 'name email store')
      .select('-password');

    const total = await vendorsQuery.clone().countDocuments();

    const vendors = await vendorsQuery
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: vendors.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      vendors,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



const getVendorsByAdmin = async (req, res) => {
  try {
    // صلاحيات superadmin فقط
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: '🚫 Only superadmin can view vendors by admin.' });
    }

    const adminId = req.params.adminId;
    const { page = 1, limit = 10 } = req.query;

    // التحقق من وجود admin
    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // حساب إجمالي عدد البائعين
    const total = await User.countDocuments({ role: 'vendor', assignedAdmin: adminId });

    // استرجاع البائعين مع pagination
    const vendors = await User.find({ role: 'vendor', assignedAdmin: adminId })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select('-password') // لا نرجع كلمة المرور
      .sort({ createdAt: -1 }); // الأحدث أولاً

    res.json({
      success: true,
      count: vendors.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      vendors,
    });

  } catch (err) {
    console.error('❌ Error getting vendors by admin:', err);
    res.status(500).json({ message: 'Server error.' });
  }
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

const getSuperAdminStats = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: '🚫 Accès refusé.' });
    }

    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(a => a._id);

    const vendors = await User.find({ role: 'vendor', assignedAdmin: { $in: adminIds } });
    const vendorIds = vendors.map(v => v._id);

    const clients = await User.find({ role: 'client', createdByVendor: { $in: vendorIds } });

    const products = await Product.find({ createdByAdmin: { $in: adminIds } });

    const historiques = await Historique.find({ vendeurId: { $in: vendorIds } })
      .populate('produitId', 'name points createdByAdmin')
      .populate('clientId', 'name number')
      .populate('vendeurId', 'name assignedAdmin')
      .sort({ createdAt: -1 });

    const totalAdmins = admins.length;
    const totalVendors = vendors.length;
    const totalClients = clients.length;
    const totalProducts = products.length;

    const totalPointsDistribues = historiques
      .filter(h => h.type === 'ajout')
      .reduce((sum, h) => sum + (h.produitId?.points || 0) * h.quantite, 0);

    const totalGifts = historiques.filter(h => h.type === 'cadeau').length;
    const adminStatsMap = {};
    const vendorStatsMap = {};
    const productStatsMap = {};

    historiques.forEach(h => {
      if (!h.vendeurId || !h.produitId) return;

      const adminId = h.vendeurId.assignedAdmin?.toString();
      const vendorId = h.vendeurId._id.toString();
      const productId = h.produitId._id.toString();

      const points = (h.produitId?.points || 0) * h.quantite;

      if (adminId) {
        adminStatsMap[adminId] = adminStatsMap[adminId] || { totalPoints: 0, operations: 0 };
        adminStatsMap[adminId].totalPoints += points;
        adminStatsMap[adminId].operations += 1;
      }

      vendorStatsMap[vendorId] = vendorStatsMap[vendorId] || { points: 0, adminId, operations: 0 };
      vendorStatsMap[vendorId].points += points;
      vendorStatsMap[vendorId].operations += 1;

      if (adminId) {
        productStatsMap[adminId] = productStatsMap[adminId] || {};
        productStatsMap[adminId][productId] = (productStatsMap[adminId][productId] || 0) + points;
      }
    });

    const topAdmins = admins.map(a => ({
      id: a._id,
      name: a.name,
      points: adminStatsMap[a._id.toString()]?.totalPoints || 0,
      operations: adminStatsMap[a._id.toString()]?.operations || 0
    }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    const topVendors = vendors.map(v => ({
      id: v._id,
      name: v.name,
      city: v.city,
      points: vendorStatsMap[v._id.toString()]?.points || 0,
      operations: vendorStatsMap[v._id.toString()]?.operations || 0
    }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    const perAdminStats = [];

    for (const admin of admins) {
      const adminId = admin._id.toString();

      const adminProducts = Object.entries(productStatsMap[adminId] || {})
        .map(([productId, points]) => {
          const prod = products.find(p => p._id.toString() === productId);
          return { id: productId, name: prod?.name || '—', points };
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);

      const adminVendors = vendors
        .filter(v => v.assignedAdmin?.toString() === adminId)
        .map(v => ({
          id: v._id,
          name: v.name,
          city: v.city,
          points: vendorStatsMap[v._id.toString()]?.points || 0
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);

      perAdminStats.push({
        adminId,
        adminName: admin.name,
        topProducts: adminProducts,
        topVendors: adminVendors
      });
    }

    res.json({
      success: true,
      message: '✅ Statistiques du superadmin récupérées avec succès.',
      data: {
        totalAdmins,
        totalVendors,
        totalClients,
        totalProducts,
        totalPointsDistribues,
        totalGifts,
        topAdmins,
        topVendors,
        perAdminStats
      }
    });

  } catch (err) {
    console.error('❌ Erreur lors du calcul des stats superadmin :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};


// ========================= delet =========================


// // 🧨 Supprimer tous les vendeurs + leurs clients + historiques
// const deleteAllVendors = async (req, res) => {
//   try {
//     if (req.user.role !== 'superadmin') {
//       return res.status(403).json({ message: '🚫 Access denied. Only superadmin can delete all vendors.' });
//     }

//     const vendors = await User.find({ role: 'vendor' });
//     if (!vendors.length) return res.json({ message: 'Aucun vendeur trouvé.' });

//     const vendorIds = vendors.map(v => v._id);
//     const clientIds = (await User.find({ role: 'client', createdByVendor: { $in: vendorIds } })).map(c => c._id);

//     // Supprimer les historiques liés à ces vendeurs et clients
//     await Historique.deleteMany({
//       $or: [{ vendeurId: { $in: vendorIds } }, { clientId: { $in: clientIds } }]
//     });

//     // Supprimer les clients
//     await User.deleteMany({ _id: { $in: clientIds } });

//     // Supprimer les vendeurs
//     await User.deleteMany({ _id: { $in: vendorIds } });

//     res.json({
//       success: true,
//       message: `✅ ${vendors.length} vendeur(s), leurs clients et historiques supprimés.`
//     });
//   } catch (err) {
//     console.error('❌ Erreur lors de la suppression des vendeurs :', err);
//     res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
//   }
// };

// // 💥 Supprimer tous les admins + vendeurs + clients + produits + historiques
// const deleteAllAdmins = async (req, res) => {
//   try {
//     if (req.user.role !== 'superadmin') {
//       return res.status(403).json({ message: '🚫 Access denied. Only superadmin can delete all admins.' });
//     }

//     const admins = await User.find({ role: 'admin' });
//     if (!admins.length) return res.json({ message: 'Aucun admin trouvé.' });

//     const adminIds = admins.map(a => a._id);
//     const vendors = await User.find({ role: 'vendor', assignedAdmin: { $in: adminIds } });
//     const vendorIds = vendors.map(v => v._id);
//     const clients = await User.find({ role: 'client', createdByVendor: { $in: vendorIds } });
//     const clientIds = clients.map(c => c._id);

//     // Supprimer historiques
//     await Historique.deleteMany({
//       $or: [
//         { vendeurId: { $in: vendorIds } },
//         { clientId: { $in: clientIds } }
//       ]
//     });

//     // Supprimer produits liés à ces admins
//     await Product.deleteMany({ createdByAdmin: { $in: adminIds } });

//     // Supprimer utilisateurs
//     await User.deleteMany({ _id: { $in: clientIds } });
//     await User.deleteMany({ _id: { $in: vendorIds } });
//     await User.deleteMany({ _id: { $in: adminIds } });

//     res.json({
//       success: true,
//       message: `✅ Tous les admins, vendeurs, clients, produits et historiques ont été supprimés.`
//     });
//   } catch (err) {
//     console.error('❌ Erreur lors de la suppression des admins :', err);
//     res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
//   }
// };

// // 🧑‍💼 Supprimer un admin + tous ses vendeurs, clients, produits et historiques
// const deleteAdmin = async (req, res) => {
//   try {
//     const adminId = req.params.id;

//     const admin = await User.findOne({ _id: adminId, role: 'admin' });
//     if (!admin) return res.status(404).json({ message: 'Admin not found' });

//     const vendors = await User.find({ role: 'vendor', assignedAdmin: adminId });
//     const vendorIds = vendors.map(v => v._id);
//     const clients = await User.find({ role: 'client', createdByVendor: { $in: vendorIds } });
//     const clientIds = clients.map(c => c._id);

//     // Supprimer historiques
//     await Historique.deleteMany({
//       $or: [
//         { vendeurId: { $in: vendorIds } },
//         { clientId: { $in: clientIds } }
//       ]
//     });

//     // Supprimer produits liés à cet admin
//     await Product.deleteMany({ createdByAdmin: adminId });

//     // Supprimer utilisateurs
//     await User.deleteMany({ _id: { $in: clientIds } });
//     await User.deleteMany({ _id: { $in: vendorIds } });
//     await User.deleteOne({ _id: adminId });

//     res.json({ success: true, message: '✅ Admin, ses vendeurs, clients, produits et historiques supprimés.' });
//   } catch (err) {
//     console.error('❌ Erreur lors de la suppression de l’admin :', err);
//     res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
//   }
// };

// // 🧾 Supprimer un vendeur + tous ses clients + historiques
// const deleteVendor = async (req, res) => {
//   try {
//     const vendorId = req.params.vendorId;

//     const vendor = await User.findOne({ _id: vendorId, role: 'vendor' });
//     if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

//     const clients = await User.find({ role: 'client', createdByVendor: vendorId });
//     const clientIds = clients.map(c => c._id);

//     // Supprimer historiques liés
//     await Historique.deleteMany({
//       $or: [
//         { vendeurId: vendorId },
//         { clientId: { $in: clientIds } }
//       ]
//     });

//     // Supprimer clients
//     await User.deleteMany({ _id: { $in: clientIds } });

//     // Supprimer vendeur
//     await User.deleteOne({ _id: vendorId });

//     res.json({ success: true, message: '✅ Vendor, ses clients et historiques supprimés.' });
//   } catch (err) {
//     console.error('❌ Erreur lors de la suppression du vendeur :', err);
//     res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
//   }
// };



const deleteCloudImage = async (url) => {
  if (!url) return;
  try {
    const publicId = url.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('⚠️ Erreur suppression Cloudinary :', err.message);
  }
};

const deleteVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const vendor = await User.findOne({ _id: vendorId, role: 'vendor' });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const clients = await User.find({ role: 'client', createdByVendor: vendorId });
    const clientIds = clients.map(c => c._id);

    const produits = await Product.find({ createdByVendor: vendorId });
    const historique = await Historique.find({
      $or: [{ vendeurId: vendorId }, { clientId: { $in: clientIds } }]
    });

    if (vendor.image) await deleteCloudImage(vendor.image);
    for (const client of clients) if (client.image) await deleteCloudImage(client.image);
    for (const produit of produits) if (produit.image) await deleteCloudImage(produit.image);

    await Historique.deleteMany({ _id: { $in: historique.map(h => h._id) } });
    await Product.deleteMany({ _id: { $in: produits.map(p => p._id) } });
    await User.deleteMany({ _id: { $in: clientIds } });
    await User.deleteOne({ _id: vendorId });

    res.json({ success: true, message: '✅ Vendor, ses clients, produits et historiques supprimés.' });
  } catch (err) {
    console.error('❌ Erreur lors de la suppression du vendeur :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const vendors = await User.find({ role: 'vendor', assignedAdmin: adminId });
    const vendorIds = vendors.map(v => v._id);
    const clients = await User.find({ role: 'client', createdByVendor: { $in: vendorIds } });
    const clientIds = clients.map(c => c._id);

    const produits = await Product.find({ createdByAdmin: adminId });
    const historique = await Historique.find({
      $or: [
        { vendeurId: { $in: vendorIds } },
        { clientId: { $in: clientIds } }
      ]
    });

    if (admin.image) await deleteCloudImage(admin.image);
    for (const v of vendors) if (v.image) await deleteCloudImage(v.image);
    for (const c of clients) if (c.image) await deleteCloudImage(c.image);
    for (const p of produits) if (p.image) await deleteCloudImage(p.image);

    await Historique.deleteMany({ _id: { $in: historique.map(h => h._id) } });
    await Product.deleteMany({ _id: { $in: produits.map(p => p._id) } });
    await User.deleteMany({ _id: { $in: clientIds } });
    await User.deleteMany({ _id: { $in: vendorIds } });
    await User.deleteOne({ _id: adminId });

    res.json({ success: true, message: '✅ Admin, ses vendeurs, clients, produits, historiques et images supprimés.' });
  } catch (err) {
    console.error('❌ Erreur lors de la suppression de l’admin :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

const deleteAllVendors = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: '🚫 Access denied. Only superadmin can delete all vendors.' });
    }

    const vendors = await User.find({ role: 'vendor' });
    const vendorIds = vendors.map(v => v._id);
    const clients = await User.find({ role: 'client', createdByVendor: { $in: vendorIds } });
    const clientIds = clients.map(c => c._id);

    const produits = await Product.find({ createdByVendor: { $in: vendorIds } });
    const historiques = await Historique.find({
      $or: [{ vendeurId: { $in: vendorIds } }, { clientId: { $in: clientIds } }]
    });

    for (const v of vendors) if (v.image) await deleteCloudImage(v.image);
    for (const c of clients) if (c.image) await deleteCloudImage(c.image);
    for (const p of produits) if (p.image) await deleteCloudImage(p.image);

    await Historique.deleteMany({ _id: { $in: historiques.map(h => h._id) } });
    await Product.deleteMany({ _id: { $in: produits.map(p => p._id) } });
    await User.deleteMany({ _id: { $in: clientIds } });
    await User.deleteMany({ _id: { $in: vendorIds } });

    res.json({ success: true, message: '✅ Tous les vendeurs, clients, produits et historiques supprimés.' });
  } catch (err) {
    console.error('❌ Erreur lors de la suppression des vendeurs :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

const deleteAllAdmins = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: '🚫 Access denied. Only superadmin can delete all admins.' });
    }

    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(a => a._id);
    const vendors = await User.find({ role: 'vendor', assignedAdmin: { $in: adminIds } });
    const vendorIds = vendors.map(v => v._id);
    const clients = await User.find({ role: 'client', createdByVendor: { $in: vendorIds } });
    const clientIds = clients.map(c => c._id);

    const produits = await Product.find({ createdByAdmin: { $in: adminIds } });
    const historiques = await Historique.find({
      $or: [
        { vendeurId: { $in: vendorIds } },
        { clientId: { $in: clientIds } }
      ]
    });

    for (const a of admins) if (a.image) await deleteCloudImage(a.image);
    for (const v of vendors) if (v.image) await deleteCloudImage(v.image);
    for (const c of clients) if (c.image) await deleteCloudImage(c.image);
    for (const p of produits) if (p.image) await deleteCloudImage(p.image);

    await Historique.deleteMany({ _id: { $in: historiques.map(h => h._id) } });
    await Product.deleteMany({ _id: { $in: produits.map(p => p._id) } });
    await User.deleteMany({ _id: { $in: clientIds } });
    await User.deleteMany({ _id: { $in: vendorIds } });
    await User.deleteMany({ _id: { $in: adminIds } });

    res.json({ success: true, message: '✅ Tous les admins, vendeurs, clients, produits, historiques et images supprimés.' });
  } catch (err) {
    console.error('❌ Erreur lors de la suppression des admins :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};


module.exports = { createAdmin, editAdmin, deleteAdmin, disableAdmin, enableAdmin, createVendorForAdmin, editVendor, deleteVendor, updateSuperAdminProfile, listAllAdmins, listAllVendors, getSuperAdminStats, deleteAllAdmins, deleteAllVendors ,getVendorsByAdmin};
