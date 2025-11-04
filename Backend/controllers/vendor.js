const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendWhatsAppMessage } = require('../whatsapp');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');
const Historique = require('../models/Historique');


const createClient = async (req, res) => {
  try {
    const { name, number, city, password } = req.body;

    if (!name || !number || !password) {
      return res.status(400).json({
        success: false,
        message: '❌ Le nom, le numéro et le mot de passe sont requis.'
      });
    }

    const cleanNumber = number.replace(/\D/g, '');
    const adminId = req.user.createdByAdmin || req.user.assignedAdmin || req.user._id;

    const existingClient = await User.findOne({
      number: cleanNumber,
      createdByAdmin: adminId,
      role: 'client'
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: '❌ Ce numéro est déjà utilisé par le même administrateur.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const clientData = {
      role: 'client',
      name,
      number: cleanNumber,
      city,
      password: hashedPassword,
      createdByVendor: req.user._id,
      createdByAdmin: adminId
    };

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'clients' }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        stream.end(req.file.buffer);
      });
      clientData.img = result.secure_url;
      clientData.imgPublicId = result.public_id;
    }

    const client = await User.create(clientData);

    const message = `Bonjour ${name},\nNuméro de téléphone : ${cleanNumber}\nMot de passe : ${password}`;
    await sendWhatsAppMessage(cleanNumber, message);

    res.status(201).json({
      success: true,
      message: '✅ Le client a été créé avec succès et un message WhatsApp a été envoyé.',
      client: {
        _id: client._id,
        name: client.name,
        number: client.number,
        city: client.city,
        img: client.img,
        createdAt: client.createdAt
      }
    });

  } catch (err) {
    console.error('❌ Erreur lors de la création du client :', err);
    res.status(500).json({
      success: false,
      message: 'Erreur du serveur',
      error: err.message
    });
  }
};


const editClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const client = await User.findById(clientId);

    if (!client) return res.status(404).json({ message: '❌ Client introuvable' });

    const sameAdmin =
      (client.createdByAdmin && req.user.createdByAdmin && client.createdByAdmin.toString() === req.user.createdByAdmin.toString()) ||
      (req.user._id.toString() === client.createdByAdmin?.toString());

    if (!sameAdmin) {
      return res.status(403).json({ message: '❌ Vous n’êtes pas autorisé à modifier ce client.' });
    }

    const updates = req.body;

    if (updates.number && updates.number !== client.number) {
      const adminId = client.createdByAdmin;
      const existingClient = await User.findOne({
        number: updates.number.replace(/\D/g, ''),
        createdByAdmin: adminId,
        role: 'client',
        _id: { $ne: clientId }
      });
      if (existingClient) {
        return res.status(400).json({ message: '❌ Ce numéro est déjà utilisé par un autre client du même administrateur.' });
      }
      updates.number = updates.number.replace(/\D/g, '');
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    if (req.file) {
      if (client.imgPublicId) await cloudinary.uploader.destroy(client.imgPublicId);

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'clients' }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        stream.end(req.file.buffer);
      });

      updates.img = result.secure_url;
      updates.imgPublicId = result.public_id;
    }

    const updatedClient = await User.findByIdAndUpdate(clientId, updates, { new: true }).select('-password');

    res.json({
      success: true,
      message: '✅ Le client a été modifié avec succès.',
      client: updatedClient
    });

  } catch (err) {
    console.error('❌ Erreur lors de la modification du client :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


const toggleClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const client = await User.findById(clientId);

    if (!client) return res.status(404).json({ message: '❌ Client introuvable' });

    const sameAdmin =
      (client.createdByAdmin && req.user.createdByAdmin && client.createdByAdmin.toString() === req.user.createdByAdmin.toString()) ||
      (req.user._id.toString() === client.createdByAdmin?.toString());

    if (!sameAdmin) {
      return res.status(403).json({ message: '❌ Vous n’êtes pas autorisé à effectuer cette action.' });
    }

    client.disabled = !client.disabled;
    await client.save();

    res.json({
      success: true,
      message: `✅ Le client a été ${client.disabled ? 'désactivé' : 'activé'} avec succès.`,
      client: {
        _id: client._id,
        name: client.name,
        number: client.number,
        disabled: client.disabled
      }
    });

  } catch (err) {
    console.error('❌ Erreur lors du changement d’état du client :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


const searchClients = async (req, res) => {
  try {
    const adminId = req.user.assignedAdmin || req.user.createdByAdmin || req.user._id; 
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Veuillez entrer une valeur de recherche.' });
    }

    const regex = new RegExp(query, 'i');

    const clients = await User.find({
      role: 'client',
      createdByAdmin: adminId, 
      $or: [{ name: regex }, { number: regex }]
    }).select('-password');

    res.json({ success: true, clients, count: clients.length });
  } catch (err) {
    console.error('❌ Erreur lors de la recherche des clients :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};


const ajouterPointsClient = async (req, res) => {
  try {
    const { clientId, produitId, variantId, quantite, ville } = req.body;
    const vendeurId = req.user._id;

    if (!clientId || !produitId || !quantite || !ville || !variantId) {
      return res.status(400).json({
        success: false,
        message: '❌ Tous les champs sont requis (client, produit, variant, quantité, ville).'
      });
    }

    const client = await User.findById(clientId);
    if (!client)
      return res.status(404).json({ success: false, message: '❌ Client introuvable.' });

    const produit = await Product.findById(produitId);
    if (!produit)
      return res.status(404).json({ success: false, message: '❌ Produit introuvable.' });

    const vendeur = await User.findById(vendeurId);
    if (!vendeur)
      return res.status(404).json({ success: false, message: '❌ Vendeur introuvable.' });

    const variant = produit.variants.id(variantId);
    if (!variant)
      return res.status(404).json({ success: false, message: '❌ Variant introuvable.' });

    const clientAdminId = client.createdByAdmin;             
    const vendeurAdminId = vendeur.assignedAdmin || vendeur._id; 

    if (!clientAdminId || clientAdminId.toString() !== vendeurAdminId.toString()) {
      return res.status(403).json({
        success: false,
        message: '🚫 Vous ne pouvez ajouter des points qu’aux clients de votre administrateur.'
      });
    }

    const pointsAjoutes = variant.points * quantite;

    client.points += pointsAjoutes;
    await client.save();

    await Historique.create({
      clientId,
      clientName: client.name,
      clientNumber: client.number,
      clientCity: client.city,

      vendeurId,
      vendeurName: vendeur.name,
      storeName: vendeur.storeName || '',

      produitId,
      variantId,
      produitName: produit.name,
      produitSize: variant.size,
      produitUnit: variant.unit,

      quantite,
      pointsAjoutes,
      totalPointsClient: client.points,
      type: 'ajout',
      ville
    });

    res.status(200).json({
      success: true,
      message: `✅ ${pointsAjoutes} points ajoutés au client ${client.name}.`,
      data: {
        clientId: client._id,
        clientName: client.name,
        totalPoints: client.points
      }
    });

  } catch (err) {
    console.error('❌ Erreur lors de l’ajout des points :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};


const donnerCadeauClient = async (req, res) => {
  try {
    const { clientId, produitId, variantId, ville } = req.body;
    const vendeurId = req.user._id;

    if (!clientId || !produitId || !variantId || !ville) {
      return res.status(400).json({
        success: false,
        message: '❌ Tous les champs sont requis (client, produit, variant, ville).'
      });
    }

    const client = await User.findById(clientId);
    if (!client)
      return res.status(404).json({ success: false, message: '❌ Client introuvable.' });

    const produit = await Product.findById(produitId);
    if (!produit)
      return res.status(404).json({ success: false, message: '❌ Produit introuvable.' });

    const vendeur = await User.findById(vendeurId);
    if (!vendeur)
      return res.status(404).json({ success: false, message: '❌ Vendeur introuvable.' });

    const variant = produit.variants.id(variantId);
    if (!variant)
      return res.status(404).json({ success: false, message: '❌ Variant introuvable.' });

    const clientAdminId = client.createdByAdmin;             
    const vendeurAdminId = vendeur.assignedAdmin || vendeur._id; 

    if (!clientAdminId || clientAdminId.toString() !== vendeurAdminId.toString()) {
      return res.status(403).json({
        success: false,
        message: '🚫 Vous ne pouvez offrir des cadeaux qu’aux clients de votre administrateur.'
      });
    }

    if (client.points < variant.points) {
      return res.status(400).json({
        success: false,
        message: `⚠️ Le client n’a pas assez de points. (${client.points} / ${variant.points})`
      });
    }

    client.points -= variant.points;
    await client.save();

    await Historique.create({
      clientId,
      clientName: client.name,
      clientNumber: client.number,
      clientCity: client.city,

      vendeurId,
      vendeurName: vendeur.name,
      storeName: vendeur.storeName || '',

      produitId,
      variantId,
      produitName: produit.name,
      produitSize: variant.size,
      produitUnit: variant.unit,

      quantite: 1,
      pointsAjoutes: -variant.points, 
      totalPointsClient: client.points,
      type: 'cadeau',
      ville
    });

    res.status(200).json({
      success: true,
      message: `🎁 Le produit "${produit.name}" a été offert au client ${client.name}.`,
      data: {
        clientId: client._id,
        clientName: client.name,
        produitName: produit.name,
        pointsRestants: client.points
      }
    });

  } catch (err) {
    console.error('❌ Erreur lors du don de cadeau :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};




const getHistorique = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    const { startDate, endDate, type, clientName, clientNumber, ville } = req.query;
    let filter = {};

    if (user.role === 'admin') {
      filter['vendeurId'] = { $in: await User.find({ assignedAdmin: user._id }).distinct('_id') };
    }

    else if (user.role === 'vendeur') {
      const sameAdminVendeurs = await User.find({
        assignedAdmin: user.assignedAdmin
      }).distinct('_id');

      filter['vendeurId'] = { $in: sameAdminVendeurs };
    }

    if (startDate || endDate) {
      filter.dateOperation = {};
      if (startDate) filter.dateOperation.$gte = new Date(startDate);
      if (endDate) filter.dateOperation.$lte = new Date(endDate);
    }

    if (type) filter.type = type;
    if (ville) filter.ville = new RegExp(ville, 'i');
    if (clientName) filter.clientName = new RegExp(clientName, 'i');
    if (clientNumber) filter.clientNumber = clientNumber;
    const historique = await Historique.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: historique.length,
      historique
    });

  } catch (err) {
    console.error('❌ Erreur lors de la récupération de l’historique :', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: err.message
    });
  }
};


const getMyClients = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const clients = await User.find({ role: 'client', createdByVendor: vendorId })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: '✅ Liste de vos clients récupérée avec succès.',
      clients,
      count: clients.length
    });

  } catch (err) {
    console.error('❌ Erreur lors de la récupération des clients :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


const getALLClients = async (req, res) => {
  try {
    const adminId = req.user.createdByAdmin || req.user._id;

    const clients = await User.find({ role: 'client', createdByAdmin: adminId })
      .populate('createdByVendor', 'name number')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: '✅ Tous les clients liés à votre administrateur ont été récupérés avec succès.',
      clients,
      count: clients.length
    });

  } catch (err) {
    console.error('❌ Erreur lors du chargement de tous les clients :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


const getClientDetails = async (req, res) => {
  try {
    const clientId = req.params.id;
    const user = req.user;

    const client = await User.findById(clientId).select('-password');
    if (!client) {
      return res.status(404).json({ success: false, message: '❌ Client introuvable.' });
    }

    const allowed =
      (user.role === 'admin' && client.createdByAdmin?.toString() === user._id.toString()) || 
      (user.role === 'vendor' && (
        client.createdByVendor?.toString() === user._id.toString() || 
        (client.createdByAdmin || client.assignedAdmin)?.toString() === user.assignedAdmin?.toString() 
      ));

    if (!allowed) {
      return res.status(403).json({ success: false, message: '❌ Vous n’êtes pas autorisé.' });
    }

    const historique = await Historique.find({ clientId })
      .populate('produitId', 'name code points')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      client: {
        _id: client._id,
        name: client.name,
        number: client.number,
        city: client.city,
        points: client.points,
        img: client.img,
        historique
      }
    });

  } catch (err) {
    console.error('❌ Erreur lors de la récupération du client :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};


const getVendeurStats = async (req, res) => {
  try {
    const vendeurId = req.user._id;

    const historiques = await Historique.find({ vendeurId })
      .populate('clientId', 'name number city points')
      .populate('produitId', 'name points')
      .sort({ createdAt: -1 });

    const totalOperations = historiques.length;
    const totalClients = new Set(historiques.map(h => h.clientId?._id?.toString())).size;
    const totalPointsDistribues = historiques
      .filter(h => h.type === 'ajout')
      .reduce((sum, h) => sum + (h.produitId?.points || 0) * h.quantite, 0);
    const totalCadeaux = historiques.filter(h => h.type === 'cadeau').length;

    const produitsMap = {};
    historiques.forEach(h => {
      if (!h.produitId?.name) return;
      const name = h.produitId.name;
      produitsMap[name] = (produitsMap[name] || 0) + h.quantite;
    });

    const topProduits = Object.entries(produitsMap)
      .map(([name, quantite]) => ({ name, quantite }))
      .sort((a, b) => b.quantite - a.quantite)
      .slice(0, 5);

    const clientsActivity = {};
    historiques.forEach(h => {
      const id = h.clientId?._id?.toString();
      if (!id) return;
      clientsActivity[id] = (clientsActivity[id] || 0) + 1;
    });
    const clientsFideles = Object.keys(clientsActivity).filter(id => clientsActivity[id] > 2).length;

    const ventesParJour = {};
    historiques.forEach(h => {
      const date = h.createdAt.toISOString().split('T')[0];
      ventesParJour[date] = (ventesParJour[date] || 0) + 1;
    });

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const pointsByDay = {};
    historiques.forEach(h => {
      if (h.type === 'ajout') {
        const day = h.createdAt.toISOString().slice(0, 10);
        pointsByDay[day] = (pointsByDay[day] || 0) + (h.produitId?.points || 0) * h.quantite;
      }
    });
    const pointsArray = Object.entries(pointsByDay)
      .filter(([date]) => new Date(date) >= firstDayOfMonth)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, pts]) => pts);
    const pointsStart = pointsArray[0] || 0;
    const pointsEnd = pointsArray[pointsArray.length - 1] || 0;
    const pointsGrowthRate = pointsStart > 0 ? ((pointsEnd - pointsStart) / pointsStart * 100).toFixed(2) : null;

    const clientPointsMap = {};
    historiques.forEach(h => {
      if (h.type === 'ajout' && h.clientId) {
        const id = h.clientId._id.toString();
        clientPointsMap[id] = clientPointsMap[id] || { name: h.clientId.name, points: 0 };
        clientPointsMap[id].points += (h.produitId?.points || 0) * h.quantite;
      }
    });
    const topClientsPoints = Object.values(clientPointsMap)
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    res.json({
      success: true,
      message: '✅ Statistiques du vendeur récupérées avec succès.',
      data: {
        totalOperations,
        totalClients,
        totalPointsDistribues,
        totalCadeaux,
        clientsFideles,
        topProduits,
        ventesParJour,
        pointsGrowthRate,    
        topClientsPoints     
      }
    });

  } catch (err) {
    console.error('❌ Erreur lors du calcul des statistiques vendeur :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const client = await User.findById(clientId);

    if (!client) return res.status(404).json({ success: false, message: '❌ Client introuvable' });

    const isAllowed =
      (req.user.role === 'admin' && client.createdByAdmin?.toString() === req.user._id.toString()) ||
      (req.user.role === 'vendor' && client.createdByVendor?.toString() === req.user._id.toString());

    if (!isAllowed) return res.status(403).json({ success: false, message: '❌ Action non autorisée' });

    if (client.imgPublicId) {
      await cloudinary.uploader.destroy(client.imgPublicId);
    }

    await Historique.deleteMany({ clientId });

    await User.findByIdAndDelete(clientId);

    res.json({
      success: true,
      message: `✅ Le client "${client.name}" a été supprimé avec succès.`
    });

  } catch (err) {
    console.error('❌ Erreur lors de la suppression du client :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};



module.exports = {
  createClient,
  editClient,
  toggleClient,
  getMyClients,
  getALLClients,

  ajouterPointsClient,
  donnerCadeauClient,
  getHistorique,

  searchClients,

  getClientDetails,

  getVendeurStats,
  deleteClient
};
