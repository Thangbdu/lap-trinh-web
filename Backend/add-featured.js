const mysql = require('mysql2/promise');
require('dotenv').config();

async function addFeatured() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'mobilestore_db',
  });

  try {
    // 1. Thêm cột is_featured nếu chưa có
    const [cols] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'mobilestore_db' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_featured'
    `);

    if (cols.length === 0) {
      await connection.query(`ALTER TABLE products ADD COLUMN is_featured TINYINT(1) DEFAULT 0 AFTER is_active`);
      console.log('✅ Đã thêm cột is_featured vào bảng products');
    } else {
      console.log('ℹ️  Cột is_featured đã tồn tại');
    }

    // 2. Đặt 5 sản phẩm nổi bật (product_id 1,2,3,4,5)
    await connection.query(`UPDATE products SET is_featured = 0`);
    await connection.query(`UPDATE products SET is_featured = 1 WHERE product_id IN (1, 2, 3, 4, 5)`);
    console.log('✅ Đã đặt 5 sản phẩm nổi bật (iPhone 15, Samsung S24, Xiaomi 14, iPad Pro, MacBook Air)');

    // 3. Xem kết quả
    const [rows] = await connection.query('SELECT product_id, product_name, is_featured FROM products ORDER BY product_id');
    console.log('\n📊 Kết quả:');
    rows.forEach(r => {
      const icon = r.is_featured ? '⭐' : '  ';
      console.log(`  ${icon} [${r.product_id}] ${r.product_name}`);
    });

  } finally {
    await connection.end();
  }
  console.log('\n✅ Hoàn tất!');
}

addFeatured().catch(e => console.error('❌ Lỗi:', e.message));
