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

  const email = 'staff@mobilestore.com';
  const password = 'Staff@123';
  const full_name = 'Nhân Viên';

  const [existing] = await conn.query('SELECT user_id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    await conn.query('DELETE FROM cart WHERE user_id = ?', [existing[0].user_id]);
    await conn.query('DELETE FROM users WHERE email = ?', [email]);
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const [result] = await conn.query(
    `INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES (?, ?, ?, 'staff', 1)`,
    [full_name, email, password_hash]
  );
  await conn.query('INSERT INTO cart (user_id) VALUES (?)', [result.insertId]);

  console.log('✅ Tài khoản nhân viên:');
  console.log('   Email   :', email);
  console.log('   Password:', password);
  console.log('   Role    : staff');

  await conn.end();
})().catch(e => console.error('❌ Lỗi:', e.message));
