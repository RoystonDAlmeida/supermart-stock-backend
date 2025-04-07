
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const mongoose = require('mongoose');

// GET stock summary
router.get('/', async (req, res) => {
  try {
    // Get all products for the current user
    const products = await Product.find({ userId: req.user.id });
    
    // Get summary data
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    
    // Get total sold
    const totalSoldResult = await Sale.aggregate([
      {
        $match: { userId: mongoose.Types.ObjectId(req.user.id) }
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const totalSold = totalSoldResult.length > 0 ? totalSoldResult[0].totalQuantity : 0;
    const totalRevenue = totalSoldResult.length > 0 ? totalSoldResult[0].totalRevenue : 0;
    
    // Get low stock and out of stock products
    const lowStockProducts = products.filter(p => p.status === 'Low Stock');
    const outOfStockProducts = products.filter(p => p.status === 'Out of Stock');
    
    res.json({
      totalStock,
      totalSold,
      totalRevenue,
      lowStockProducts,
      outOfStockProducts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// This route is redundant as we now have it in the sales.js file
// POST record a sale
router.post('/sales', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    // Find product
    const product = await Product.findOne({ _id: productId, userId: req.user.id });
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
      userId: req.user.id
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

// GET sales history
router.get('/sales', async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
