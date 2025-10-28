
const Product = require('../models/Product');

const createProduct = async (req, res) => {
  try {
    const { name, size, unit, points, code } = req.body;
    const adminId = req.user.id; 

    if (!['ml', 'l', 'kg', 'g', 'taille', 'pas uniter'].includes(unit)) {
      return res.status(400).json({ message: 'Invalid unit' });
    }

    const existingCode = await Product.findOne({ code, adminId });
    if (existingCode) {
      return res.status(400).json({ message: 'Code déjà utilisé pour un autre produit.' });
    }

    const product = await Product.create({
      name,
      size,
      unit,
      points,
      code,
      adminId,
    });

    res.status(201).json({ message: 'Produit créé avec succès', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    const adminId = req.user.id;

    if (updates.unit && !['ml', 'l', 'kg', 'g', 'taille', 'pas uniter'].includes(updates.unit)) {
      return res.status(400).json({ message: 'Invalid unit' });
    }

    updates.updatedAt = Date.now();

    const product = await Product.findOneAndUpdate(
      { _id: productId, adminId },
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable ou non autorisé' });
    }

    res.json({ message: 'Produit mis à jour', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const adminId = req.user.id;

    const deletedProduct = await Product.findOneAndDelete({ _id: productId, adminId });
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Produit introuvable ou non autorisé' });
    }

    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const listProducts = async (req, res) => {
  try {
    const adminId = req.user.id;
    const products = await Product.find({ adminId });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { createProduct, updateProduct, deleteProduct, listProducts };
