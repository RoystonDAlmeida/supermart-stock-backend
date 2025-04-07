
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// GET all sales for the authenticated user
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST record a sale
router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Find product without the userId restriction
    // This allows cashiers to record sales for products they didn't create
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if enough stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    // Create sale record
    const sale = new Sale({
      productId: product._id,
      productName: product.name,
      quantity,
      totalAmount: product.price * quantity,
      userId: req.user.id // Record which user made the sale
    });
    
    // Save the sale
    await sale.save();
    
    // Update product stock and sales count
    product.stock -= quantity;
    product.salesCount += quantity;
    await product.save();
    
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
