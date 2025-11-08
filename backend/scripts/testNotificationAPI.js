const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const payload = {
  userId: 1,
  userType: 'admin',
  email: 'admin@ssb.com'
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

console.log('Test token cho admin:');
console.log(token);
console.log('\nTest API với curl:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/notifications`);
