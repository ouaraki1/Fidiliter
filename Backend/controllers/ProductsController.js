const Product = require('../models/Product');

const VALID_UNITS = ['ml', 'l', 'kg', 'g', 'taille', 'Bouteille vide', 'personne', 'pas uniter'];

const createProduct = async (req, res) => {
  try {
    let { name, code, size, unit, points } = req.body;
    const adminId = req.user.id;

    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    if (!size || size.trim() === '') size = 'unique';
    if (!unit || !VALID_UNITS.includes(unit)) unit = 'pas uniter';
    if (!points) points = 0;

    let product = await Product.findOne({
      createdByAdmin: adminId,
      $or: [{ code }, { name: new RegExp(`^${name}$`, 'i') }]
    });

    if (product) {
      const exists = product.variants.some(v => v.size === size && v.unit === unit);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Produit déjà existant avec le même nom, taille et unité.'
        });
      }

      product.variants.push({ size, unit, points });
      await product.save();

      return res.status(200).json({
        success: true,
        message: 'Nouvelle taille/unité ajoutée avec succès',
        data: product
      });
    }

    const newProduct = await Product.create({
      name,
      code,
      createdByAdmin: adminId,
      variants: [{ size, unit, points }]
    });

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: newProduct
    });
  } catch (err) {
    console.error('Erreur createProduct:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const adminId = req.user.id;

    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    const product = await Product.findOne({ _id: id, createdByAdmin: adminId });
    if (!product)
      return res.status(404).json({ success: false, message: 'Produit introuvable ou non autorisé.' });

    if (name && name.toLowerCase() !== product.name.toLowerCase()) {
      const exists = await Product.findOne({
        createdByAdmin: adminId,
        name: new RegExp(`^${name}$`, 'i'),
        _id: { $ne: id }
      });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Nom déjà utilisé par un autre produit.' });
      }
      product.name = name;
    }

    if (code && code !== product.code) {
      const existsCode = await Product.findOne({
        createdByAdmin: adminId,
        code,
        _id: { $ne: id }
      });
      if (existsCode) {
        return res.status(400).json({ success: false, message: 'Code déjà utilisé par un autre produit.' });
      }
      product.code = code;
    }

    product.updatedAt = new Date();
    await product.save();

    res.status(200).json({ success: true, message: 'Produit mis à jour avec succès', data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

const updateVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { size, unit, points } = req.body;
    const adminId = req.user.id;

    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    const product = await Product.findOne({ _id: productId, createdByAdmin: adminId });
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable ou non autorisé.' });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ success: false, message: 'Variant introuvable.' });

    if ((size && size !== variant.size) || (unit && unit !== variant.unit)) {
      const exists = product.variants.some(
        v => v._id.toString() !== variantId && v.size === (size || variant.size) && v.unit === (unit || variant.unit)
      );
      if (exists) {
        return res.status(400).json({ success: false, message: 'Cette taille/unité existe déjà pour ce produit.' });
      }
    }

    if (size) variant.size = size;
    if (unit) variant.unit = unit;
    if (points !== undefined) variant.points = points;

    product.updatedAt = new Date();
    await product.save();

    res.status(200).json({ success: true, message: 'Variant mise à jour avec succès', data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Accès refusé' });

    const product = await Product.findOne({ _id: id, createdByAdmin: adminId });
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable ou non autorisé.' });

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const adminId = req.user.id;

    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Accès refusé' });

    const product = await Product.findOne({ _id: productId, createdByAdmin: adminId });
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable ou non autorisé.' });

    const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
    if (variantIndex === -1) return res.status(404).json({ success: false, message: 'Variant introuvable.' });

    product.variants.splice(variantIndex, 1);
    product.updatedAt = new Date();
    await product.save();

    res.status(200).json({ success: true, message: 'Variant supprimé avec succès', data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
  }
};
const deleteAllProducts = async (req, res) => {
  try {
    const adminId = req.user.role === 'admin' ? req.user.id : req.user.assignedAdmin;
    const result = await Product.deleteMany({ createdByAdmin: adminId });
    res.json({ success: true, message: `${result.deletedCount} produits supprimés.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// const listProducts = async (req, res) => {
//   try {
//     const adminId = req.user.role === 'admin' ? req.user.id : req.user.assignedAdmin;
//     const produits = await Product.find({ createdByAdmin: adminId }).select('name code variants').sort({ name: 1 });
//     res.json({ success: true, data: produits });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Erreur serveur' });
//   }
// };

// const searchProducts = async (req, res) => {
//   try {
//     const adminId = req.user.role === 'admin' ? req.user.id : req.user.assignedAdmin;
//     const { query } = req.query;
//     if (!query) return res.status(400).json({ success: false, message: 'Entrez une valeur à rechercher' });

//     const regex = new RegExp(query, 'i');
//     const produits = await Product.find({ createdByAdmin: adminId, $or: [{ name: regex }, { code: regex }] }).select('name code variants');
//     res.json({ success: true, data: produits });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Erreur serveur' });
//   }
// };



const listProducts = async (req, res) => {
  try {
    const adminId = req.user.role === 'admin' ? req.user.id : req.user.assignedAdmin;
    const { page = 1, limit = 10 } = req.query;

    const query = Product.find({ createdByAdmin: adminId })
      .select('name code variants')
      .sort({ name: 1 });

    const total = await query.clone().countDocuments();

    const produits = await query
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: produits.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: produits,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const searchProducts = async (req, res) => {
  try {
    const adminId = req.user.role === 'admin' ? req.user.id : req.user.assignedAdmin;
    const { query, page = 1, limit = 10 } = req.query;

    if (!query)
      return res.status(400).json({ success: false, message: 'Entrez une valeur à rechercher' });

    const regex = new RegExp(query, 'i');
    const searchQuery = Product.find({
      createdByAdmin: adminId,
      $or: [{ name: regex }, { code: regex }],
    }).select('name code variants');

    const total = await searchQuery.clone().countDocuments();

    const produits = await searchQuery
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: produits.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: produits,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};



module.exports = {
  createProduct,
  updateProduct,
  updateVariant,
  deleteProduct,
  deleteVariant,
  listProducts,
  searchProducts,
  deleteAllProducts
};

