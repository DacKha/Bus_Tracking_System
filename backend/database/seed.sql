-- ============================================
-- SEED DATA FOR TESTING
-- Smart School Bus Tracking System
-- ============================================

USE ssb_db;

-- ============================================
-- CLEAR EXISTING DATA (Optional - Comment out if you want to keep data)
-- ============================================
-- TRUNCATE TABLE schedule_students;
-- TRUNCATE TABLE schedules;
-- TRUNCATE TABLE tracking;
-- TRUNCATE TABLE messages;
-- TRUNCATE TABLE notifications;
-- TRUNCATE TABLE incidents;
-- TRUNCATE TABLE stops;
-- TRUNCATE TABLE routes;
-- TRUNCATE TABLE students;
-- TRUNCATE TABLE parents;
-- TRUNCATE TABLE drivers;
-- TRUNCATE TABLE buses;
-- TRUNCATE TABLE users;

-- ============================================
-- 1. CREATE TEST USERS
-- ============================================

-- Admin Users (3) - Password: Admin@123
INSERT INTO users (email, password_hash, full_name, phone, user_type, is_active) VALUES
('admin@ssb.com', '$2a$10$zwJqQkNbjyGKlEMb6fIR0eM5j13LTmq.N2Gqo6YGGxrKG5EbsnI3i', 'Admin One', '0901000001', 'admin', TRUE),
('admin2@ssb.com', '$2a$10$zwJqQkNbjyGKlEMb6fIR0eM5j13LTmq.N2Gqo6YGGxrKG5EbsnI3i', 'Admin Two', '0901000002', 'admin', TRUE),
('admin3@ssb.com', '$2a$10$zwJqQkNbjyGKlEMb6fIR0eM5j13LTmq.N2Gqo6YGGxrKG5EbsnI3i', 'Admin Three', '0901000003', 'admin', TRUE);

-- Driver Users (5) - Password: Driver@123
INSERT INTO users (email, password_hash, full_name, phone, user_type, is_active) VALUES
('driver1@ssb.com', '$2a$10$3Gk.qTz4syth0SCUTAc7dO3M8gv6auY4pJB8nUDos9NzDKvSyg4oi', 'Driver One', '0902000001', 'driver', TRUE),
('driver2@ssb.com', '$2a$10$3Gk.qTz4syth0SCUTAc7dO3M8gv6auY4pJB8nUDos9NzDKvSyg4oi', 'Driver Two', '0902000002', 'driver', TRUE),
('driver3@ssb.com', '$2a$10$3Gk.qTz4syth0SCUTAc7dO3M8gv6auY4pJB8nUDos9NzDKvSyg4oi', 'Driver Three', '0902000003', 'driver', TRUE),
('driver4@ssb.com', '$2a$10$3Gk.qTz4syth0SCUTAc7dO3M8gv6auY4pJB8nUDos9NzDKvSyg4oi', 'Driver Four', '0902000004', 'driver', TRUE),
('driver5@ssb.com', '$2a$10$3Gk.qTz4syth0SCUTAc7dO3M8gv6auY4pJB8nUDos9NzDKvSyg4oi', 'Driver Five', '0902000005', 'driver', TRUE);

-- Parent Users (10) - Password: Parent@123
INSERT INTO users (email, password_hash, full_name, phone, user_type, is_active) VALUES
('parent1@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Parent One', '0903000001', 'parent', TRUE),
('parent2@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Parent Two', '0903000002', 'parent', TRUE),
('parent3@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Parent Three', '0903000003', 'parent', TRUE),
('parent4@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Parent Four', '0903000004', 'parent', TRUE),
('parent5@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Parent Five', '0903000005', 'parent', TRUE),
('parent6@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Parent Six', '0903000006', 'parent', TRUE),
('parent7@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Parent Seven', '0903000007', 'parent', TRUE),
('parent8@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Parent Eight', '0903000008', 'parent', TRUE),
('parent9@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Parent Nine', '0903000009', 'parent', TRUE),
('parent10@ssb.com', '$2a$10$zv4VvyaeH8g8f1gTQrZuxeavvPaZIIryg09VU8zf.PdI4lwKe01r.', 'Parent Ten', '0903000010', 'parent', TRUE);

-- ============================================
-- 2. CREATE DRIVERS
-- ============================================
INSERT INTO drivers (user_id, license_number, license_expiry, address, emergency_contact, status) VALUES
(4, 'DL001', '2027-10-21', '123 Driver Street, City', '0912000001', 'available'),
(5, 'DL002', '2027-10-21', '124 Driver Street, City', '0912000002', 'available'),
(6, 'DL003', '2027-10-21', '125 Driver Street, City', '0912000003', 'available'),
(7, 'DL004', '2027-10-21', '126 Driver Street, City', '0912000004', 'available'),
(8, 'DL005', '2027-10-21', '127 Driver Street, City', '0912000005', 'available');

-- ============================================
-- 3. CREATE PARENTS
-- ============================================
INSERT INTO parents (user_id, emergency_contact, address, relationship) VALUES
(9, '0913000001', '101 Parent Street, City', 'Father'),
(10, '0913000002', '102 Parent Street, City', 'Father'),
(11, '0913000003', '103 Parent Street, City', 'Father'),
(12, '0913000004', '104 Parent Street, City', 'Father'),
(13, '0913000005', '105 Parent Street, City', 'Father'),
(14, '0913000006', '106 Parent Street, City', 'Father'),
(15, '0913000007', '107 Parent Street, City', 'Father'),
(16, '0913000008', '108 Parent Street, City', 'Father'),
(17, '0913000009', '109 Parent Street, City', 'Father'),
(18, '0913000010', '110 Parent Street, City', 'Father');

-- ============================================
-- 4. CREATE STUDENTS
-- Lưu ý: gender phải là 'male', 'female', 'other' theo schema
-- Các cột: pickup_address, class (không phải class_name)
-- ============================================
INSERT INTO students (parent_id, full_name, date_of_birth, gender, pickup_address, grade, class, is_active) VALUES
(1, 'Student One A', '2010-05-01', 'male', '101 Student Street, City', '10', '10A', TRUE),
(1, 'Student One B', '2012-05-01', 'female', '101 Student Street, City', '8', '8B', TRUE),
(2, 'Student Two A', '2011-06-01', 'male', '102 Student Street, City', '9', '9A', TRUE),
(3, 'Student Three A', '2010-07-01', 'female', '103 Student Street, City', '10', '10B', TRUE),
(4, 'Student Four A', '2011-08-01', 'male', '104 Student Street, City', '9', '9B', TRUE),
(5, 'Student Five A', '2012-09-01', 'female', '105 Student Street, City', '8', '8A', TRUE),
(6, 'Student Six A', '2010-10-01', 'male', '106 Student Street, City', '10', '10A', TRUE),
(7, 'Student Seven A', '2011-11-01', 'female', '107 Student Street, City', '9', '9C', TRUE),
(8, 'Student Eight A', '2012-12-01', 'male', '108 Student Street, City', '8', '8C', TRUE),
(9, 'Student Nine A', '2010-01-15', 'female', '109 Student Street, City', '10', '10C', TRUE),
(10, 'Student Ten A', '2011-02-15', 'male', '110 Student Street, City', '9', '9D', TRUE);

-- ============================================
-- 5. CREATE BUSES
-- ============================================
INSERT INTO buses (bus_number, license_plate, capacity, model, year, status) VALUES
('BUS001', 'ABC12345', 50, 'Mercedes Sprinter', 2022, 'active'),
('BUS002', 'ABC12346', 50, 'Mercedes Sprinter', 2022, 'active'),
('BUS003', 'ABC12347', 40, 'Hyundai County', 2021, 'active'),
('BUS004', 'ABC12348', 40, 'Hyundai County', 2021, 'maintenance'),
('BUS005', 'ABC12349', 50, 'Mercedes Sprinter', 2023, 'active');

-- ============================================
-- 6. CREATE ROUTES
-- ============================================
INSERT INTO routes (route_name, route_code, description, estimated_duration, distance_km, status) VALUES
('Route A - Morning', 'ROUTE_A_M', 'Morning pickup route', 45, 25.5, 'active'),
('Route A - Afternoon', 'ROUTE_A_A', 'Afternoon dropoff route', 45, 25.5, 'active'),
('Route B - Morning', 'ROUTE_B_M', 'Morning pickup route', 60, 35.0, 'active'),
('Route B - Afternoon', 'ROUTE_B_A', 'Afternoon dropoff route', 60, 35.0, 'active'),
('Route C - Morning', 'ROUTE_C_M', 'Morning pickup route', 30, 15.0, 'active');

-- ============================================
-- 7. CREATE STOPS
-- ============================================
-- Route A Morning (5 stops)
INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order) VALUES
(1, 'Stop A1', '1 Main Street', 10.7769, 106.6998, 1),
(1, 'Stop A2', '2 Main Street', 10.7780, 106.7010, 2),
(1, 'Stop A3', '3 Main Street', 10.7800, 106.7030, 3),
(1, 'Stop A4', '4 Main Street', 10.7820, 106.7050, 4),
(1, 'Stop A5 - School', '5 Main Street', 10.7850, 106.7080, 5);

-- Route A Afternoon (same stops as morning)
INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order) VALUES
(2, 'Stop A5 - School', '5 Main Street', 10.7850, 106.7080, 1),
(2, 'Stop A4', '4 Main Street', 10.7820, 106.7050, 2),
(2, 'Stop A3', '3 Main Street', 10.7800, 106.7030, 3),
(2, 'Stop A2', '2 Main Street', 10.7780, 106.7010, 4),
(2, 'Stop A1', '1 Main Street', 10.7769, 106.6998, 5);

-- Route B Morning (6 stops)
INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order) VALUES
(3, 'Stop B1', '10 Street A', 10.7600, 106.6800, 1),
(3, 'Stop B2', '11 Street A', 10.7650, 106.6850, 2),
(3, 'Stop B3', '12 Street A', 10.7700, 106.6900, 3),
(3, 'Stop B4', '13 Street A', 10.7750, 106.6950, 4),
(3, 'Stop B5', '14 Street A', 10.7800, 106.7000, 5),
(3, 'Stop B6 - School', '15 Street A', 10.7850, 106.7050, 6);

-- Route B Afternoon (reverse)
INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order) VALUES
(4, 'Stop B6 - School', '15 Street A', 10.7850, 106.7050, 1),
(4, 'Stop B5', '14 Street A', 10.7800, 106.7000, 2),
(4, 'Stop B4', '13 Street A', 10.7750, 106.6950, 3),
(4, 'Stop B3', '12 Street A', 10.7700, 106.6900, 4),
(4, 'Stop B2', '11 Street A', 10.7650, 106.6850, 5),
(4, 'Stop B1', '10 Street A', 10.7600, 106.6800, 6);

-- Route C Morning (4 stops)
INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order) VALUES
(5, 'Stop C1', '20 Street B', 10.7900, 106.7200, 1),
(5, 'Stop C2', '21 Street B', 10.7950, 106.7250, 2),
(5, 'Stop C3', '22 Street B', 10.8000, 106.7300, 3),
(5, 'Stop C4 - School', '23 Street B', 10.8050, 106.7350, 4);

-- ============================================
-- 8. CREATE SCHEDULES (Today's schedules for testing)
-- Lưu ý: Sử dụng schedule_date và trip_type theo schema chính thức
-- ============================================
INSERT INTO schedules (route_id, bus_id, driver_id, trip_type, schedule_date, start_time, end_time, status) VALUES
(1, 1, 1, 'pickup', CURDATE(), '07:00:00', '08:00:00', 'scheduled'),
(2, 1, 1, 'dropoff', CURDATE(), '16:00:00', '17:00:00', 'scheduled'),
(3, 2, 2, 'pickup', CURDATE(), '06:30:00', '08:00:00', 'scheduled'),
(4, 2, 2, 'dropoff', CURDATE(), '16:30:00', '18:00:00', 'scheduled'),
(5, 3, 3, 'pickup', CURDATE(), '07:30:00', '08:15:00', 'scheduled');

-- ============================================
-- 9. CREATE SCHEDULE_STUDENTS (Assign students to schedules)
-- ============================================
INSERT INTO schedule_students (schedule_id, student_id, stop_id, pickup_status, dropoff_status) VALUES
-- Schedule 1 (Route A - Morning) - Students 1, 2
(1, 1, 1, 'pending', 'pending'),
(1, 2, 2, 'pending', 'pending'),

-- Schedule 2 (Route A - Afternoon) - Students 1, 2
(2, 1, 5, 'pending', 'pending'),
(2, 2, 5, 'pending', 'pending'),

-- Schedule 3 (Route B - Morning) - Students 3, 4, 5
(3, 3, 17, 'pending', 'pending'),
(3, 4, 17, 'pending', 'pending'),
(3, 5, 19, 'pending', 'pending'),

-- Schedule 4 (Route B - Afternoon) - Students 3, 4, 5
(4, 3, 17, 'pending', 'pending'),
(4, 4, 17, 'pending', 'pending'),
(4, 5, 19, 'pending', 'pending'),

-- Schedule 5 (Route C - Morning) - Students 6, 7
(5, 6, 27, 'pending', 'pending'),
(5, 7, 28, 'pending', 'pending');

-- ============================================
-- NOTE ABOUT PASSWORDS
-- ============================================
-- All test user passwords hash to: Admin@123
-- Hash created with bcryptjs salt=10
-- Users:
-- admin@ssb.com / Admin@123
-- driver1@ssb.com / Admin@123
-- parent1@ssb.com / Admin@123
-- etc.

-- ============================================
-- VERIFY DATA INSERTION
-- ============================================
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Drivers created:' as info, COUNT(*) as count FROM drivers;
SELECT 'Parents created:' as info, COUNT(*) as count FROM parents;
SELECT 'Students created:' as info, COUNT(*) as count FROM students;
SELECT 'Buses created:' as info, COUNT(*) as count FROM buses;
SELECT 'Routes created:' as info, COUNT(*) as count FROM routes;
SELECT 'Stops created:' as info, COUNT(*) as count FROM stops;
SELECT 'Schedules created:' as info, COUNT(*) as count FROM schedules;
SELECT 'Schedule-Students created:' as info, COUNT(*) as count FROM schedule_students;

