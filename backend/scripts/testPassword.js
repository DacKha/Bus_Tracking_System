const bcrypt = require('bcryptjs');

// Hash từ database
const hash = '$2a$10$o0gRdVVEfC/I8g3SWnB4OeBjSCW4Zl5PSM9LVL3Kcfh0qKHMNBZU.';

// Các mật khẩu có thể
const passwords = [
  'Admin@123',
  'admin@123',
  'Driver@123',
  'driver@123',
  'Parent@123',
  'parent@123',
  'Password@123',
  'password@123',
  '123456',
  'admin123'
];

console.log('Đang test các mật khẩu...\n');

passwords.forEach(async (password) => {
  const match = await bcrypt.compare(password, hash);
  if (match) {
    console.log(`✓ MATCH FOUND: "${password}"`);
  } else {
    console.log(`✗ "${password}" - không khớp`);
  }
});

// Tạo hash mới cho các password phổ biến
setTimeout(async () => {
  console.log('\n===========================================');
  console.log('Tạo hash mới cho các mật khẩu chuẩn:');
  console.log('===========================================\n');

  const standardPasswords = {
    'Admin@123': await bcrypt.hash('Admin@123', 10),
    'Driver@123': await bcrypt.hash('Driver@123', 10),
    'Parent@123': await bcrypt.hash('Parent@123', 10)
  };

  for (const [pwd, hash] of Object.entries(standardPasswords)) {
    console.log(`${pwd}:`);
    console.log(`  ${hash}\n`);
  }
}, 2000);
