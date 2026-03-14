const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryBrandRoutes = require('./routes/categoryBrandRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const reviewWishlistRoutes = require('./routes/reviewWishlistRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware
// ============================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// ============================================
// Routes
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 MobileStore API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      brands: '/api/brands',
      cart: '/api/cart',
      orders: '/api/orders',
      addresses: '/api/addresses',
      reviews: '/api/reviews/:product_id',
      wishlist: '/api/wishlist',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', categoryBrandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api', reviewWishlistRoutes);

// ============================================
// Error Handling
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`\n🚀 MobileStore API Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📦 Môi trường: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 CORS cho phép: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});
