const mysql = require('mysql2/promise');
const fs = require('fs');

async function test() {
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            multipleStatements: true
        });
        
        console.log('Reading file...');
        const sql = fs.readFileSync('Backend/du_lieu.sql', 'utf8');
        
        console.log('Executing SQL...');
        await pool.query(sql);
        console.log('✅ SQL executed successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error executing SQL:');
        console.error(err.message);
        process.exit(1);
    }
}
test();
