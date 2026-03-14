const pool = require('../config/db');

// Lấy tất cả danh mục
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY category_name'
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy tất cả thương hiệu
exports.getBrands = async (req, res) => {
  try {
    const [brands] = await pool.query(
      'SELECT * FROM brands WHERE is_active = 1 ORDER BY brand_name'
    );
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] CRUD danh mục
exports.createCategory = async (req, res) => {
  try {
    const { category_name, category_image, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO categories (category_name, category_image, description) VALUES (?, ?, ?)',
      [category_name, category_image || null, description || null]
    );
    res.status(201).json({ success: true, data: { category_id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, category_image, description, is_active } = req.body;
    await pool.query(
      'UPDATE categories SET category_name=?, category_image=?, description=?, is_active=? WHERE category_id=?',
      [category_name, category_image, description, is_active, id]
    );
    res.json({ success: true, message: 'Cập nhật danh mục thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE category_id = ?', [id]);
    res.json({ success: true, message: 'Xóa danh mục thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] CRUD thương hiệu
exports.createBrand = async (req, res) => {
  try {
    const { brand_name, logo_url } = req.body;
    const [result] = await pool.query(
      'INSERT INTO brands (brand_name, logo_url) VALUES (?, ?)',
      [brand_name, logo_url || null]
    );
    res.status(201).json({ success: true, data: { brand_id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_name, logo_url, is_active } = req.body;
    await pool.query(
      'UPDATE brands SET brand_name=?, logo_url=?, is_active=? WHERE brand_id=?',
      [brand_name, logo_url, is_active, id]
    );
    res.json({ success: true, message: 'Cập nhật thương hiệu thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM brands WHERE brand_id = ?', [id]);
    res.json({ success: true, message: 'Xóa thương hiệu thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
