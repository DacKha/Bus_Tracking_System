const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testNotifications() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ssb_db'
    });

    console.log('Test 1: Kiểm tra bảng notifications tồn tại');
    const [tables] = await connection.query(`SHOW TABLES LIKE 'notifications'`);
    console.log('Bảng notifications:', tables.length > 0 ? 'Tồn tại' : 'Không tồn tại');

    if (tables.length === 0) {
      console.log('Bảng notifications chưa được tạo!');
      return;
    }

    console.log('\nTest 2: Kiểm tra cấu trúc bảng notifications');
    const [columns] = await connection.query('DESCRIBE notifications');
    console.table(columns);

    console.log('\nTest 3: Lấy tất cả user admin');
    const [admins] = await connection.query(`SELECT user_id, email, full_name, user_type FROM users WHERE user_type = 'admin'`);
    console.table(admins);

    if (admins.length === 0) {
      console.log('Không có user admin!');
      return;
    }

    const adminUserId = admins[0].user_id;
    console.log(`\nTest 4: Query notifications cho user_id = ${adminUserId}`);
    
    const testQuery = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`;
    console.log('Query:', testQuery);
    
    const [notifications] = await connection.query(testQuery, [adminUserId]);
    console.log('Số lượng notifications:', notifications.length);
    
    if (notifications.length > 0) {
      console.log('Notifications mẫu:');
      console.table(notifications.slice(0, 3));
    }

    console.log('\nTest 5: Đếm notifications chưa đọc');
    const [unreadResult] = await connection.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
      [adminUserId]
    );
    console.log('Unread count:', unreadResult[0].count);

  } catch (error) {
    console.error('Lỗi:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testNotifications();
