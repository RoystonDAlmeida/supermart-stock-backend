
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Groceries', 'Dairy', 'Bakery', 'Meat', 'Produce', 'Beverages', 'Snacks', 'Household', 'Other']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  salesCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update status based on stock levels
ProductSchema.pre('save', function(next) {
  if (this.isModified('stock')) {
    if (this.stock <= 0) {
      this.status = 'Out of Stock';
    } else if (this.stock <= 10) {
      this.status = 'Low Stock';
    } else {
      this.status = 'In Stock';
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
