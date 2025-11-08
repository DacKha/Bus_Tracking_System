const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkTables() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ssb_db'
    });

    console.log('Kiểm tra cấu trúc bảng users:');
    const [columns] = await connection.query('DESCRIBE users');
    console.table(columns);

  } catch (error) {
    console.error('Lỗi:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTables();
