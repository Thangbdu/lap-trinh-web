/**
 * Cập nhật đường dẫn ảnh cho TẤT CẢ sản phẩm còn thiếu
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateAllImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mobilestore_db',
    charset: 'utf8mb4',
  });

  console.log('✅ Kết nối MySQL thành công!');

  // Map: product_id -> đường dẫn ảnh thực tế
  const updates = [
    { product_id: 1,  image_id: 1,  url: '/uploads/images/products/iphone15_pro_max.png' },   // iPhone 15 Pro Max
    { product_id: 2,  image_id: 2,  url: '/uploads/images/products/s24utral.webp' },             // Samsung S24 Ultra
    { product_id: 3,  image_id: 3,  url: '/uploads/images/products/Xiaomi_14_Pro_Green.png' },  // Xiaomi 14 Pro
    { product_id: 4,  image_id: 4,  url: '/uploads/images/products/ipad_pro_m2.png' },           // iPad Pro M2
    { product_id: 5,  image_id: 5,  url: '/uploads/images/products/macbook airm 3 2024.jpg' },  // MacBook Air M3
    { product_id: 6,  image_id: 6,  url: '/uploads/images/products/airpods-pro2.png' },          // AirPods Pro 2
    { product_id: 7,  image_id: 7,  url: '/uploads/images/products/apple-watch-s9.png' },        // Apple Watch S9
    { product_id: 8,  image_id: 8,  url: '/uploads/images/products/anker-powerbank.png' },       // Anker 10000mAh
    { product_id: 9,  image_id: 9,  url: '/uploads/images/products/jbl-flip6.png' },             // JBL Flip 6
    { product_id: 10, image_id: 10, url: '/uploads/images/products/keyboard-logitech.png' },    // Logitech MX
  ];

  try {
    for (const item of updates) {
      // Cập nhật thumbnail_url trong bảng products
      await connection.query(
        'UPDATE `products` SET `thumbnail_url` = ? WHERE `product_id` = ?',
        [item.url, item.product_id]
      );
      // Cập nhật image_url trong bảng product_images
      await connection.query(
        'UPDATE `product_images` SET `image_url` = ? WHERE `image_id` = ?',
        [item.url, item.image_id]
      );
      console.log(`✅ [${item.product_id}] Cập nhật thành công: ${item.url}`);
    }

    // Kiểm tra kết quả
    console.log('\n📷 Kết quả cuối cùng:');
    const [rows] = await connection.query(
      'SELECT p.product_id, p.product_name, p.thumbnail_url FROM products ORDER BY product_id'
    );
    rows.forEach(r => {
      const ok = r.thumbnail_url ? '✅' : '❌';
      console.log(`  ${ok} [${r.product_id}] ${r.product_name}`);
    });

    console.log('\n🎉 Hoàn tất! Tất cả sản phẩm đã có ảnh.');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await connection.end();
  }
}

updateAllImages();
