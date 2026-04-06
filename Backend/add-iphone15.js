const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'mobilestore_db',
  });

  const name = 'iPhone 15 Pro Max';
  const thumb = '/uploads/images/products/iPhone 15 Pro Max.jpg';

  // Kiểm tra đã tồn tại chưa
  const [exist] = await conn.query('SELECT product_id FROM products WHERE product_name = ?', [name]);
  if (exist.length > 0) {
    console.log('⚠️  iPhone 15 đã tồn tại trong DB, không cần thêm.');
    await conn.end();
    return;
  }

  // Thêm sản phẩm mới (category_id=1, brand_id=1)
  const [result] = await conn.query(
    `INSERT INTO products (category_id, brand_id, product_name, price, old_price, thumbnail_url, description, stock_quantity, is_active)
     VALUES (1, 1, ?, 32990000, 34990000, ?, 'iPhone 15 Pro Max - flagship 2025, camera 48MP, titanium frame.', 50, 1)`,
    [name, thumb]
  );

  console.log(`✅ Thêm iPhone 15 Pro Max, ID: ${result.insertId}`);

  // Thêm hình ảnh primary vào bảng product_images
  await conn.query(
    `INSERT INTO product_images (product_id, image_url, is_primary, created_at) VALUES (?, ?, TRUE, NOW())`,
    [result.insertId, thumb]
  );

  await conn.end();
})();
