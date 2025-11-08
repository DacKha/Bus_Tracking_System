const mysql = require('mysql2');
require('dotenv').config();

// Tao connection pool de quan ly ket noi toi database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ssb_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Su dung Promise wrapper de ho tro async/await
const promisePool = pool.promise();

// Ham kiem tra ket noi database
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('Ket noi MySQL Database thanh cong');
    connection.release();
    return true;
  } catch (error) {
    console.error('Loi: Khong the ket noi MySQL Database:', error.message);
    return false;
  }
};

// Dong connection pool khi ung dung tat
process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) {
      console.error('Loi khi dong database pool:', err);
    } else {
      console.log('Database pool da dong');
    }
    process.exit(err ? 1 : 0);
  });
});

module.exports = {
  pool: promisePool,
  testConnection
};
