const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
      [full_name, email, password_hash, phone || null]
    );

    // Tạo cart cho user mới
    await pool.query('INSERT INTO cart (user_id) VALUES (?)', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      data: { user_id: result.insertId, full_name, email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng xuất
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Đăng xuất thành công!' });
};

// Lấy thông tin user hiện tại
exports.getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, phone, role, is_active, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật profile
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    await pool.query(
      'UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?',
      [full_name, phone, req.user.user_id]
    );
    res.json({ success: true, message: 'Cập nhật thông tin thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Lấy tất cả users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
