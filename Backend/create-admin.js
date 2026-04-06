const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'mobilestore_db',
  });

  const email = 'admin@mobilestore.com';
  const password = 'Admin@123';
  const full_name = 'Administrator';

  // Xóa tài khoản cũ nếu có
  const [existing] = await conn.query('SELECT user_id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    await conn.query('DELETE FROM cart WHERE user_id = ?', [existing[0].user_id]);
    await conn.query('DELETE FROM users WHERE email = ?', [email]);
    console.log('🗑️  Đã xóa tài khoản cũ:', email);
  }

  // Hash mật khẩu
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Tạo tài khoản admin mới
  const [result] = await conn.query(
    `INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES (?, ?, ?, 'admin', 1)`,
    [full_name, email, password_hash]
  );
  const userId = result.insertId;

  // Tạo cart cho tài khoản
  await conn.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);

  console.log('✅ Đã tạo tài khoản admin:');
  console.log('   Email   :', email);
  console.log('   Password:', password);
  console.log('   Role    : admin');
  console.log('   ID      :', userId);

  await conn.end();
})().catch(e => console.error('❌ Lỗi:', e.message));
