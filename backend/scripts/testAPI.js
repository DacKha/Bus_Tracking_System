const http = require('http');

function request(method, path, token = null, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testAPI() {
  try {
    // 1. Login
    console.log('1. Testing login...');
    const loginRes = await request('POST', '/auth/login', null, {
      email: 'admin@ssb.com',
      password: 'Admin@123'
    });

    if (!loginRes.success) {
      console.error('❌ Login failed:', loginRes.error);
      return;
    }

    console.log('✓ Login successful');
    const token = loginRes.data.token;
    const user = loginRes.data.user;
    console.log(`  User: ${user.full_name} (${user.user_type})`);
    console.log(`  Token: ${token.substring(0, 20)}...`);

    // 2. Test Users API
    console.log('\n2. Testing GET /api/users...');
    const usersRes = await request('GET', '/users', token);
    if (!usersRes.success) {
      console.error('❌ Users API failed:', usersRes.error);
      return;
    }
    console.log(`✓ Users API working - ${usersRes.data.data.length} users found`);

    // 3. Test Buses API
    console.log('\n3. Testing GET /api/buses...');
    const busesRes = await request('GET', '/buses', token);
    if (!busesRes.success) {
      console.error('❌ Buses API failed:', busesRes.error);
      return;
    }
    console.log(`✓ Buses API working - ${busesRes.data.data.length} buses found`);

    // 4. Test Routes API
    console.log('\n4. Testing GET /api/routes...');
    const routesRes = await request('GET', '/routes', token);
    if (!routesRes.success) {
      console.error('❌ Routes API failed:', routesRes.error);
      return;
    }
    console.log(`✓ Routes API working - ${routesRes.data.data.length} routes found`);

    // 5. Test Drivers API
    console.log('\n5. Testing GET /api/drivers...');
    const driversRes = await request('GET', '/drivers', token);
    if (!driversRes.success) {
      console.error('❌ Drivers API failed:', driversRes.error);
      return;
    }
    console.log(`✓ Drivers API working - ${driversRes.data.data.length} drivers found`);

    console.log('\n===========================================');
    console.log('✓ ALL API TESTS PASSED!');
    console.log('===========================================');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
