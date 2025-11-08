const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function seedDatabase() {
  let connection;

  try {
    console.log('Đang kết nối tới database...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ssb_db',
      multipleStatements: true
    });

    console.log('Đã kết nối database thành công!');

    // Đọc file seed.sql
    const seedSqlPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

    console.log('Đang thêm dữ liệu mẫu...');

    // Thực thi seed.sql
    await connection.query(seedSql);

    console.log('✓ Dữ liệu mẫu đã được thêm thành công!');
    console.log('✓ Bạn có thể đăng nhập với:');
    console.log('  - Admin: admin@ssb.com / Admin@123');
    console.log('  - Driver: driver1@ssb.com / Driver@123');
    console.log('  - Parent: parent1@ssb.com / Parent@123');

  } catch (error) {
    console.error('Lỗi khi seed database:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
