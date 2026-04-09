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
    // Đếm tất cả user không phải admin (kể cả staff, customer...)
    const [[{ totalUsers }]] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users WHERE role != 'admin'"
    );

    // Đơn hàng theo trạng thái
    const [ordersByStatus] = await pool.query(
      "SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC"
    );

    // Doanh thu 7 ngày gần nhất - luôn trả đủ 7 ngày kể cả ngày 0đ
    const [revenueByDay] = await pool.query(`
      SELECT
        dates.date,
        COALESCE(SUM(o.final_amount), 0) AS revenue
      FROM (
        SELECT DATE(DATE_SUB(CURDATE(), INTERVAL n DAY)) AS date
        FROM (
          SELECT 6 AS n UNION SELECT 5 UNION SELECT 4
          UNION SELECT 3 UNION SELECT 2 UNION SELECT 1 UNION SELECT 0
        ) nums
      ) dates
      LEFT JOIN orders o
        ON DATE(o.order_date) = dates.date
        AND o.status != 'Đã hủy'
      GROUP BY dates.date
      ORDER BY dates.date ASC
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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    // 1. Không cho xóa chính mình
    if (Number(id) === req.user.user_id) {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính mình.' });
    }

    // 2. Kiểm tra user tồn tại
    const [users] = await pool.query('SELECT user_id, role FROM users WHERE user_id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    // 3. Dọn dẹp dữ liệu liên quan để tránh lỗi khóa ngoại
    // Xóa giỏ hàng
    await connection.query('DELETE FROM cartitems WHERE cart_id IN (SELECT cart_id FROM cart WHERE user_id = ?)', [id]);
    await connection.query('DELETE FROM cart WHERE user_id = ?', [id]);
    
    // Xóa địa chỉ, yêu thích, thông báo (nếu có)
    await connection.query('DELETE FROM user_addresses WHERE user_id = ?', [id]);
    await connection.query('DELETE FROM wishlist WHERE user_id = ?', [id]);
    // Nếu có đơn hàng, gán user_id = NULL để giữ lại lịch sử đơn hàng cho thống kê doanh thu
    await connection.query('UPDATE orders SET user_id = NULL WHERE user_id = ?', [id]);

    // 4. Xóa user
    await connection.query('DELETE FROM users WHERE user_id = ?', [id]);

    await connection.commit();
    res.json({ success: true, message: 'Xóa tài khoản và dữ liệu liên quan thành công!' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Lỗi khi xóa: ' + error.message });
  } finally {
    connection.release();
  }
};
