const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const Historique = require('../models/Historique');
const Product = require('../models/Product');
const Tombola = require('../models/Tombola');
const crypto = require('crypto');


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

    const admin = await User.findById(adminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

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

    const updatedAdmin = await User.findByIdAndUpdate(adminId, updates, { new: true }).select('-password');

    res.json({
      message: 'Profile updated successfully',
      admin: updatedAdmin
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



const getAdminStats = async (req, res) => {
  try {
    const adminId = req.user._id;

    const vendors = await User.find({ role: 'vendor', assignedAdmin: adminId });
    const vendorIds = vendors.map(v => v._id);

    const clients = await User.find({ role: 'client', createdByVendor: { $in: vendorIds } });

    const products = await Product.find({ createdByAdmin: adminId });

    const historiques = await Historique.find({ vendeurId: { $in: vendorIds } })
      .populate('clientId', 'name number')
      .populate('produitId', 'name points')
      .sort({ createdAt: -1 });

    const totalVendors = vendors.length;
    const totalClients = clients.length;
    const totalProducts = products.length;
    const totalPoints = historiques
      .filter(h => h.type === 'ajout')
      .reduce((sum, h) => sum + (h.produitId?.points || 0) * h.quantite, 0);
    const totalGifts = historiques.filter(h => h.type === 'cadeau').length;

    const vendorStatsMap = {};
    historiques.forEach(h => {
      const vId = h.vendeurId.toString();
      vendorStatsMap[vId] = vendorStatsMap[vId] || { points: 0, operations: 0 };
      if (h.type === 'ajout') vendorStatsMap[vId].points += (h.produitId?.points || 0) * h.quantite;
      vendorStatsMap[vId].operations += 1;
    });

    const topVendors = vendors.map(v => ({
      id: v._id,
      name: v.name,
      points: vendorStatsMap[v._id.toString()]?.points || 0,
      operations: vendorStatsMap[v._id.toString()]?.operations || 0
    }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    const clientPointsMap = {};
    historiques.forEach(h => {
      if (h.type === 'ajout') {
        const cId = h.clientId?._id?.toString();
        if (!cId) return;
        clientPointsMap[cId] = (clientPointsMap[cId] || 0) + (h.produitId?.points || 0) * h.quantite;
      }
    });

    const topClients = clients.map(c => ({
      id: c._id,
      name: c.name,
      number: c.number,
      pointsReceived: clientPointsMap[c._id.toString()] || 0
    }))
      .sort((a, b) => b.pointsReceived - a.pointsReceived)
      .slice(0, 5);

    const pointsByDay = {};
    historiques.forEach(h => {
      if (h.type === 'ajout') {
        const day = h.createdAt.toISOString().slice(0, 10);
        pointsByDay[day] = (pointsByDay[day] || 0) + (h.produitId?.points || 0) * h.quantite;
      }
    });
    const chartPoints = Object.keys(pointsByDay).map(date => ({ date, points: pointsByDay[date] }));

    const giftsByDay = {};
    historiques.forEach(h => {
      if (h.type === 'cadeau') {
        const day = h.createdAt.toISOString().slice(0, 10);
        giftsByDay[day] = (giftsByDay[day] || 0) + 1;
      }
    });
    const chartGifts = Object.keys(giftsByDay).map(date => ({ date, gifts: giftsByDay[date] }));

    const productMap = {};
    historiques.forEach(h => {
      if (!h.produitId?.name) return;
      const name = h.produitId.name;
      productMap[name] = productMap[name] || { points: 0, quantity: 0 };
      if (h.type === 'ajout') {
        productMap[name].points += (h.produitId?.points || 0) * h.quantite;
        productMap[name].quantity += h.quantite;
      }
    });

    const topProducts = Object.entries(productMap)
      .map(([name, data]) => ({ name, points: data.points, quantity: data.quantity }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalVendors,
        totalClients,
        totalProducts,
        totalPoints,
        totalGifts,
        topVendors,
        topClients,
        topProducts,
        chartPoints,
        chartGifts
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};



const deleteAllVendors = async (req, res) => {
  try {
    const adminId = req.user._id;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const vendors = await User.find({ role: 'vendor', assignedAdmin: adminId });
    const vendorIds = vendors.map(v => v._id);

    await User.deleteMany({ role: 'client', createdByVendor: { $in: vendorIds } });

    await Historique.deleteMany({ vendeurId: { $in: vendorIds } });

    await Product.deleteMany({ createdByAdmin: adminId });

    const result = await User.deleteMany({ role: 'vendor', assignedAdmin: adminId });

    res.json({
      success: true,
      message: `Tous les vendeurs (${result.deletedCount}) et leurs clients/historiques ont été supprimés.`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// const drawTombolaWinners = async (req, res) => {
//   try {
//     const adminId = req.user._id;
//     const { dateFrom, dateTo, cities, winnersCount } = req.body;

//     if (!dateFrom || !dateTo)
//       return res.status(400).json({ success: false, message: 'Veuillez indiquer la période (du... au...)' });
//     if (!Array.isArray(cities) || cities.length === 0)
//       return res.status(400).json({ success: false, message: 'Veuillez sélectionner au moins une ville.' });
//     if (!winnersCount || winnersCount <= 0)
//       return res.status(400).json({ success: false, message: 'Veuillez indiquer un nombre de gagnants valide.' });

//     const vendors = await User.find({ role: 'vendor', assignedAdmin: adminId });
//     const vendorIds = vendors.map(v => v._id);

//     const clients = await User.find({
//       role: 'client',
//       city: { $in: cities },
//       createdByVendor: { $in: vendorIds }
//     }).select('_id name number city');

//     const clientIds = clients.map(c => c._id);

//     const historiques = await Historique.find({
//       type: 'ajout',
//       clientId: { $in: clientIds },
//       vendeurId: { $in: vendorIds },
//       createdAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo) }
//     }).populate('clientId', 'name number city');

//     if (historiques.length === 0)
//       return res.status(404).json({ success: false, message: 'Aucun client trouvé pour ces critères.' });

//     const uniqueClientsMap = {};
//     historiques.forEach(h => {
//       const id = h.clientId._id.toString();
//       uniqueClientsMap[id] = h.clientId;
//     });
//     const uniqueClients = Object.values(uniqueClientsMap);

//     const shuffled = uniqueClients.sort(() => 0.5 - Math.random());
//     const winners = shuffled.slice(0, Math.min(winnersCount, uniqueClients.length));

//     const savedTombola = await Tombola.create({
//       adminId,
//       dateFrom,
//       dateTo,
//       cities,
//       winnersCount,
//       totalEligible: uniqueClients.length,
//       winners: winners.map(w => ({
//         clientId: w._id,
//         name: w.name,
//         number: w.number,
//         city: w.city
//       }))
//     });

//     res.json({
//       success: true,
//       message: `🎉 ${winners.length} gagnant(s) sélectionné(s) et sauvegardé(s) avec succès !`,
//       tombola: savedTombola
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
//   }
// };

// const listTombolas = async (req, res) => {
//   try {
//     const adminId = req.user._id;
//     const tombolas = await Tombola.find({ adminId }).sort({ createdAt: -1 });
//     res.json({ success: true, tombolas });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
//   }
// };


const drawTombolaWinners = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { dateFrom, dateTo, cities, winnersCount } = req.body;

    if (!dateFrom || !dateTo)
      return res.status(400).json({ success: false, message: 'Veuillez indiquer la période (du... au...)' });

    if (!Array.isArray(cities) || cities.length === 0)
      return res.status(400).json({ success: false, message: 'Veuillez sélectionner au moins une ville.' });

    if (!winnersCount || winnersCount <= 0)
      return res.status(400).json({ success: false, message: 'Veuillez indiquer un nombre de gagnants valide.' });

    // 🔹 جلب جميع البائعين التابعين للإدمن
    const vendorIds = await User.find({ role: 'vendor', assignedAdmin: adminId }).distinct('_id');

    // 🔹 جلب جميع عمليات الإضافة (ajout) للزبائن في المدن المختارة والفترة المحددة
    const historiques = await Historique.find({
      type: 'ajout',
      vendeurId: { $in: vendorIds },
      ville: { $in: cities },
      dateOperation: { $gte: new Date(dateFrom), $lte: new Date(dateTo) }
    }).populate('clientId', 'name number city');

    if (historiques.length === 0)
      return res.status(404).json({ success: false, message: 'Aucun client trouvé pour ces critères.' });

    // 🔹 قائمة الزبائن المؤهلين (فريد حسب _id)
    const uniqueClientsMap = {};
    historiques.forEach(h => {
      const id = h.clientId._id.toString();
      uniqueClientsMap[id] = {
        clientId: h.clientId._id,
        name: h.clientId.name,
        number: h.clientId.number,
        city: h.ville // المدينة التي حصل فيها على النقاط
      };
    });
    const uniqueClients = Object.values(uniqueClientsMap);

    // 🔹 اختيار فائزين عشوائيين
    const winners = [];
    const usedIndexes = new Set();
    const totalEligible = uniqueClients.length;
    const actualWinnersCount = Math.min(winnersCount, totalEligible);

    while (winners.length < actualWinnersCount) {
      const randIndex = crypto.randomInt(0, totalEligible);
      if (!usedIndexes.has(randIndex)) {
        winners.push(uniqueClients[randIndex]);
        usedIndexes.add(randIndex);
      }
    }

    // 🔹 حفظ الطومبولا في DB
    const tombola = await Tombola.create({
      adminId,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      cities,
      winners,
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: `🎉 ${winners.length} gagnant(s) sélectionné(s) avec succès !`,
      criteria: { dateFrom, dateTo, cities, totalEligible },
      winners,
      tombolaId: tombola._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};


const listTombolas = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { dateFrom, dateTo, cities } = req.query;

    let filter = { adminId };

    // فلترة حسب التاريخ
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    let tombolas = await Tombola.find(filter).sort({ createdAt: -1 });

    // فلترة حسب المدن
    if (cities) {
      const citiesArray = Array.isArray(cities) ? cities : cities.split(',');
      tombolas = tombolas.filter(t =>
        t.cities.some(c => citiesArray.includes(c))
      );
    }

    // التأكد من أن كل فائز حصل فعلاً على نقاط في المدينة والفترة الصحيحة
    const results = await Promise.all(tombolas.map(async t => {
      const winnerIds = t.winners.map(w => w.clientId);

      const historiques = await Historique.find({
        clientId: { $in: winnerIds },
        type: 'ajout',
        ville: { $in: t.cities },
        dateOperation: { $gte: t.dateFrom, $lte: t.dateTo }
      }).populate('clientId', 'name number city');

      const validWinnersMap = {};
      historiques.forEach(h => {
        validWinnersMap[h.clientId._id.toString()] = {
          clientId: h.clientId._id,
          name: h.clientId.name,
          number: h.clientId.number,
          city: h.ville
        };
      });

      return {
        tombolaId: t._id,
        dateFrom: t.dateFrom,
        dateTo: t.dateTo,
        cities: t.cities,
        totalWinners: Object.keys(validWinnersMap).length,
        winners: Object.values(validWinnersMap),
        createdAt: t.createdAt
      };
    }));

    res.json({
      success: true,
      count: results.length,
      tombolas: results
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};


module.exports = { createVendor, editVendor, toggleVendor, listClients, listVendors, listVendorsWithClients, updateAdminProfile, getAdminStats, deleteAllVendors, drawTombolaWinners, listTombolas };
