const mysql = require('mysql2/promise');
require('dotenv').config();

async function f() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: 'mobilestore_db'
  });

  // Thêm cột is_featured
  try {
    await c.query('ALTER TABLE products ADD COLUMN is_featured tinyint(1) DEFAULT 0');
    console.log('Added is_featured column');
  } catch (e) {
    console.log('Column already exists, continuing...');
  }

  // Reset tất cả về 0
  await c.query('UPDATE products SET is_featured = 0');

  // Đánh dấu 5 SP nổi bật
  const patterns = ['%iPhone 17%', '%S26 Ultra%', '%Xiaomi 14%', '%Z Fold7%', '%MacBook%'];
  for (const p of patterns) {
    const [r] = await c.query('UPDATE products SET is_featured = 1 WHERE product_name LIKE ?', [p]);
    console.log(`Pattern ${p}: ${r.affectedRows} updated`);
  }

  const [rows] = await c.query('SELECT product_id, product_name, is_featured FROM products ORDER BY is_featured DESC, product_id');
  console.log('\nAll products:');
  rows.forEach(r => console.log(`  [${r.is_featured ? '★ FEATURED' : '  normal  '}] ${r.product_id} - ${r.product_name}`));
  
  c.destroy();
}
f();
