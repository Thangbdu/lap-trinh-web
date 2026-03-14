const pool = require('../config/db');

// Lấy danh sách địa chỉ của user
exports.getAddresses = async (req, res) => {
  try {
    const [addresses] = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.user_id]
    );
    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm địa chỉ
exports.createAddress = async (req, res) => {
  try {
    const { recipient_name, phone_number, full_address, is_default } = req.body;

    // Nếu set mặc định, bỏ mặc định cũ
    if (is_default) {
      await pool.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.user.user_id]);
    }

    const [result] = await pool.query(
      'INSERT INTO user_addresses (user_id, recipient_name, phone_number, full_address, is_default) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, recipient_name, phone_number, full_address, is_default || false]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm địa chỉ thành công!',
      data: { address_id: result.insertId },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipient_name, phone_number, full_address, is_default } = req.body;

    if (is_default) {
      await pool.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.user.user_id]);
    }

    await pool.query(
      'UPDATE user_addresses SET recipient_name=?, phone_number=?, full_address=?, is_default=? WHERE address_id=? AND user_id=?',
      [recipient_name, phone_number, full_address, is_default || false, id, req.user.user_id]
    );

    res.json({ success: true, message: 'Cập nhật địa chỉ thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM user_addresses WHERE address_id = ? AND user_id = ?', [id, req.user.user_id]);
    res.json({ success: true, message: 'Xóa địa chỉ thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đặt địa chỉ mặc định
exports.setDefault = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.user.user_id]);
    await pool.query('UPDATE user_addresses SET is_default = 1 WHERE address_id = ? AND user_id = ?', [id, req.user.user_id]);
    res.json({ success: true, message: 'Đã đặt làm địa chỉ mặc định!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
