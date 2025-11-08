# Database Setup Guide - SSB 1.0

## Tổng quan Database

Database gồm **13 bảng chính**:

### 1. **Core Tables (Bảng cốt lõi)**
- `users` - Người dùng (admin/driver/parent)
- `drivers` - Thông tin tài xế
- `parents` - Thông tin phụ huynh
- `students` - Học sinh

### 2. **Bus Management Tables**
- `buses` - Xe buýt
- `routes` - Tuyến đường
- `stops` - Điểm dừng

### 3. **Schedule & Tracking Tables**
- `schedules` - Lịch trình đưa đón
- `schedule_students` - Học sinh trong lịch trình
- `tracking` - Theo dõi GPS realtime

### 4. **Communication Tables**
- `notifications` - Thông báo
- `messages` - Tin nhắn
- `incidents` - Sự cố

---

## Bước 1: Cài đặt MySQL

### Windows:
```bash
# Download MySQL Community Server từ:
https://dev.mysql.com/downloads/mysql/

# Hoặc dùng XAMPP/WAMP
```

### Mac:
```bash
brew install mysql
brew services start mysql
```

### Linux:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

---

## Bước 2: Tạo Database

### Cách 1: Dùng MySQL CLI
```bash
# Đăng nhập MySQL
mysql -u root -p

# Chạy file schema.sql
mysql> source /path/to/backend/database/schema.sql;

# Kiểm tra
mysql> USE ssb_db;
mysql> SHOW TABLES;
```

### Cách 2: Dùng MySQL Workbench
1. Mở MySQL Workbench
2. Connect đến server
3. File → Open SQL Script → chọn `schema.sql`
4. Execute (⚡)

### Cách 3: Dùng phpMyAdmin
1. Truy cập phpMyAdmin (http://localhost/phpmyadmin)
2. Tạo database `ssb_db`
3. Import → chọn file `schema.sql`

---

## Bước 3: Kiểm tra Database

```sql
-- Kiểm tra số bảng
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'ssb_db';
-- Kết quả: 13 tables

-- Kiểm tra dữ liệu mẫu
SELECT * FROM users;
-- Kết quả: 3 users (admin, driver, parent)

SELECT * FROM buses;
-- Kết quả: 2 buses

SELECT * FROM routes;
-- Kết quả: 1 route với 3 stops
```

---

## Bước 4: Cấu hình .env

Tạo file `.env` trong folder `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ssb_db

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=24h

# Frontend URL (cho CORS)
FRONTEND_URL=http://localhost:3000
```

---

## Accounts mẫu để test

| Email | Password | Role | Mô tả |
|-------|----------|------|-------|
| admin@ssb.com | Admin@123 | admin | Quản trị viên |
| driver1@ssb.com | Admin@123 | driver | Tài xế Nguyễn Văn Tài |
| parent1@ssb.com | Admin@123 | parent | Phụ huynh Trần Thị Hoa |

---

## ERD Diagram (Mối quan hệ)

```
users (1) -----> (1) drivers
users (1) -----> (1) parents
parents (1) ----> (N) students

buses (1) -----> (N) schedules
drivers (1) ----> (N) schedules
routes (1) -----> (N) schedules
routes (1) -----> (N) stops

schedules (1) --> (N) schedule_students
schedules (1) --> (N) tracking
schedules (1) --> (N) incidents

students (1) ---> (N) schedule_students
stops (1) ------> (N) schedule_students

users (1) ------> (N) notifications
users (1) ------> (N) messages (sender/receiver)
```

---

## Stored Procedures

### GetDriverTodaySchedule
Lấy lịch trình hôm nay của tài xế:

```sql
CALL GetDriverTodaySchedule(1);
```

---

## Views hữu ích

### v_schedule_overview
Xem tổng quan lịch trình:
```sql
SELECT * FROM v_schedule_overview
WHERE schedule_date = CURDATE();
```

### v_students_full
Xem thông tin học sinh đầy đủ:
```sql
SELECT * FROM v_students_full
WHERE is_active = TRUE;
```

---

## Maintenance Tips

### 1. Backup Database
```bash
# Backup toàn bộ
mysqldump -u root -p ssb_db > backup_$(date +%Y%m%d).sql

# Backup chỉ cấu trúc
mysqldump -u root -p --no-data ssb_db > structure.sql

# Backup chỉ dữ liệu
mysqldump -u root -p --no-create-info ssb_db > data.sql
```

### 2. Restore Database
```bash
mysql -u root -p ssb_db < backup_20250113.sql
```

### 3. Optimize Tables (định kỳ)
```sql
-- Optimize bảng tracking (vì sẽ rất lớn)
OPTIMIZE TABLE tracking;

-- Xóa tracking data cũ hơn 30 ngày
DELETE FROM tracking
WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### 4. Monitor Performance
```sql
-- Kiểm tra slow queries
SHOW PROCESSLIST;

-- Kiểm tra table size
SELECT
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'ssb_db'
ORDER BY size_mb DESC;
```

---

## Troubleshooting

### Lỗi: Access denied for user
```sql
-- Reset password MySQL
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Lỗi: Can't connect to MySQL server
```bash
# Kiểm tra MySQL có chạy không
# Windows
net start MySQL80

# Mac/Linux
sudo systemctl status mysql
```

### Lỗi: Foreign key constraint fails
```sql
-- Tạm tắt foreign key check
SET FOREIGN_KEY_CHECKS = 0;
-- Chạy queries...
SET FOREIGN_KEY_CHECKS = 1;
```

---

## Next Steps

Sau khi setup database xong:

1. ✅ Setup backend structure
2. ✅ Create models
3. ✅ Create controllers
4. ✅ Create routes
5. ✅ Test APIs với Postman
