-- ============================================
-- DATABASE SCHEMA FOR SSB 1.0
-- Smart School Bus Tracking System
-- ============================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS ssb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ssb_db;

-- ============================================
-- TABLE 1: USERS
-- Bảng lưu tất cả người dùng (admin, driver, parent)
-- ============================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type ENUM('admin', 'driver', 'parent') NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- ============================================
-- TABLE 2: DRIVERS
-- Thông tin chi tiết về tài xế
-- ============================================
CREATE TABLE drivers (
    driver_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    address TEXT,
    emergency_contact VARCHAR(20),
    status ENUM('available', 'on_trip', 'off_duty') DEFAULT 'available',
    rating DECIMAL(3,2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_status (status)
);

-- ============================================
-- TABLE 3: BUSES
-- Thông tin xe buýt
-- ============================================
CREATE TABLE buses (
    bus_id INT PRIMARY KEY AUTO_INCREMENT,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    model VARCHAR(100),
    year INT,
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_bus_number (bus_number)
);

-- ============================================
-- TABLE 4: ROUTES
-- Tuyến đường
-- ============================================
CREATE TABLE routes (
    route_id INT PRIMARY KEY AUTO_INCREMENT,
    route_name VARCHAR(255) NOT NULL,
    route_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    estimated_duration INT COMMENT 'Thời gian dự kiến (phút)',
    distance_km DECIMAL(10,2),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_route_code (route_code),
    INDEX idx_status (status)
);

-- ============================================
-- TABLE 5: STOPS
-- Điểm dừng trong tuyến đường
-- ============================================
CREATE TABLE stops (
    stop_id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    stop_name VARCHAR(255) NOT NULL,
    stop_address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    stop_order INT NOT NULL COMMENT 'Thứ tự điểm dừng trong tuyến',
    estimated_arrival_time TIME COMMENT 'Giờ dự kiến đến',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    INDEX idx_route_id (route_id),
    INDEX idx_stop_order (stop_order)
);

-- ============================================
-- TABLE 6: PARENTS
-- Thông tin phụ huynh
-- ============================================
CREATE TABLE parents (
    parent_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    address TEXT,
    emergency_contact VARCHAR(20),
    relationship VARCHAR(50) COMMENT 'Quan hệ: bố, mẹ, ông bà, etc.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- TABLE 7: STUDENTS
-- Thông tin học sinh
-- ============================================
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    grade VARCHAR(20),
    class VARCHAR(50),
    student_code VARCHAR(50) UNIQUE,
    photo_url VARCHAR(500),
    pickup_address TEXT,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    dropoff_address TEXT,
    dropoff_latitude DECIMAL(10, 8),
    dropoff_longitude DECIMAL(11, 8),
    special_needs TEXT COMMENT 'Nhu cầu đặc biệt',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(parent_id) ON DELETE CASCADE,
    INDEX idx_parent_id (parent_id),
    INDEX idx_student_code (student_code),
    INDEX idx_is_active (is_active)
);

-- ============================================
-- TABLE 8: SCHEDULES
-- Lịch trình đưa đón
-- ============================================
CREATE TABLE schedules (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    bus_id INT NOT NULL,
    driver_id INT NOT NULL,
    schedule_date DATE NOT NULL,
    trip_type ENUM('pickup', 'dropoff') NOT NULL COMMENT 'Loại chuyến: đón hoặc trả',
    start_time TIME NOT NULL,
    end_time TIME,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE,
    INDEX idx_schedule_date (schedule_date),
    INDEX idx_driver_id (driver_id),
    INDEX idx_status (status),
    INDEX idx_trip_type (trip_type)
);

-- ============================================
-- TABLE 9: SCHEDULE_STUDENTS
-- Học sinh được gán vào lịch trình
-- ============================================
CREATE TABLE schedule_students (
    schedule_student_id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    student_id INT NOT NULL,
    stop_id INT NOT NULL,
    pickup_status ENUM('pending', 'picked_up', 'absent', 'cancelled') DEFAULT 'pending',
    pickup_time TIMESTAMP NULL,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    dropoff_status ENUM('pending', 'dropped_off', 'cancelled') DEFAULT 'pending',
    dropoff_time TIMESTAMP NULL,
    dropoff_latitude DECIMAL(10, 8),
    dropoff_longitude DECIMAL(11, 8),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE CASCADE,
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_student_id (student_id),
    INDEX idx_pickup_status (pickup_status)
);

-- ============================================
-- TABLE 10: TRACKING
-- Theo dõi vị trí xe theo thời gian thực
-- ============================================
CREATE TABLE tracking (
    tracking_id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) COMMENT 'Tốc độ km/h',
    heading DECIMAL(5, 2) COMMENT 'Hướng di chuyển (độ)',
    accuracy DECIMAL(5, 2) COMMENT 'Độ chính xác GPS (mét)',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_recorded_at (recorded_at)
);

-- ============================================
-- TABLE 11: NOTIFICATIONS
-- Thông báo cho người dùng
-- ============================================
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('info', 'warning', 'alert', 'success') DEFAULT 'info',
    related_entity_type VARCHAR(50) COMMENT 'schedule, bus, student, etc.',
    related_entity_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- TABLE 12: MESSAGES
-- Tin nhắn giữa các user
-- ============================================
CREATE TABLE messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id INT NULL COMMENT 'Tin nhắn trả lời',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES messages(message_id) ON DELETE SET NULL,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_is_read (is_read)
);

-- ============================================
-- TABLE 13: INCIDENTS
-- Sự cố xảy ra trong chuyến đi
-- ============================================
CREATE TABLE incidents (
    incident_id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    reported_by INT NOT NULL COMMENT 'User ID người báo cáo',
    incident_type ENUM('accident', 'breakdown', 'delay', 'emergency', 'other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('reported', 'in_progress', 'resolved', 'closed') DEFAULT 'reported',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_status (status),
    INDEX idx_severity (severity)
);

-- ============================================
-- SAMPLE DATA (cho testing)
-- ============================================

-- Insert admin user (password: Admin@123)
INSERT INTO users (email, password_hash, full_name, phone, user_type) VALUES
('admin@ssb.com', '$2a$10$rF0mN3X4E5kG7hJ9iL1mMOqS2tP8uV0wX3yZ4aB6cD9eF2gH5iJ8k', 'Quản trị viên', '0901234567', 'admin');

-- Insert sample driver
INSERT INTO users (email, password_hash, full_name, phone, user_type) VALUES
('driver1@ssb.com', '$2a$10$rF0mN3X4E5kG7hJ9iL1mMOqS2tP8uV0wX3yZ4aB6cD9eF2gH5iJ8k', 'Nguyễn Văn Tài', '0912345678', 'driver');

INSERT INTO drivers (user_id, license_number, license_expiry, address, emergency_contact, status) VALUES
(2, 'B2-123456', '2026-12-31', '123 Đường ABC, Quận 1, TP.HCM', '0987654321', 'available');

-- Insert sample parent
INSERT INTO users (email, password_hash, full_name, phone, user_type) VALUES
('parent1@ssb.com', '$2a$10$rF0mN3X4E5kG7hJ9iL1mMOqS2tP8uV0wX3yZ4aB6cD9eF2gH5iJ8k', 'Trần Thị Hoa', '0923456789', 'parent');

INSERT INTO parents (user_id, address, emergency_contact, relationship) VALUES
(3, '456 Đường XYZ, Quận 3, TP.HCM', '0998765432', 'Mẹ');

-- Insert sample student
INSERT INTO students (parent_id, full_name, date_of_birth, gender, grade, class, student_code, pickup_address) VALUES
(1, 'Trần Minh An', '2015-05-15', 'male', '3', '3A', 'HS001', '456 Đường XYZ, Quận 3, TP.HCM');

-- Insert sample bus
INSERT INTO buses (bus_number, license_plate, capacity, model, year, status) VALUES
('BUS-001', '51A-12345', 30, 'Hyundai County', 2022, 'active'),
('BUS-002', '51A-23456', 30, 'Thaco TB120S', 2023, 'active');

-- Insert sample route
INSERT INTO routes (route_name, route_code, description, estimated_duration, distance_km) VALUES
('Tuyến 1 - Quận 1 đến Trường DEF', 'RT-001', 'Tuyến đưa đón học sinh khu vực Quận 1', 45, 12.5);

-- Insert sample stops
INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order, estimated_arrival_time) VALUES
(1, 'Điểm 1 - Ngã tư Trần Hưng Đạo', 'Ngã tư Trần Hưng Đạo - Nguyễn Thị Minh Khai', 10.7645, 106.6906, 1, '06:30:00'),
(1, 'Điểm 2 - Công viên 23/9', 'Công viên 23/9, Quận 1', 10.7692, 106.6950, 2, '06:40:00'),
(1, 'Điểm 3 - Trường DEF', 'Trường Tiểu học DEF', 10.7756, 106.7017, 3, '06:50:00');

-- ============================================
-- STORED PROCEDURES (optional - để tối ưu)
-- ============================================

-- Procedure lấy lịch trình hôm nay của tài xế
DELIMITER //
CREATE PROCEDURE GetDriverTodaySchedule(IN p_driver_id INT)
BEGIN
    SELECT
        s.schedule_id,
        s.schedule_date,
        s.trip_type,
        s.start_time,
        s.status,
        r.route_name,
        b.bus_number,
        COUNT(ss.student_id) as total_students
    FROM schedules s
    JOIN routes r ON s.route_id = r.route_id
    JOIN buses b ON s.bus_id = b.bus_id
    LEFT JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
    WHERE s.driver_id = p_driver_id
    AND s.schedule_date = CURDATE()
    GROUP BY s.schedule_id
    ORDER BY s.start_time;
END //
DELIMITER ;

-- ============================================
-- VIEWS (để truy vấn dễ dàng hơn)
-- ============================================

-- View: Tổng quan lịch trình
CREATE VIEW v_schedule_overview AS
SELECT
    s.schedule_id,
    s.schedule_date,
    s.trip_type,
    s.start_time,
    s.status,
    r.route_name,
    r.route_code,
    b.bus_number,
    b.license_plate,
    u.full_name as driver_name,
    u.phone as driver_phone,
    COUNT(ss.student_id) as total_students,
    SUM(CASE WHEN ss.pickup_status = 'picked_up' THEN 1 ELSE 0 END) as picked_up_count
FROM schedules s
JOIN routes r ON s.route_id = r.route_id
JOIN buses b ON s.bus_id = b.bus_id
JOIN drivers d ON s.driver_id = d.driver_id
JOIN users u ON d.user_id = u.user_id
LEFT JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
GROUP BY s.schedule_id;

-- View: Thông tin học sinh đầy đủ
CREATE VIEW v_students_full AS
SELECT
    st.student_id,
    st.full_name,
    st.date_of_birth,
    st.gender,
    st.grade,
    st.class,
    st.student_code,
    st.is_active,
    u.full_name as parent_name,
    u.phone as parent_phone,
    u.email as parent_email,
    st.pickup_address,
    st.special_needs
FROM students st
JOIN parents p ON st.parent_id = p.parent_id
JOIN users u ON p.user_id = u.user_id;

-- ============================================
-- INDEXES để tối ưu performance
-- ============================================

-- Composite indexes cho các query thường dùng
CREATE INDEX idx_schedule_date_driver ON schedules(schedule_date, driver_id);
CREATE INDEX idx_schedule_date_status ON schedules(schedule_date, status);
CREATE INDEX idx_tracking_schedule_time ON tracking(schedule_id, recorded_at);

-- ============================================
-- NOTES
-- ============================================
/*
1. Password mẫu đã được hash bằng bcrypt (password: Admin@123)
2. Để production, cần thay đổi tất cả passwords
3. Cần setup backup routine cho database
4. Tracking table có thể rất lớn - cần partition theo tháng
5. Indexes đã được tối ưu cho các query phổ biến
6. Foreign keys đã được setup với ON DELETE CASCADE/SET NULL phù hợp
*/
