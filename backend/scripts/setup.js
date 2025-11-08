const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function testConnection(password) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: password || process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    await connection.ping();
    return { success: true, connection };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function setup() {
  console.log('===========================================');
  console.log('  BUS TRACKING SYSTEM - DATABASE SETUP');
  console.log('===========================================\n');

  let password = process.env.DB_PASSWORD || '';
  let connection;

  // Test kết nối với password từ .env
  console.log('Đang kiểm tra kết nối MySQL...');
  let result = await testConnection(password);

  // Nếu không kết nối được, yêu cầu nhập password
  if (!result.success) {
    console.log(`\nKhông thể kết nối: ${result.error}`);
    password = await question('\nNhập MySQL password (để trống nếu không có): ');
    result = await testConnection(password);

    if (!result.success) {
      console.error('\n❌ Không thể kết nối MySQL. Vui lòng kiểm tra lại thông tin đăng nhập.');
      rl.close();
      process.exit(1);
    }
  }

  connection = result.connection;
  console.log('✓ Kết nối MySQL thành công!\n');

  try {
    // 1. Reset Database
    console.log('1. Đang tạo lại database...');
    const resetSqlPath = path.join(__dirname, '..', 'database', 'reset.sql');
    let resetSql = fs.readFileSync(resetSqlPath, 'utf8');

    // Tách stored procedures và views ra (do DELIMITER không hoạt động với mysql2)
    const delimiterIndex = resetSql.indexOf('DELIMITER //');
    let mainSql = resetSql;
    let proceduresSql = '';

    if (delimiterIndex !== -1) {
      mainSql = resetSql.substring(0, delimiterIndex);
      proceduresSql = resetSql.substring(delimiterIndex);
    }

    // Chạy phần chính (tables)
    await connection.query(mainSql);
    console.log('   ✓ Tables đã được tạo thành công!');

    // Chạy stored procedures nếu có (bỏ qua lỗi nếu có)
    if (proceduresSql) {
      try {
        // Loại bỏ DELIMITER và chạy từng procedure
        const procedures = proceduresSql
          .replace(/DELIMITER \/\//g, '')
          .replace(/DELIMITER ;/g, '')
          .split('//');

        for (const proc of procedures) {
          const trimmed = proc.trim();
          if (trimmed && trimmed.startsWith('CREATE')) {
            await connection.query(trimmed);
          }
        }
        console.log('   ✓ Stored procedures đã được tạo!');
      } catch (err) {
        console.log('   ⚠ Bỏ qua stored procedures (không bắt buộc)');
      }
    }

    // 2. Seed Data
    console.log('\n2. Đang thêm dữ liệu mẫu...');

    // Đóng connection cũ và tạo connection mới với database đã chọn
    await connection.end();
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: password,
      database: process.env.DB_NAME || 'ssb_db',
      multipleStatements: true
    });

    const seedSqlPath = path.join(__dirname, '..', 'database', 'seed.sql');
    let seedSql = fs.readFileSync(seedSqlPath, 'utf8');

    // Bỏ dòng USE ssb_db vì connection đã chọn database rồi
    seedSql = seedSql.replace(/USE\s+ssb_db\s*;/gi, '');

    await connection.query(seedSql);
    console.log('   ✓ Dữ liệu mẫu đã được thêm thành công!');

    // 3. Thông tin đăng nhập
    console.log('\n===========================================');
    console.log('  HOÀN TẤT SETUP DATABASE!');
    console.log('===========================================');
    console.log('\nThông tin đăng nhập:');
    console.log('  Admin:  admin@ssb.com / Admin@123');
    console.log('  Driver: driver1@ssb.com / Driver@123');
    console.log('  Parent: parent1@ssb.com / Parent@123');
    console.log('\nBạn có thể khởi động server bằng: npm run dev');
    console.log('===========================================\n');

  } catch (error) {
    console.error('\n❌ Lỗi khi setup:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    rl.close();
  }
}

setup();
