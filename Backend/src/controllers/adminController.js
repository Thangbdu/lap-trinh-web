const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// [Admin] Thống kê tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query(
      "SELECT COALESCE(SUM(final_amount), 0) AS totalRevenue FROM orders WHERE status != 'Đã hủy'"
    );
    const [[{ totalOrders }]] = await pool.query(
      "SELECT COUNT(*) AS totalOrders FROM orders"
    );
    const [[{ totalProducts }]] = await pool.query(
      "SELECT COUNT(*) AS totalProducts FROM products WHERE is_active = 1"
    );
    const [[{ totalUsers }]] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'customer'"
    );

    // Đơn hàng theo trạng thái
    const [ordersByStatus] = await pool.query(
      "SELECT status, COUNT(*) AS count FROM orders GROUP BY status"
    );

    // Doanh thu 7 ngày gần nhất
    const [revenueByDay] = await pool.query(`
      SELECT DATE(order_date) AS date, SUM(final_amount) AS revenue
      FROM orders
      WHERE order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status != 'Đã hủy'
      GROUP BY DATE(order_date)
      ORDER BY date ASC
    `);

    // Top 5 sản phẩm bán chạy
    const [topProducts] = await pool.query(`
      SELECT p.product_name, SUM(oi.quantity) AS total_sold, SUM(oi.quantity * oi.price_at_purchase) AS revenue
      FROM orderitems oi
      JOIN products p ON oi.product_id = p.product_id
      GROUP BY oi.product_id, p.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        ordersByStatus,
        revenueByDay,
        topProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Lấy danh sách users
exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT user_id, full_name, email, phone, role, is_active, created_at FROM users';
    const params = [];
    if (search) {
      query += ' WHERE full_name LIKE ? OR email LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    const countQuery = query.replace('SELECT user_id, full_name, email, phone, role, is_active, created_at', 'SELECT COUNT(*) AS total');
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [users] = await pool.query(query, params);
    res.json({ success: true, data: users, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Cập nhật trạng thái user
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    await pool.query('UPDATE users SET is_active = ? WHERE user_id = ?', [is_active, id]);
    res.json({ success: true, message: 'Cập nhật trạng thái người dùng thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Cập nhật role user
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    await pool.query('UPDATE users SET role = ? WHERE user_id = ?', [role, id]);
    res.json({ success: true, message: 'Cập nhật quyền thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Tạo tài khoản người dùng mới
exports.createUser = async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
    }
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng.' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, password_hash, phone || null, role || 'customer']
    );
    await pool.query('INSERT INTO cart (user_id) VALUES (?)', [result.insertId]);
    res.status(201).json({ success: true, message: 'Tạo tài khoản thành công!', data: { user_id: result.insertId, full_name, email, role: role || 'customer' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Reset mật khẩu người dùng
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, id]);
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Xóa tài khoản người dùng
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Không cho xóa chính mình
    if (Number(id) === req.user.user_id) {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính mình.' });
    }
    // Kiểm tra user tồn tại
    const [users] = await pool.query('SELECT user_id, role FROM users WHERE user_id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }
    await pool.query('DELETE FROM users WHERE user_id = ?', [id]);
    res.json({ success: true, message: 'Xóa tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
