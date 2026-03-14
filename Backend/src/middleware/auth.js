const jwt = require('jsonwebtoken');
require('dotenv').config();

// Xác thực token JWT
const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Chưa đăng nhập. Vui lòng đăng nhập.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

// Phân quyền admin
const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };
