const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function resetDatabase() {
  let connection;

  try {
    console.log('Đang kết nối tới MySQL...');

    // Kết nối không chọn database cụ thể
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('Đã kết nối MySQL thành công!');

    // Đọc file reset.sql
    const resetSqlPath = path.join(__dirname, '..', 'database', 'reset.sql');
    const resetSql = fs.readFileSync(resetSqlPath, 'utf8');

    console.log('Đang tạo lại database...');

    // Thực thi reset.sql
    await connection.query(resetSql);

    console.log('✓ Database đã được tạo lại thành công!');
    console.log('✓ Tất cả tables, views, stored procedures đã được tạo');

  } catch (error) {
    console.error('Lỗi khi reset database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase();
