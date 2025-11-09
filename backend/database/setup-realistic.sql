-- ============================================
-- DATABASE SETUP WITH REALISTIC DATA
-- Tọa độ thực tế tại TP.HCM
-- ============================================

USE ssb_db;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE tracking;
TRUNCATE TABLE schedule_students;
TRUNCATE TABLE schedules;
TRUNCATE TABLE incidents;
TRUNCATE TABLE messages;
TRUNCATE TABLE notifications;
TRUNCATE TABLE stops;
TRUNCATE TABLE routes;
TRUNCATE TABLE students;
TRUNCATE TABLE parents;
TRUNCATE TABLE drivers;
TRUNCATE TABLE buses;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. USERS
-- ============================================

-- Admin (password: admin123)
INSERT INTO users (email, password_hash, full_name, phone, user_type, is_active) VALUES
('admin@ssb.com', '$2a$10$zwJqQkNbjyGKlEMb6fIR0eM5j13LTmq.N2Gqo6YGGxrKG5EbsnI3i', 'Quản trị hệ thống', '0901234567', 'admin', TRUE);

-- Drivers (password: driver123)
INSERT INTO users (email, password_hash, full_name, phone, user_type, is_active) VALUES
('taixe1@ssb.com', '$2a$10$3Gk.qTz4syth0SCUTAc7dO3M8gv6auY4pJB8nUDos9NzDKvSyg4oi', 'Nguyễn Văn Tài', '0912345678', 'driver', TRUE),
('taixe2@ssb.com', '$2a$10$3Gk.qTz4syth0SCUTAc7dO3M8gv6auY4pJB8nUDos9NzDKvSyg4oi', 'Trần Minh Đức', '0923456789', 'driver', TRUE),
('taixe3@ssb.com', '$2a$10$3Gk.qTz4syth0SCUTAc7dO3M8gv6auY4pJB8nUDos9NzDKvSyg4oi', 'Lê Hoàng Nam', '0934567890', 'driver', TRUE);

-- Parents (password: parent123)
INSERT INTO users (email, password_hash, full_name, phone, user_type, is_active) VALUES
('phuhuynh1@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Trần Thị Hoa', '0945678901', 'parent', TRUE),
('phuhuynh2@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Nguyễn Minh Tuấn', '0956789012', 'parent', TRUE),
('phuhuynh3@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Lê Thị Mai', '0967890123', 'parent', TRUE),
('phuhuynh4@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Phạm Văn Hùng', '0978901234', 'parent', TRUE),
('phuhuynh5@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Hoàng Thị Lan', '0989012345', 'parent', TRUE);

-- ============================================
-- 2. DRIVERS
-- ============================================
INSERT INTO drivers (user_id, license_number, license_expiry, address, emergency_contact, status) VALUES
(2, 'B2-7654321', '2026-12-31', '123 Lý Thường Kiệt, Quận 10, TP.HCM', '0901111111', 'available'),
(3, 'B2-8765432', '2027-06-30', '456 Võ Văn Tần, Quận 3, TP.HCM', '0902222222', 'available'),
(4, 'B2-9876543', '2026-09-15', '789 Nguyễn Đình Chiểu, Quận 1, TP.HCM', '0903333333', 'available');

-- ============================================
-- 3. PARENTS
-- ============================================
INSERT INTO parents (user_id, address, emergency_contact, relationship) VALUES
(5, '234 Nguyễn Thị Minh Khai, Quận 1, TP.HCM', '0911111111', 'Mẹ'),
(6, '567 Pasteur, Quận 3, TP.HCM', '0922222222', 'Bố'),
(7, '890 Điện Biên Phủ, Quận 3, TP.HCM', '0933333333', 'Mẹ'),
(8, '123 Hai Bà Trưng, Quận 1, TP.HCM', '0944444444', 'Bố'),
(9, '456 Lê Lợi, Quận 1, TP.HCM', '0955555555', 'Mẹ');

-- ============================================
-- 4. STUDENTS - Với tọa độ thực tế
-- ============================================
INSERT INTO students (parent_id, full_name, date_of_birth, gender, grade, class, student_code, 
                     pickup_address, pickup_latitude, pickup_longitude,
                     dropoff_address, dropoff_latitude, dropoff_longitude, is_active) VALUES
(1, 'Trần Minh An', '2015-03-15', 'male', '3', '3A', 'HS001', 
   '234 Nguyễn Thị Minh Khai, Q.1', 10.7880, 106.6970,
   'Trường Tiểu học Lê Quý Đôn, Q.3', 10.7756, 106.6919, TRUE),
   
(1, 'Trần Minh Thư', '2017-07-20', 'female', '1', '1B', 'HS002',
   '234 Nguyễn Thị Minh Khai, Q.1', 10.7880, 106.6970,
   'Trường Tiểu học Lê Quý Đôn, Q.3', 10.7756, 106.6919, TRUE),
   
(2, 'Nguyễn Hoàng Nam', '2014-05-10', 'male', '4', '4A', 'HS003',
   '567 Pasteur, Q.3', 10.7770, 106.6938,
   'Trường Tiểu học Lê Quý Đôn, Q.3', 10.7756, 106.6919, TRUE),
   
(3, 'Lê Thảo My', '2016-09-25', 'female', '2', '2A', 'HS004',
   '890 Điện Biên Phủ, Q.3', 10.7820, 106.6930,
   'Trường Tiểu học Lê Quý Đôn, Q.3', 10.7756, 106.6919, TRUE),
   
(4, 'Phạm Minh Khôi', '2015-11-05', 'male', '3', '3B', 'HS005',
   '123 Hai Bà Trưng, Q.1', 10.7875, 106.6985,
   'Trường Tiểu học Lê Quý Đôn, Q.3', 10.7756, 106.6919, TRUE),
   
(5, 'Hoàng Ngọc Linh', '2016-02-14', 'female', '2', '2B', 'HS006',
   '456 Lê Lợi, Q.1', 10.7890, 106.7000,
   'Trường Tiểu học Lê Quý Đôn, Q.3', 10.7756, 106.6919, TRUE);

-- ============================================
-- 5. BUSES
-- ============================================
INSERT INTO buses (bus_number, license_plate, capacity, model, year, status) VALUES
('BUS-001', '51A-12345', 30, 'Hyundai County', 2022, 'active'),
('BUS-002', '51A-23456', 30, 'Thaco TB120S', 2023, 'active'),
('BUS-003', '51A-34567', 25, 'Ford Transit', 2022, 'active');

-- ============================================
-- 6. ROUTES - Tuyến đường thực tế ở TP.HCM
-- ============================================
INSERT INTO routes (route_name, route_code, description, estimated_duration, distance_km, status) VALUES
('Tuyến 1 - Sáng - Quận 1 đến Trường', 'RT-001-M', 'Tuyến đón học sinh khu vực Quận 1 buổi sáng', 45, 8.5, 'active'),
('Tuyến 1 - Chiều - Trường về Quận 1', 'RT-001-A', 'Tuyến trả học sinh khu vực Quận 1 buổi chiều', 45, 8.5, 'active'),
('Tuyến 2 - Sáng - Quận 3 đến Trường', 'RT-002-M', 'Tuyến đón học sinh khu vực Quận 3 buổi sáng', 40, 6.2, 'active'),
('Tuyến 2 - Chiều - Trường về Quận 3', 'RT-002-A', 'Tuyến trả học sinh khu vực Quận 3 buổi chiều', 40, 6.2, 'active');

-- ============================================
-- 7. STOPS - Điểm dừng với tọa độ GPS thực tế
-- ============================================

-- TUYẾN 1 SÁNG (Quận 1 -> Trường)
INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order, estimated_arrival_time) VALUES
(1, 'Điểm 1 - Bến Thành', 'Chợ Bến Thành, Q.1', 10.7720, 106.6980, 1, '06:30:00'),
(1, 'Điểm 2 - Nhà Thờ Đức Bà', 'Công xã Paris, Q.1', 10.7797, 106.6990, 2, '06:35:00'),
(1, 'Điểm 3 - Bưu điện Trung tâm', 'Công xã Paris, Q.1', 10.7800, 106.7000, 3, '06:38:00'),
(1, 'Điểm 4 - Công viên 30/4', 'Lê Duẩn, Q.1', 10.7880, 106.6970, 4, '06:45:00'),
(1, 'Điểm 5 - Trường Lê Quý Đôn', 'Võ Thị Sáu, Q.3', 10.7756, 106.6919, 5, '06:55:00');

-- TUYẾN 1 CHIỀU (Trường -> Quận 1)
INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order, estimated_arrival_time) VALUES
(2, 'Điểm 1 - Trường Lê Quý Đôn', 'Võ Thị Sáu, Q.3', 10.7756, 106.6919, 1, '16:00:00'),
(2, 'Điểm 2 - Công viên 30/4', 'Lê Duẩn, Q.1', 10.7880, 106.6970, 2, '16:10:00'),
(2, 'Điểm 3 - Bưu điện Trung tâm', 'Công xã Paris, Q.1', 10.7800, 106.7000, 3, '16:17:00'),
(2, 'Điểm 4 - Nhà Thờ Đức Bà', 'Công xã Paris, Q.1', 10.7797, 106.6990, 4, '16:20:00'),
(2, 'Điểm 5 - Bến Thành', 'Chợ Bến Thành, Q.1', 10.7720, 106.6980, 5, '16:25:00');

-- TUYẾN 2 SÁNG (Quận 3 -> Trường)
INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order, estimated_arrival_time) VALUES
(3, 'Điểm 1 - Điện Biên Phủ', 'Điện Biên Phủ, Q.3', 10.7820, 106.6930, 1, '06:35:00'),
(3, 'Điểm 2 - Pasteur', 'Pasteur, Q.3', 10.7770, 106.6938, 2, '06:40:00'),
(3, 'Điểm 3 - Võ Thị Sáu', 'Võ Thị Sáu, Q.3', 10.7760, 106.6915, 3, '06:45:00'),
(3, 'Điểm 4 - Trường Lê Quý Đôn', 'Võ Thị Sáu, Q.3', 10.7756, 106.6919, 4, '06:50:00');

-- TUYẾN 2 CHIỀU (Trường -> Quận 3)
INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order, estimated_arrival_time) VALUES
(4, 'Điểm 1 - Trường Lê Quý Đôn', 'Võ Thị Sáu, Q.3', 10.7756, 106.6919, 1, '16:00:00'),
(4, 'Điểm 2 - Võ Thị Sáu', 'Võ Thị Sáu, Q.3', 10.7760, 106.6915, 2, '16:05:00'),
(4, 'Điểm 3 - Pasteur', 'Pasteur, Q.3', 10.7770, 106.6938, 3, '16:10:00'),
(4, 'Điểm 4 - Điện Biên Phủ', 'Điện Biên Phủ, Q.3', 10.7820, 106.6930, 4, '16:15:00');

-- ============================================
-- 8. SCHEDULES - Lịch trình hôm nay
-- ============================================
INSERT INTO schedules (route_id, bus_id, driver_id, schedule_date, trip_type, start_time, end_time, status) VALUES
-- Tuyến 1 - Sáng
(1, 1, 1, CURDATE(), 'pickup', '06:30:00', '07:00:00', 'scheduled'),
-- Tuyến 1 - Chiều
(2, 1, 1, CURDATE(), 'dropoff', '16:00:00', '16:30:00', 'scheduled'),
-- Tuyến 2 - Sáng
(3, 2, 2, CURDATE(), 'pickup', '06:35:00', '07:00:00', 'scheduled'),
-- Tuyến 2 - Chiều
(4, 2, 2, CURDATE(), 'dropoff', '16:00:00', '16:20:00', 'scheduled');

-- ============================================
-- 9. SCHEDULE_STUDENTS - Gán học sinh vào lịch trình
-- ============================================

-- Schedule 1: Tuyến 1 Sáng (HS001, HS002, HS005, HS006)
INSERT INTO schedule_students (schedule_id, student_id, stop_id, pickup_status, dropoff_status) VALUES
(1, 1, 4, 'pending', 'pending'),  -- HS001 tại Công viên 30/4
(1, 2, 4, 'pending', 'pending'),  -- HS002 tại Công viên 30/4
(1, 5, 3, 'pending', 'pending'),  -- HS005 tại Bưu điện
(1, 6, 1, 'pending', 'pending');  -- HS006 tại Bến Thành

-- Schedule 2: Tuyến 1 Chiều (HS001, HS002, HS005, HS006)
INSERT INTO schedule_students (schedule_id, student_id, stop_id, pickup_status, dropoff_status) VALUES
(2, 1, 7, 'pending', 'pending'),  -- HS001 trả tại Công viên 30/4
(2, 2, 7, 'pending', 'pending'),  -- HS002 trả tại Công viên 30/4
(2, 5, 8, 'pending', 'pending'),  -- HS005 trả tại Bưu điện
(2, 6, 10, 'pending', 'pending'); -- HS006 trả tại Bến Thành

-- Schedule 3: Tuyến 2 Sáng (HS003, HS004)
INSERT INTO schedule_students (schedule_id, student_id, stop_id, pickup_status, dropoff_status) VALUES
(3, 3, 12, 'pending', 'pending'), -- HS003 tại Pasteur
(3, 4, 11, 'pending', 'pending'); -- HS004 tại Điện Biên Phủ

-- Schedule 4: Tuyến 2 Chiều (HS003, HS004)
INSERT INTO schedule_students (schedule_id, student_id, stop_id, pickup_status, dropoff_status) VALUES
(4, 3, 17, 'pending', 'pending'), -- HS003 trả tại Pasteur
(4, 4, 18, 'pending', 'pending'); -- HS004 trả tại Điện Biên Phủ

-- ============================================
-- 10. TRACKING DATA - Dữ liệu GPS mẫu cho xe đang chạy
-- ============================================
INSERT INTO tracking (schedule_id, latitude, longitude, speed, heading, accuracy, recorded_at) VALUES
-- Bus đang ở điểm Bến Thành
(1, 10.7720, 106.6980, 15.5, 45, 5.0, NOW() - INTERVAL 5 MINUTE),
(1, 10.7750, 106.6985, 20.0, 50, 5.0, NOW() - INTERVAL 3 MINUTE),
(1, 10.7780, 106.6990, 18.5, 48, 5.0, NOW() - INTERVAL 1 MINUTE);

-- ============================================
-- VERIFY SETUP
-- ============================================
SELECT 'Database setup completed!' as status;
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Drivers created:' as info, COUNT(*) as count FROM drivers;
SELECT 'Parents created:' as info, COUNT(*) as count FROM parents;
SELECT 'Students created:' as info, COUNT(*) as count FROM students;
SELECT 'Buses created:' as info, COUNT(*) as count FROM buses;
SELECT 'Routes created:' as info, COUNT(*) as count FROM routes;
SELECT 'Stops created:' as info, COUNT(*) as count FROM stops;
SELECT 'Schedules for TODAY:' as info, COUNT(*) as count FROM schedules WHERE schedule_date = CURDATE();
SELECT 'Schedule-Students assignments:' as info, COUNT(*) as count FROM schedule_students;
SELECT 'Tracking records:' as info, COUNT(*) as count FROM tracking;
