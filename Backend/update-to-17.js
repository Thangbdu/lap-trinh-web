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

  const newName = 'iPhone 17 Pro Max';
  const newThumb = '/uploads/images/products/iPhone 17 Pro Max.jpg';
  const productId = 1; // iPhone 15 currently

  await conn.query('UPDATE products SET product_name = ?, thumbnail_url = ? WHERE product_id = ?', [newName, newThumb, productId]);
  await conn.query('UPDATE product_images SET image_url = ? WHERE product_id = ? AND is_primary = TRUE', [newThumb, productId]);

  const [rows] = await conn.query('SELECT product_id, product_name, thumbnail_url FROM products WHERE product_id = ?', [productId]);
  console.log('✅ Updated:', rows[0]);

  await conn.end();
})();
