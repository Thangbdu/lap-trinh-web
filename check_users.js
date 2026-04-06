const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({host:'localhost',user:'root',password:'',database:'mobilestore_db'});
  const [rows] = await c.query('SELECT user_id, email, role, is_active FROM users');
  rows.forEach(r => console.log(`ID:${r.user_id} | ${r.email} | role:${r.role} | active:${r.is_active}`));
  await c.end();
})();
