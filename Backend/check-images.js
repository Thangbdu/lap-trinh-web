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

  const [rows] = await conn.query('SELECT product_id, product_name, thumbnail_url FROM products ORDER BY product_id');
  console.log('📊 Tất cả sản phẩm:');
  rows.forEach(r => {
    const icon = r.thumbnail_url ? '🟢' : '🔴 THIẾU ẢNH';
    console.log(`  ${icon} [${r.product_id}] ${r.product_name} → ${r.thumbnail_url || 'NULL'}`);
  });

  await conn.end();
})();
