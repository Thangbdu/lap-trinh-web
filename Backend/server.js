const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const categoryBrandRoutes = require('./src/routes/categoryBrandRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const addressRoutes = require('./src/routes/addressRoutes');
const reviewWishlistRoutes = require('./src/routes/reviewWishlistRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const emailRoutes = require('./src/routes/emailRoutes');
const oauthRoutes = require('./src/routes/oauthRoutes');
const promotionRoutes = require('./src/routes/promotionRoutes');

// Import middleware
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware
// ============================================
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://localhost:4173',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/uploads', express.static('public'));

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
app.use('/api/admin', adminRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/oauth', oauthRoutes);

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
