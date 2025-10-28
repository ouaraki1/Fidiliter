const Product = require('../models/Product');


const createProduct = async (req, res) => {
  try {
    const { name, size, unit, points } = req.body;

    if (!['ml', 'l', 'kg', 'g', 'taille', 'pas uniter'].includes(unit)) {
      return res.status(400).json({ message: 'Invalid unit' });
    }

    const product = await Product.create({ name, size, unit, points });
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    if (updates.unit && !['ml', 'l', 'kg', 'g', 'taille', 'pas uniter'].includes(updates.unit)) {
      return res.status(400).json({ message: 'Invalid unit' });
    }

    updates.updatedAt = Date.now();

    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product updated', product: updatedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const listProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProduct, updateProduct, deleteProduct, listProducts };
