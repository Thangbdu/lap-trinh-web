const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('./emailController');
require('dotenv').config();

// Đăng ký (Legacy - hiện tại dùng OTP flow qua emailController)
exports.register = async (req, res) => {
  return res.status(400).json({ 
    success: false, 
    message: 'Vui lòng sử dụng luồng đăng ký qua mã OTP để bảo mật tài khoản.' 
  });
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? OR phone = ?', [email, email]);
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

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.user.user_id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }

    const salt = await bcrypt.genSalt(10);
    const new_hash = await bcrypt.hash(new_password, salt);
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [new_hash, req.user.user_id]);

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đổi email (gmail)
exports.changeEmail = async (req, res) => {
  try {
    const { new_email, current_password } = req.body;
    if (!new_email || !current_password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(new_email)) {
      return res.status(400).json({ success: false, message: 'Địa chỉ Gmail không hợp lệ.' });
    }

    // Kiểm tra email mới đã tồn tại chưa
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [new_email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Gmail này đã được sử dụng bởi tài khoản khác.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [req.user.user_id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu xác nhận không đúng.' });
    }

    await pool.query('UPDATE users SET email = ? WHERE user_id = ?', [new_email, req.user.user_id]);
    res.json({ success: true, message: 'Đổi Gmail thành công!' });
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

