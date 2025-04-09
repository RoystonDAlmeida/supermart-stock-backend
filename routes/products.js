
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products (accessible by all authenticated users)
router.get('/', async (req, res) => {
  try {
    // All users can see all products, regardless of who created them
    const products = await Product.find({ });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product (accessible by all authenticated users)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new product (accessible by managers and staff)
router.post('/', async (req, res) => {
  try {
    // Check if user has permission to create products
    if (req.user.role !== 'manager' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Permission denied: Only managers and staff can create products' });
    }

    const product = new Product({
      ...req.body,
      userId: req.user.id // Store who created the product
    });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update product (accessible by managers and staff)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has permission to update products
    if (req.user.role !== 'manager' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Permission denied: Only managers and staff can update products' });
    }

    // Update product fields
    Object.keys(req.body).forEach(key => {
      product[key] = req.body[key];
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE product (accessible only by managers)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user has permission to delete products
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Permission denied: Only managers can delete products' });
    }
    
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
