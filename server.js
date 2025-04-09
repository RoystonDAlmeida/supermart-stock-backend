
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/products');
const stockRoutes = require('./routes/stock');
const salesRoutes = require('./routes/sales');
const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/auth');

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
  connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// --- START: Health Check Endpoint ---
app.get('/health', async (req, res) => {
  try {
    // Check database connection state (optional but recommended)
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      // Optional: Ping the database for a more active check
      await mongoose.connection.db.admin().ping();
      res.status(200).json({ status: 'UP', message: 'Server and database connection are healthy.' });
    } else {
      // If not connected, report unhealthy status
      res.status(503).json({ status: 'DOWN', message: `Server is up, but database connection state is: ${dbState}` });
    }
  } catch (error) {
    console.error('Health check failed during DB ping:', error);
    // If ping fails, report unhealthy status
    res.status(503).json({ status: 'DOWN', message: 'Server is up, but database ping failed.', error: error.message });
  }
});
// --- END: Health Check Endpoint ---

// Public routes - no authentication needed
app.use('/auth', authRoutes);

// Protected routes - require authentication
app.use('/products', authenticate, productRoutes);
app.use('/stock', authenticate, stockRoutes);
app.use('/sales', authenticate, salesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
