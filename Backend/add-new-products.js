// Script thêm sản phẩm mới vào DB
const pool = require('./src/config/db');
require('dotenv').config();

const newProducts = [
  {
    category_id: 1, brand_id: 2,
    product_name: 'Samsung Galaxy S25 FE',
    price: 12990000, old_price: 14990000,
    thumbnail_url: '/uploads/images/products/Samsung Galaxy S25 FE.jpg',
    description: 'Samsung Galaxy S25 FE - Hiệu năng cao, màn hình Dynamic AMOLED 2X, chip Snapdragon 8 Elite.',
    stock_quantity: 30,
  },
  {
    category_id: 1, brand_id: 2,
    product_name: 'Samsung Galaxy S26 Ultra',
    price: 32990000, old_price: 35990000,
    thumbnail_url: '/uploads/images/products/Samsung Galaxy S26 Ultra.jpg',
    description: 'Samsung Galaxy S26 Ultra - Flagship đỉnh cao, bút S-Pen, camera 200MP, AI Galaxy.',
    stock_quantity: 20,
  },
  {
    category_id: 1, brand_id: 2,
    product_name: 'Samsung Galaxy Z Fold7',
    price: 45990000, old_price: 49990000,
    thumbnail_url: '/uploads/images/products/SamSung Galaxy Z Fold7.jpg',
    description: 'Samsung Galaxy Z Fold7 - Điện thoại gập thế hệ mới, màn hình lớn 7.6 inch.',
    stock_quantity: 15,
  },
  {
    category_id: 1, brand_id: 2,
    product_name: 'Samsung Galaxy Z Flip7',
    price: 22990000, old_price: 25990000,
    thumbnail_url: '/uploads/images/products/Samsung Galaxy Z Flip7 .jpg',
    description: 'Samsung Galaxy Z Flip7 - Thiết kế gập nhỏ gọn, thời trang và hiện đại.',
    stock_quantity: 25,
  },
  {
    category_id: 1, brand_id: 1,
    product_name: 'iPhone 17 Pro Max',
    price: 39990000, old_price: 42990000,
    thumbnail_url: '/uploads/images/products/iPhone 17 Pro Max.jpg',
    description: 'iPhone 17 Pro Max - Chip A19 Pro, hệ thống camera 48MP cải tiến, khung Titanium.',
    stock_quantity: 20,
  },
  {
    category_id: 1, brand_id: 1,
    product_name: 'iPhone Air',
    price: 22990000, old_price: null,
    thumbnail_url: '/uploads/images/products/iPhone Air.jpg',
    description: 'iPhone Air - Mỏng nhất trong lịch sử iPhone, thiết kế siêu nhẹ và sang trọng.',
    stock_quantity: 18,
  },
  {
    category_id: 1, brand_id: 3,
    product_name: 'Xiaomi 15 Ultra 5G',
    price: 24990000, old_price: 27990000,
    thumbnail_url: '/uploads/images/products/Xiaomi 15 Ultra 5G.jpg',
    description: 'Xiaomi 15 Ultra - Camera Leica đỉnh cao, Snapdragon 8 Gen 4, sạc nhanh 90W.',
    stock_quantity: 22,
  },
  {
    category_id: 1, brand_id: 3,
    product_name: 'Xiaomi POCO F8 Pro 5G',
    price: 11990000, old_price: 13990000,
    thumbnail_url: '/uploads/images/products/Xiaomi POCO F8 Pro 5G.jpg',
    description: 'Xiaomi POCO F8 Pro - Hiệu năng gaming, làm mát hiệu quả, pin 5000mAh.',
    stock_quantity: 35,
  },
  {
    category_id: 1, brand_id: 3,
    product_name: 'Xiaomi Redmi Note 15 Pro',
    price: 7990000, old_price: 8990000,
    thumbnail_url: '/uploads/images/products/Xiaomi Redmi Note 15 Pro.jpg',
    description: 'Xiaomi Redmi Note 15 Pro - Tầm trung cao cấp, camera 200MP, pin 5500mAh.',
    stock_quantity: 50,
  },
  {
    category_id: 1, brand_id: 2,
    product_name: 'Samsung Galaxy S22 Ultra',
    price: 15990000, old_price: 29990000,
    thumbnail_url: '/uploads/images/products/Samsung Galaxy S22 Ultra.jpg',
    description: 'Samsung Galaxy S22 Ultra - Bút S-Pen tích hợp, camera 108MP, chip Snapdragon 8 Gen 1.',
    stock_quantity: 10,
  },
];

async function addProducts() {
  let added = 0;
  for (const p of newProducts) {
    try {
      // Kiểm tra đã tồn tại chưa
      const [existing] = await pool.query('SELECT product_id FROM products WHERE product_name = ?', [p.product_name]);
      if (existing.length > 0) {
        console.log(`⚠️  Đã tồn tại: ${p.product_name}`);
        continue;
      }
      const [result] = await pool.query(
        `INSERT INTO products (category_id, brand_id, product_name, price, old_price, thumbnail_url, description, stock_quantity, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [p.category_id, p.brand_id, p.product_name, p.price, p.old_price, p.thumbnail_url, p.description, p.stock_quantity]
      );
      console.log(`✅ Thêm: ${p.product_name} (ID: ${result.insertId})`);
      added++;
    } catch (err) {
      console.error(`❌ Lỗi ${p.product_name}:`, err.message);
    }
  }
  console.log(`\n🎉 Đã thêm ${added}/${newProducts.length} sản phẩm mới!`);
  process.exit(0);
}

addProducts();
