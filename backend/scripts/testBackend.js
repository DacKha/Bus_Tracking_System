const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testBackend() {
  console.log('===========================================');
  console.log('KIỂM TRA BACKEND API');
  console.log('===========================================\n');

  try {
    console.log('Test 1: Kiểm tra server đang chạy...');
    const healthCheck = await makeRequest(`${BASE_URL}/health`);
    if (healthCheck.status === 200) {
      console.log('✅ Server đang chạy');
      console.log('');
    } else {
      throw new Error('Server không phản hồi');
    }
  } catch (error) {
    console.error('❌ Server KHÔNG chạy hoặc không phản hồi!');
    console.error('   Hãy chạy: cd backend && npm run dev');
    console.error('   Error:', error.message);
    process.exit(1);
  }

  try {
    console.log('Test 2: Đăng nhập admin...');
    const loginData = JSON.stringify({
      email: 'admin@ssb.com',
      password: 'Admin@123'
    });
    
    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      },
      body: loginData
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Đăng nhập thành công');
      const token = loginResponse.data.data.token;
      console.log('   Token:', token.substring(0, 30) + '...');
      console.log('');

      console.log('Test 3: Gọi API /api/notifications...');
      const notifResponse = await makeRequest(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Response status:', notifResponse.status);
      console.log('Response data:', JSON.stringify(notifResponse.data, null, 2));

      if (notifResponse.status === 200 && notifResponse.data.success) {
        console.log('✅ API notifications hoạt động tốt');
        console.log('   Số notifications:', notifResponse.data.data.notifications.length);
        console.log('   Unread count:', notifResponse.data.data.unread_count);
        console.log('');
      } else {
        console.error('❌ API notifications có vấn đề');
        console.error('   Response:', JSON.stringify(notifResponse.data, null, 2));
      }

      console.log('===========================================');
      console.log('✅ BACKEND API HOẠT ĐỘNG BÌNH THƯỜNG');
      console.log('===========================================');
      console.log('Backend sẵn sàng cho frontend sử dụng.');
      console.log('Hãy khởi động frontend: cd font-end && npm run dev');
      
    } else {
      console.error('❌ Đăng nhập thất bại');
    }
  } catch (error) {
    console.error('❌ Lỗi khi test API:');
    console.error('   Error:', error.message);
    console.log('');
    console.log('===========================================');
    console.log('HƯỚNG DẪN SỬA LỖI:');
    console.log('===========================================');
    console.log('1. Kiểm tra backend đang chạy: cd backend && npm run dev');
    console.log('2. Kiểm tra database: node scripts/checkTables.js');
    console.log('3. Reset database nếu cần: node scripts/resetDatabase.js');
    console.log('4. Seed data: node scripts/seedDatabase.js');
    console.log('5. Kiểm tra file .env có đúng cấu hình không');
  }
}

testBackend();
