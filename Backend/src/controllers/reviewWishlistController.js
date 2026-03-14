const pool = require('../config/db');

// Thêm đánh giá
exports.createReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const [result] = await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [product_id, req.user.user_id, rating, comment || null]
    );
    res.status(201).json({ success: true, data: { review_id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy đánh giá theo sản phẩm
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const [reviews] = await pool.query(
      `SELECT r.*, u.full_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [product_id]
    );

    // Tính trung bình sao
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({ success: true, data: { reviews, avgRating: Math.round(avgRating * 10) / 10, totalReviews: reviews.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy wishlist
exports.getWishlist = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT w.id, w.created_at, p.*
       FROM wishlist w
       JOIN products p ON w.product_id = p.product_id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm vào wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    await pool.query(
      'INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [req.user.user_id, product_id]
    );
    res.json({ success: true, message: 'Đã thêm vào yêu thích!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa khỏi wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { product_id } = req.params;
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.user_id, product_id]
    );
    res.json({ success: true, message: 'Đã xóa khỏi yêu thích!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
