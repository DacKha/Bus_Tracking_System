# Smart School Bus Tracking System - Database Setup Guide

## Tổng Quan

Hệ thống database của SSB sử dụng MySQL với 13 bảng chính. Các tệp SQL được tổ chức như sau:

- **schema.sql** - Định nghĩa cấu trúc cơ sở dữ liệu (bảng, view, stored procedure, index)
- **seed.sql** - Dữ liệu mẫu để kiểm thử (18 users, 5 drivers, 10 parents, 11 students, v.v.)
- **reset.sql** - Script để xóa cơ sở dữ liệu (sử dụng cẩn thận!)

## Vấn Đề Đã Sửa

### 1. **Database Name Changed**
- **Trước:** `ssb_db1` (tên không nhất quán)
- **Sau:** `ssb_db` (tên sạch sẽ, dễ nhớ)

### 2. **Password Hash Synchronization**
Tất cả mật khẩu trong `seed.sql` hiện được mã hóa chính xác bằng bcryptjs:
- **Password:** `Admin@123`
- **Hash:** `$2a$10$o0gRdVVEfC/I8g3SWnB4OeBjSCW4Zl5PSM9LVL3Kcfh0qKHMNBZU.`
- **Salt Rounds:** 10

Khi backend chạy `User.create()`, nó sẽ:
1. Lấy password từ request: `"Admin@123"`
2. Mã hóa bằng bcryptjs: `hash = await bcrypt.hash("Admin@123", salt)`
3. Lưu vào database: `password_hash = "$2a$10$o0gRdVVEfC/I8g3SWnB4OeBjSCW4Zl5PSM9LVL3Kcfh0qKHMNBZU."`

Khi login, authController sẽ:
1. Lấy hash từ database
2. So sánh password: `match = await bcrypt.compare("Admin@123", hash)`
3. Nếu khớp → login thành công ✅

### 3. **Clean SQL Files**
- Loại bỏ tất cả dữ liệu trùng lặp
- Loại bỏ các lệnh trùng lặp (CREATE TABLE, DELETE, v.v.)
- Sắp xếp dữ liệu theo thứ tự logic (Users → Drivers → Parents → Students → v.v.)
- Thêm comments chi tiết

## Cách Setup Database

### Phương Pháp 1: Reset Hoàn Toàn (Đề Xuất)

Để xóa database cũ và tạo mới từ đầu:

```bash
# 1. Reset database
mysql -u root -p < backend/database/reset.sql

# 2. Tạo schema
mysql -u root -p < backend/database/schema.sql

# 3. Insert seed data
mysql -u root -p < backend/database/seed.sql
```

Hoặc một lệnh duy nhất:

```bash
mysql -u root -p < backend/database/reset.sql && \
mysql -u root -p < backend/database/schema.sql && \
mysql -u root -p < backend/database/seed.sql
```

### Phương Pháp 2: Chỉ Insert Dữ Liệu (Nếu Schema Đã Tồn Tại)

```bash
mysql -u root -p ssb_db < backend/database/seed.sql
```

### Phương Pháp 3: Sử Dụng GUI (MySQL Workbench, phpMyAdmin)

1. Mở MySQL Workbench hoặc phpMyAdmin
2. Tạo database mới: `ssb_db`
3. Chạy schema.sql
4. Chạy seed.sql

## Cấu Trúc Database

### 13 Bảng Chính

```
users (18 rows)
├── drivers (5 rows)
├── parents (10 rows)
│   └── students (11 rows)
├── buses (5 rows)
├── routes (5 rows)
│   └── stops (27 rows)
├── schedules (5 rows)
│   └── schedule_students (12 rows)
│       └── tracking
├── notifications
├── messages
└── incidents
```

### Dữ Liệu Mẫu Được Tạo

| Entity | Count | Chi Tiết |
|--------|-------|----------|
| **Users** | 18 | 3 admin, 5 driver, 10 parent |
| **Drivers** | 5 | Liên kết với driver users (IDs 4-8) |
| **Parents** | 10 | Liên kết với parent users (IDs 9-18) |
| **Students** | 11 | Liên kết với parents |
| **Buses** | 5 | 4 active, 1 maintenance |
| **Routes** | 5 | 3 morning, 2 afternoon |
| **Stops** | 27 | 5+5 cho route A, 6+6 cho route B, 4 cho route C |
| **Schedules** | 5 | Today's schedules (3 pickup, 2 dropoff) |
| **Schedule-Students** | 12 | Student assignments to schedules |

## Test Accounts

Tất cả accounts sử dụng password: **Admin@123**

### Admin Account
```
Email:    admin@ssb.com
Password: Admin@123
Hash:     $2a$10$o0gRdVVEfC/I8g3SWnB4OeBjSCW4Zl5PSM9LVL3Kcfh0qKHMNBZU.
```

### Driver Account
```
Email:    driver1@ssb.com
Password: Admin@123
Hash:     $2a$10$o0gRdVVEfC/I8g3SWnB4OeBjSCW4Zl5PSM9LVL3Kcfh0qKHMNBZU.
```

### Parent Account
```
Email:    parent1@ssb.com
Password: Admin@123
Hash:     $2a$10$o0gRdVVEfC/I8g3SWnB4OeBjSCW4Zl5PSM9LVL3Kcfh0qKHMNBZU.
```

## Kiểm Tra Database Sau Khi Setup

```sql
-- Kiểm tra số lượng bản ghi
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'Parents', COUNT(*) FROM parents
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Buses', COUNT(*) FROM buses
UNION ALL
SELECT 'Routes', COUNT(*) FROM routes
UNION ALL
SELECT 'Stops', COUNT(*) FROM stops
UNION ALL
SELECT 'Schedules', COUNT(*) FROM schedules;

-- Kiểm tra admin user
SELECT user_id, email, full_name, user_type FROM users WHERE email = 'admin@ssb.com';

-- Kiểm tra password hash
SELECT user_id, email, password_hash FROM users WHERE email = 'admin@ssb.com';

-- Kiểm tra today's schedules
SELECT s.schedule_id, s.trip_type, s.start_time, r.route_name,
       COUNT(ss.student_id) as student_count
FROM schedules s
JOIN routes r ON s.route_id = r.route_id
LEFT JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
WHERE s.schedule_date = CURDATE()
GROUP BY s.schedule_id;
```

## Kết Nối Từ Node.js Backend

File `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ssb_db
JWT_SECRET=your-jwt-secret
```

File `backend/config/database.js`:
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ssb_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = { pool };
```

## Troubleshooting

### Vấn Đề: "Database 'ssb_db1' doesn't exist"
**Giải pháp:** Database name đã thay đổi từ `ssb_db1` sang `ssb_db`. Chạy lại `schema.sql`.

### Vấn Đề: Foreign Key Constraint Failed
**Giải pháp:** Đảm bảo chạy seed.sql sau schema.sql. Dữ liệu được chèn theo thứ tự đúng.

### Vấn Đề: Login không hoạt động
**Kiểm tra:**
1. Password hash có khớp không: `SELECT password_hash FROM users WHERE email = 'admin@ssb.com'`
2. User có active không: `SELECT is_active FROM users WHERE email = 'admin@ssb.com'`
3. Database user có quyền select không

### Vấn Đề: Trùng lặp email khi insert
**Giải pháp:** Chạy `reset.sql` trước `schema.sql` để xóa dữ liệu cũ.

## Queries Hữu Ích

### Lấy tất cả users với type
```sql
SELECT user_id, email, full_name, user_type, is_active FROM users ORDER BY user_type;
```

### Lấy drivers với thông tin chi tiết
```sql
SELECT d.driver_id, u.full_name, u.email, d.license_number, d.status
FROM drivers d
JOIN users u ON d.user_id = u.user_id;
```

### Lấy students với parent info
```sql
SELECT st.student_id, st.full_name, u.full_name as parent_name, u.email
FROM students st
JOIN parents p ON st.parent_id = p.parent_id
JOIN users u ON p.user_id = u.user_id;
```

### Lấy today's schedules với driver info
```sql
SELECT s.schedule_id, r.route_name, u.full_name as driver_name,
       s.trip_type, s.start_time, s.status,
       COUNT(ss.student_id) as student_count
FROM schedules s
JOIN routes r ON s.route_id = r.route_id
JOIN drivers d ON s.driver_id = d.driver_id
JOIN users u ON d.user_id = u.user_id
LEFT JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
WHERE s.schedule_date = CURDATE()
GROUP BY s.schedule_id
ORDER BY s.start_time;
```

## Notes Quan Trọng

1. **Character Set:** Database sử dụng utf8mb4 để hỗ trợ tiếng Việt
2. **Timestamps:** Tất cả bảng có `created_at` và `updated_at` (tự động quản lý)
3. **Foreign Keys:** Sử dụng ON DELETE CASCADE để bảo đảm tính toàn vẹn dữ liệu
4. **Indexes:** Tối ưu cho các truy vấn phổ biến (schedule_date, user_id, status, v.v.)
5. **Views:** 2 views được tạo để dễ truy vấn dữ liệu phức tạp
6. **Stored Procedure:** 1 procedure để lấy schedules của driver hôm nay

## Liên Hệ & Hỗ Trợ

Nếu gặp vấn đề database, kiểm tra:
- Tệp `.env` có `DB_NAME=ssb_db` không?
- MySQL service có chạy không?
- User root có password không? (Cập nhật `.env`)
- Schema và seed.sql đã chạy chưa?
