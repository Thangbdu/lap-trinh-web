const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'mobilestore_db',
  });

  const updates = [
    [1, '/uploads/images/products/iPhone 15 Pro Max.jpg'],   // iPhone 15 Pro Max
    [4, '/uploads/images/products/ipad_pro_m2.png'],         // iPad Pro
    [6, '/uploads/images/products/airpods-pro2.png'],        // AirPods Pro 2
    [7, '/uploads/images/products/apple-watch-s9.png'],      // Apple Watch S9
    [8, '/uploads/images/products/anker-powerbank.png'],     // Anker
    [9, '/uploads/images/products/jbl-flip6.png'],           // JBL Flip 6
    [10, '/uploads/images/products/keyboard-logitech.png'],  // Logitech
  ];

  for (const [id, url] of updates) {
    await connection.query('UPDATE products SET thumbnail_url = ? WHERE product_id = ?', [url, id]);
    console.log(`✅ Cập nhật product_id ${id}: ${url}`);
  }

  // Cũng update product_images cho đồng bộ
  const imageUpdates = [
    [1, '/uploads/images/products/iPhone 15 Pro Max.jpg'],
    [4, '/uploads/images/products/ipad_pro_m2.png'],
    [6, '/uploads/images/products/airpods-pro2.png'],
    [7, '/uploads/images/products/apple-watch-s9.png'],
    [8, '/uploads/images/products/anker-powerbank.png'],
    [9, '/uploads/images/products/jbl-flip6.png'],
    [10, '/uploads/images/products/keyboard-logitech.png'],
  ];

  for (const [productId, url] of imageUpdates) {
    await connection.query(
      'UPDATE product_images SET image_url = ? WHERE product_id = ? AND is_primary = TRUE',
      [url, productId]
    );
  }

  // Xem kết quả
  const [rows] = await connection.query('SELECT product_id, product_name, thumbnail_url FROM products ORDER BY product_id');
  console.log('\n📊 Kết quả:');
  rows.forEach(r => {
    const status = r.thumbnail_url ? '🟢' : '🔴';
    console.log(`  ${status} [${r.product_id}] ${r.product_name} → ${r.thumbnail_url || 'NULL'}`);
  });

  await connection.end();
  console.log('\n✅ Hoàn tất!');
}

fixImages().catch(e => console.error('❌ Lỗi:', e.message));
