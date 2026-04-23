const pool = require('../config/db');

// [User] Kiểm tra mã giảm giá
exports.checkVoucher = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá.' });
    }

    const [promotions] = await pool.query(
      'SELECT * FROM promotions WHERE promo_code = ? AND is_active = 1',
      [code]
    );

    if (promotions.length === 0) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' });
    }

    const promo = promotions[0];
    const now = new Date();

    if (now < new Date(promo.start_date)) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá chưa đến thời gian sử dụng.' });
    }

    if (now > new Date(promo.end_date)) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn.' });
    }

    if (totalAmount < promo.min_order_value) {
      return res.status(400).json({ 
        success: false, 
        message: `Đơn hàng tối thiểu ${Number(promo.min_order_value).toLocaleString('vi-VN')}đ để sử dụng mã này.` 
      });
    }

    // Tính toán số tiền giảm
    let discountAmount = (totalAmount * promo.discount_percent) / 100;
    if (promo.max_discount_amount && discountAmount > promo.max_discount_amount) {
      discountAmount = promo.max_discount_amount;
    }

    res.json({
      success: true,
      data: {
        promo_id: promo.promo_id,
        promo_code: promo.promo_code,
        discount_percent: promo.discount_percent,
        discount_amount: discountAmount,
        final_amount: totalAmount - discountAmount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Lấy danh sách mã giảm giá
exports.getAllPromotions = async (req, res) => {
  try {
    const [promotions] = await pool.query('SELECT * FROM promotions ORDER BY created_at DESC');
    res.json({ success: true, data: promotions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Tạo mã giảm giá mới
exports.createPromotion = async (req, res) => {
  try {
    const { 
      promo_code, 
      discount_percent, 
      max_discount_amount, 
      min_order_value, 
      start_date, 
      end_date, 
      is_active 
    } = req.body;

    if (!promo_code || !discount_percent || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    const [existing] = await pool.query('SELECT promo_id FROM promotions WHERE promo_code = ?', [promo_code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã tồn tại.' });
    }

    const [result] = await pool.query(
      `INSERT INTO promotions 
      (promo_code, discount_percent, max_discount_amount, min_order_value, start_date, end_date, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [promo_code, discount_percent, max_discount_amount || null, min_order_value || 0, start_date, end_date, is_active ?? 1]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Tạo mã giảm giá thành công!', 
      data: { promo_id: result.insertId, ...req.body } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Cập nhật mã giảm giá
exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      promo_code, 
      discount_percent, 
      max_discount_amount, 
      min_order_value, 
      start_date, 
      end_date, 
      is_active 
    } = req.body;

    await pool.query(
      `UPDATE promotions SET 
        promo_code = ?, 
        discount_percent = ?, 
        max_discount_amount = ?, 
        min_order_value = ?, 
        start_date = ?, 
        end_date = ?, 
        is_active = ? 
      WHERE promo_id = ?`,
      [promo_code, discount_percent, max_discount_amount || null, min_order_value || 0, start_date, end_date, is_active, id]
    );

    res.json({ success: true, message: 'Cập nhật mã giảm giá thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Xóa mã giảm giá
exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM promotions WHERE promo_id = ?', [id]);
    res.json({ success: true, message: 'Xóa mã giảm giá thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
