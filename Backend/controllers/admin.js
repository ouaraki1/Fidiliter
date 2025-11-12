const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const Historique = require("../models/Historique");
const Product = require("../models/Product");
const Tombola = require("../models/Tombola");
const crypto = require("crypto");
const AdminFile = require('../models/AdminFile');
 
const createVendor = async (req, res) => {
  try {
    const { name, number, city, password } = req.body;

    const adminId = req.user._id;
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "🚫 Access denied." });
    }

    // التحقق من الحد الأقصى للبائعين
    const currentVendorsCount = await User.countDocuments({
      role: "vendor",
      assignedAdmin: adminId,
    });

    const maxVendors = admin.maxVendors ?? 5;
    if (currentVendorsCount >= maxVendors) {
      return res.status(400).json({
        message: `🚫 Limite de vendeurs atteinte (${maxVendors}) pour cet admin.`,
      });
    }

    // ✅ التحقق من تكرار رقم الهاتف لأي بائع في النظام
    const existingVendor = await User.findOne({
      role: "vendor",
      number: number
    });

    if (existingVendor) {
      return res.status(400).json({
        message: "🚫 Ce numéro est déjà utilisé par un autre vendeur."
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const vendor = await User.create({
      role: "vendor",
      name,
      number,
      city,
      password: hashed,
      assignedAdmin: adminId,
      createdByAdmin: adminId,
    });

    res.status(201).json({
      message: "✅ Vendeur créé avec succès",
      vendor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



const editVendor = async (req, res) => {
  try {
    const updates = req.body;

    // إذا تم تمرير كلمة مرور جديدة، تشفيرها
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // البحث عن البائع
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // التأكد من صلاحيات الادمن
    if (
      req.user.role === "admin" &&
      vendor.assignedAdmin?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ✅ التحقق من تكرار رقم الهاتف لأي بائع آخر في النظام
    if (updates.number && updates.number !== vendor.number) {
      const existingVendor = await User.findOne({
        role: "vendor",
        number: updates.number,
        _id: { $ne: vendor._id }, // استثناء البائع الحالي
      });

      if (existingVendor) {
        return res.status(400).json({
          message: "🚫 Ce numéro est déjà utilisé par un autre vendeur.",
        });
      }
    }

    // تطبيق التحديثات
    Object.assign(vendor, updates);
    await vendor.save();

    res.json({
      success: true,
      message: "✅ Vendor updated successfully",
      vendor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (req.file) {
      if (admin.imgPublicId) {
        await cloudinary.uploader.destroy(admin.imgPublicId);
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "admins" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      updates.img = result.secure_url;
      updates.imgPublicId = result.public_id;
    }

    const updatedAdmin = await User.findByIdAndUpdate(adminId, updates, {
      new: true,
    }).select("-password");

    res.json({
      message: "Profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const toggleVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    if (
      req.user.role === "admin" &&
      vendor.assignedAdmin?.toString() !== req.user._id.toString()
    )
      return res.status(403).json({ message: "Not allowed" });
    vendor.disabled = !vendor.disabled;
    await vendor.save();
    res.json({ vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCloudImage = async (publicId) => {
  try {
    if (publicId) await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("❌ Erreur suppression Cloudinary:", err.message);
  }
};

const deleteVendor = async (req, res) => {
  try {
    const adminId = req.user._id;
    const vendorId = req.params.id;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Accès refusé." });
    }

    const vendor = await User.findOne({
      _id: vendorId,
      role: "vendor",
      assignedAdmin: adminId,
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendeur introuvable ou non autorisé." });
    }

    const clients = await User.find({ role: "client", createdByVendor: vendorId });
    for (const client of clients) {
      await deleteCloudImage(client.imgPublicId);
      await Historique.deleteMany({ client: client._id });
      await client.deleteOne();
    }

    const products = await Product.find({ createdByVendor: vendorId });
    for (const product of products) {
      await deleteCloudImage(product.imgPublicId);
      await product.deleteOne();
    }

    await Historique.deleteMany({ vendeurId: vendorId });

    await deleteCloudImage(vendor.imgPublicId);

    await vendor.deleteOne();

    res.json({
      success: true,
      message: `✅ Le vendeur "${vendor.name}" et toutes ses données ont été supprimés avec succès.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur", error: err.message });
  }
};

const deleteAllVendors = async (req, res) => {
  try {
    const adminId = req.user._id;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Accès refusé." });
    }

    const vendors = await User.find({ role: "vendor", assignedAdmin: adminId });

    for (const vendor of vendors) {
      const clients = await User.find({ role: "client", createdByVendor: vendor._id });
      for (const client of clients) {
        await deleteCloudImage(client.imgPublicId);
        await Historique.deleteMany({ client: client._id });
        await client.deleteOne();
      }

      const products = await Product.find({ createdByVendor: vendor._id });
      for (const product of products) {
        await deleteCloudImage(product.imgPublicId);
        await product.deleteOne();
      }

      await Historique.deleteMany({ vendeurId: vendor._id });
      await deleteCloudImage(vendor.imgPublicId);
      await vendor.deleteOne();
    }

    res.json({
      success: true,
      message: `✅ Tous les vendeurs (${vendors.length}) et leurs clients/historiques ont été supprimés.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur", error: err.message });
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
      return res
        .status(400)
        .json({
          success: false,
          message: "Veuillez indiquer la période (du... au...)",
        });

    if (!Array.isArray(cities) || cities.length === 0)
      return res
        .status(400)
        .json({
          success: false,
          message: "Veuillez sélectionner au moins une ville.",
        });

    if (!winnersCount || winnersCount <= 0)
      return res
        .status(400)
        .json({
          success: false,
          message: "Veuillez indiquer un nombre de gagnants valide.",
        });

    const vendorIds = await User.find({
      role: "vendor",
      assignedAdmin: adminId,
    }).distinct("_id");

    const historiques = await Historique.find({
      type: "ajout",
      vendeurId: { $in: vendorIds },
      ville: { $in: cities },
      dateOperation: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
    }).populate("clientId", "name number city");

    if (historiques.length === 0)
      return res
        .status(404)
        .json({
          success: false,
          message: "Aucun client trouvé pour ces critères.",
        });

    const uniqueClientsMap = {};
    historiques.forEach((h) => {
      const id = h.clientId._id.toString();
      uniqueClientsMap[id] = {
        clientId: h.clientId._id,
        name: h.clientId.name,
        number: h.clientId.number,
        city: h.ville,
      };
    });
    const uniqueClients = Object.values(uniqueClientsMap);

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

    const tombola = await Tombola.create({
      adminId,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      cities,
      winners,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      message: `🎉 ${winners.length} gagnant(s) sélectionné(s) avec succès !`,
      criteria: { dateFrom, dateTo, cities, totalEligible },
      winners,
      tombolaId: tombola._id,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  }
};

// const listTombolas = async (req, res) => {
//   try {
//     const adminId = req.user._id;
//     const { dateFrom, dateTo, cities } = req.query;

//     let filter = { adminId };

//     if (dateFrom || dateTo) {
//       filter.createdAt = {};
//       if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
//       if (dateTo) filter.createdAt.$lte = new Date(dateTo);
//     }

//     let tombolas = await Tombola.find(filter).sort({ createdAt: -1 });

//     if (cities) {
//       const citiesArray = Array.isArray(cities) ? cities : cities.split(",");
//       tombolas = tombolas.filter((t) =>
//         t.cities.some((c) => citiesArray.includes(c))
//       );
//     }
//     const results = await Promise.all(
//       tombolas.map(async (t) => {
//         const winnerIds = t.winners.map((w) => w.clientId);

//         const historiques = await Historique.find({
//           clientId: { $in: winnerIds },
//           type: "ajout",
//           ville: { $in: t.cities },
//           dateOperation: { $gte: t.dateFrom, $lte: t.dateTo },
//         }).populate("clientId", "name number city");

//         const validWinnersMap = {};
//         historiques.forEach((h) => {
//           validWinnersMap[h.clientId._id.toString()] = {
//             clientId: h.clientId._id,
//             name: h.clientId.name,
//             number: h.clientId.number,
//             city: h.ville,
//           };
//         });

//         return {
//           tombolaId: t._id,
//           dateFrom: t.dateFrom,
//           dateTo: t.dateTo,
//           cities: t.cities,
//           totalWinners: Object.keys(validWinnersMap).length,
//           winners: Object.values(validWinnersMap),
//           createdAt: t.createdAt,
//         };
//       })
//     );

//     res.json({
//       success: true,
//       count: results.length,
//       tombolas: results,
//     });
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ success: false, message: "Erreur serveur", error: err.message });
//   }
// };

// const listClients = async (req, res) => {
//   try {
//     const vendors = await User.find({
//       assignedAdmin: req.user._id,
//       role: "vendor",
//     });
//     const vendorIds = vendors.map((v) => v._id);
//     const clients = await User.find({
//       createdByVendor: { $in: vendorIds },
//       role: "client",
//     });
//     res.json(clients);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const listVendors = async (req, res) => {
//   try {
//     const adminId = req.user._id;
//     const vendors = await User.find({
//       role: "vendor",
//       assignedAdmin: adminId,
//     }).select("-password");
//     res.json(vendors);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const listVendorsWithClients = async (req, res) => {
//   try {
//     const adminId = req.user._id;
//     const vendors = await User.find({
//       role: "vendor",
//       assignedAdmin: adminId,
//     }).select("-password");

//     const result = await Promise.all(
//       vendors.map(async (vendor) => {
//         const clients = await User.find({
//           role: "client",
//           createdByVendor: vendor._id,
//         }).select("-password");
//         return {
//           vendor,
//           clients,
//         };
//       })
//     );

//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// ================== listTombolas مع Pagination مباشر ==================
const listTombolas = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { dateFrom, dateTo, cities, page = 1, limit = 10 } = req.query;

    let filter = { adminId };

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    let tombolasQuery = Tombola.find(filter).sort({ createdAt: -1 });

    if (cities) {
      const citiesArray = Array.isArray(cities) ? cities : cities.split(",");
      tombolasQuery = tombolasQuery.where("cities").in(citiesArray);
    }

    const total = await tombolasQuery.clone().countDocuments();

    const tombolas = await tombolasQuery
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const results = await Promise.all(
      tombolas.map(async (t) => {
        const winnerIds = t.winners.map((w) => w.clientId);

        const historiques = await Historique.find({
          clientId: { $in: winnerIds },
          type: "ajout",
          ville: { $in: t.cities },
          dateOperation: { $gte: t.dateFrom, $lte: t.dateTo },
        }).populate("clientId", "name number city");

        const validWinnersMap = {};
        historiques.forEach((h) => {
          validWinnersMap[h.clientId._id.toString()] = {
            clientId: h.clientId._id,
            name: h.clientId.name,
            number: h.clientId.number,
            city: h.ville,
          };
        });

        return {
          tombolaId: t._id,
          dateFrom: t.dateFrom,
          dateTo: t.dateTo,
          cities: t.cities,
          totalWinners: Object.keys(validWinnersMap).length,
          winners: Object.values(validWinnersMap),
          createdAt: t.createdAt,
        };
      })
    );

    res.json({
      success: true,
      count: results.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      tombolas: results,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  }
};

const listClients = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const vendors = await User.find({
      assignedAdmin: req.user._id,
      role: "vendor",
    });
    const vendorIds = vendors.map((v) => v._id);

    const clientsQuery = User.find({
      createdByVendor: { $in: vendorIds },
      role: "client",
    });

    const total = await clientsQuery.clone().countDocuments();

    const clients = await clientsQuery
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: clients.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      clients,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const listVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const adminId = req.user._id;

    const vendorsQuery = User.find({
      role: "vendor",
      assignedAdmin: adminId,
    }).select("-password");

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
    res.status(500).json({ message: "Server error" });
  }
};

const listVendorsWithClients = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const adminId = req.user._id;

    const vendorsQuery = User.find({
      role: "vendor",
      assignedAdmin: adminId,
    }).select("-password");

    const total = await vendorsQuery.clone().countDocuments();

    const vendors = await vendorsQuery
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const result = await Promise.all(
      vendors.map(async (vendor) => {
        const clients = await User.find({
          role: "client",
          createdByVendor: vendor._id,
        }).select("-password");
        return {
          vendor,
          clients,
        };
      })
    );

    res.json({
      success: true,
      count: result.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      vendorsWithClients: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const getAdminStats = async (req, res) => {
  try {
    const adminId = req.user._id;

    const vendors = await User.find({ role: "vendor", assignedAdmin: adminId });
    const vendorIds = vendors.map((v) => v._id);

    const clients = await User.find({
      role: "client",
      createdByVendor: { $in: vendorIds },
    });

    const products = await Product.find({ createdByAdmin: adminId });

    const historiques = await Historique.find({ vendeurId: { $in: vendorIds } })
      .populate("clientId", "name number")
      .populate("produitId", "name points")
      .sort({ createdAt: -1 });

    const totalVendors = vendors.length;
    const totalClients = clients.length;
    const totalProducts = products.length;
    const totalPoints = historiques
      .filter((h) => h.type === "ajout")
      .reduce((sum, h) => sum + (h.produitId?.points || 0) * h.quantite, 0);
    const totalGifts = historiques.filter((h) => h.type === "cadeau").length;

    const vendorStatsMap = {};
    historiques.forEach((h) => {
      const vId = h.vendeurId.toString();
      vendorStatsMap[vId] = vendorStatsMap[vId] || { points: 0, operations: 0 };
      if (h.type === "ajout")
        vendorStatsMap[vId].points += (h.produitId?.points || 0) * h.quantite;
      vendorStatsMap[vId].operations += 1;
    });

    const topVendors = vendors
      .map((v) => ({
        id: v._id,
        name: v.name,
        points: vendorStatsMap[v._id.toString()]?.points || 0,
        operations: vendorStatsMap[v._id.toString()]?.operations || 0,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    const clientPointsMap = {};
    historiques.forEach((h) => {
      if (h.type === "ajout") {
        const cId = h.clientId?._id?.toString();
        if (!cId) return;
        clientPointsMap[cId] =
          (clientPointsMap[cId] || 0) + (h.produitId?.points || 0) * h.quantite;
      }
    });

    const topClients = clients
      .map((c) => ({
        id: c._id,
        name: c.name,
        number: c.number,
        pointsReceived: clientPointsMap[c._id.toString()] || 0,
      }))
      .sort((a, b) => b.pointsReceived - a.pointsReceived)
      .slice(0, 5);

    const pointsByDay = {};
    historiques.forEach((h) => {
      if (h.type === "ajout") {
        const day = h.createdAt.toISOString().slice(0, 10);
        pointsByDay[day] =
          (pointsByDay[day] || 0) + (h.produitId?.points || 0) * h.quantite;
      }
    });
    const chartPoints = Object.keys(pointsByDay).map((date) => ({
      date,
      points: pointsByDay[date],
    }));

    const giftsByDay = {};
    historiques.forEach((h) => {
      if (h.type === "cadeau") {
        const day = h.createdAt.toISOString().slice(0, 10);
        giftsByDay[day] = (giftsByDay[day] || 0) + 1;
      }
    });
    const chartGifts = Object.keys(giftsByDay).map((date) => ({
      date,
      gifts: giftsByDay[date],
    }));

    const productMap = {};
    historiques.forEach((h) => {
      if (!h.produitId?.name) return;
      const name = h.produitId.name;
      productMap[name] = productMap[name] || { points: 0, quantity: 0 };
      if (h.type === "ajout") {
        productMap[name].points += (h.produitId?.points || 0) * h.quantite;
        productMap[name].quantity += h.quantite;
      }
    });

    const topProducts = Object.entries(productMap)
      .map(([name, data]) => ({
        name,
        points: data.points,
        quantity: data.quantity,
      }))
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
        chartGifts,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erreur serveur", error: err.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { name } = req.body;

    if (!req.file) return res.status(400).json({ message: 'File required' });

    const fileType = req.file.mimetype.includes('image') ? 'img' : 'pdf';

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'admin_files' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      stream.end(req.file.buffer);
    });

    const vendors = await User.find({ assignedAdmin: adminId, role: 'vendor' }).distinct('_id');

    const clients = await User.find({
      $or: [
        { createdByAdmin: adminId },
        { createdByVendor: { $in: vendors } }
      ],
      role: 'client'
    }).distinct('_id');

    const file = await AdminFile.create({
      name,
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
      fileType,
      adminId,
      clientsAllowed: clients,
    });

    res.status(201).json({ success: true, file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const adminId = req.user._id;

    const file = await AdminFile.findById(id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.adminId.toString() !== adminId.toString())
      return res.status(403).json({ message: 'Not allowed' });

    if (req.file) {
      // delete old
      await cloudinary.uploader.destroy(file.filePublicId);

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'admin_files' }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        stream.end(req.file.buffer);
      });

      file.fileUrl = result.secure_url;
      file.filePublicId = result.public_id;
      file.fileType = req.file.mimetype.includes('image') ? 'img' : 'pdf';
    }

    if (name) file.name = name;

    const vendors = await User.find({ assignedAdmin: adminId, role: 'vendor' }).distinct('_id');
    const clients = await User.find({
      $or: [
        { createdByAdmin: adminId },
        { createdByVendor: { $in: vendors } }
      ],
      role: 'client'
    }).distinct('_id');

    file.clientsAllowed = clients;

    await file.save();
    res.json({ success: true, file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const file = await AdminFile.findById(id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.adminId.toString() !== adminId.toString())
      return res.status(403).json({ message: 'Not allowed' });

    await cloudinary.uploader.destroy(file.filePublicId);
    await file.deleteOne();

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createVendor,
  editVendor,
  toggleVendor,
  listClients,
  listVendors,
  listVendorsWithClients,
  updateAdminProfile,
  getAdminStats,
  drawTombolaWinners,
  listTombolas,
  deleteAllVendors,
  deleteVendor,
  deleteFile,
  updateFile,
  uploadFile,
};
