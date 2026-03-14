/**
 * Script import dữ liệu MySQL từ du_lieu.sql
 * Chạy: node import-db.js
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importDatabase() {
  // Kết nối KHÔNG chỉ định database (để tạo DB trước)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true, // Cho phép chạy nhiều câu SQL cùng lúc
    charset: 'utf8mb4',
  });

  console.log('✅ Kết nối MySQL thành công!');

  try {
    // Đọc file SQL
    const sqlFile = path.join(__dirname, 'du_lieu.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 Đang đọc file du_lieu.sql...');
    console.log('⏳ Đang import dữ liệu... (có thể mất vài giây)');

    // Chạy toàn bộ SQL
    await connection.query(sql);

    console.log('✅ Import dữ liệu thành công!');

    // Kiểm tra kết quả
    await connection.query('USE mobilestore_db');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📊 Đã tạo ${tables.length} bảng:`);
    tables.forEach((t) => {
      const tableName = Object.values(t)[0];
      console.log(`   - ${tableName}`);
    });

    // Đếm records mỗi bảng
    console.log('\n📈 Số lượng dữ liệu mẫu:');
    for (const t of tables) {
      const tableName = Object.values(t)[0];
      const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${tableName}\``);
      console.log(`   - ${tableName}: ${rows[0].count} records`);
    }

    console.log('\n🎉 Hoàn tất! Database mobilestore_db đã sẵn sàng.');
  } catch (error) {
    console.error('❌ Lỗi import:', error.message);
    if (error.message.includes('Access denied')) {
      console.log('\n💡 Gợi ý: Kiểm tra DB_USER và DB_PASSWORD trong file .env');
    }
  } finally {
    await connection.end();
  }
}

importDatabase();
