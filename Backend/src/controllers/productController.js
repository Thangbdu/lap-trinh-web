const pool = require('../config/db');

// Lấy tất cả sản phẩm (có lọc, phân trang)
exports.getProducts = async (req, res) => {
  try {
    const { category_id, brand_id, search, sort, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.category_name, b.brand_name,
        (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_primary = 1 LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }
    if (brand_id) {
      query += ' AND p.brand_id = ?';
      params.push(brand_id);
    }
    if (search) {
      query += ' AND p.product_name LIKE ?';
      params.push(`%${search}%`);
    }

    // Count total
    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) AS total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Sort
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'newest':
        query += ' ORDER BY p.created_at DESC';
        break;
      default:
        query += ' ORDER BY p.product_id DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [products] = await pool.query(query, params);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `SELECT p.*, c.category_name, b.brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN brands b ON p.brand_id = b.brand_id
       WHERE p.product_id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }

    // Lấy ảnh sản phẩm
    const [images] = await pool.query(
      'SELECT * FROM product_images WHERE product_id = ?',
      [id]
    );

    // Lấy đánh giá
    const [reviews] = await pool.query(
      `SELECT r.*, u.full_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: { ...products[0], images, reviews },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Thêm sản phẩm
exports.createProduct = async (req, res) => {
  try {
    const { category_id, brand_id, product_name, price, old_price, thumbnail_url, description, stock_quantity, specifications } = req.body;

    const [result] = await pool.query(
      `INSERT INTO products (category_id, brand_id, product_name, price, old_price, thumbnail_url, description, stock_quantity, specifications)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, brand_id || null, product_name, price, old_price || null, thumbnail_url || null, description || null, stock_quantity || 0, specifications || null]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm thành công!',
      data: { product_id: result.insertId },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, brand_id, product_name, price, old_price, thumbnail_url, description, stock_quantity, specifications, is_active } = req.body;

    await pool.query(
      `UPDATE products SET category_id=?, brand_id=?, product_name=?, price=?, old_price=?, thumbnail_url=?, description=?, stock_quantity=?, specifications=?, is_active=?
       WHERE product_id=?`,
      [category_id, brand_id, product_name, price, old_price, thumbnail_url, description, stock_quantity, specifications, is_active, id]
    );

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE product_id = ?', [id]);
    res.json({ success: true, message: 'Xóa sản phẩm thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
