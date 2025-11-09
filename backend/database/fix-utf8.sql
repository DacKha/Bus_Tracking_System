SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
USE ssb_db;

-- Update Users
UPDATE users SET full_name = 'Quản trị hệ thống' WHERE user_id = 1;
UPDATE users SET full_name = 'Nguyễn Văn Tài' WHERE user_id = 2;
UPDATE users SET full_name = 'Trần Minh Đức' WHERE user_id = 3;
UPDATE users SET full_name = 'Lê Hoàng Nam' WHERE user_id = 4;
UPDATE users SET full_name = 'Trần Thị Hoa' WHERE user_id = 5;
UPDATE users SET full_name = 'Nguyễn Minh Tuấn' WHERE user_id = 6;
UPDATE users SET full_name = 'Lê Thị Mai' WHERE user_id = 7;
UPDATE users SET full_name = 'Phạm Văn Hùng' WHERE user_id = 8;
UPDATE users SET full_name = 'Hoàng Thị Lan' WHERE user_id = 9;

-- Update Students
UPDATE students SET full_name = 'Trần Minh An' WHERE student_id = 1;
UPDATE students SET full_name = 'Trần Minh Thư' WHERE student_id = 2;
UPDATE students SET full_name = 'Nguyễn Hoàng Nam' WHERE student_id = 3;
UPDATE students SET full_name = 'Lê Thảo My' WHERE student_id = 4;
UPDATE students SET full_name = 'Phạm Minh Khôi' WHERE student_id = 5;
UPDATE students SET full_name = 'Hoàng Ngọc Linh' WHERE student_id = 6;

-- Update Routes
UPDATE routes SET route_name = 'Tuyến 1 - Sáng - Quận 1 đến Trường' WHERE route_id = 1;
UPDATE routes SET route_name = 'Tuyến 1 - Chiều - Trường về Quận 1' WHERE route_id = 2;
UPDATE routes SET route_name = 'Tuyến 2 - Sáng - Quận 3 đến Trường' WHERE route_id = 3;
UPDATE routes SET route_name = 'Tuyến 2 - Chiều - Trường về Quận 3' WHERE route_id = 4;

UPDATE routes SET description = 'Tuyến đón học sinh khu vực Quận 1 buổi sáng' WHERE route_id = 1;
UPDATE routes SET description = 'Tuyến trả học sinh khu vực Quận 1 buổi chiều' WHERE route_id = 2;
UPDATE routes SET description = 'Tuyến đón học sinh khu vực Quận 3 buổi sáng' WHERE route_id = 3;
UPDATE routes SET description = 'Tuyến trả học sinh khu vực Quận 3 buổi chiều' WHERE route_id = 4;

-- Update Stops
UPDATE stops SET stop_name = 'Điểm 1 - Bến Thành' WHERE stop_id = 1;
UPDATE stops SET stop_name = 'Điểm 2 - Nhà Thờ Đức Bà' WHERE stop_id = 2;
UPDATE stops SET stop_name = 'Điểm 3 - Bưu điện Trung tâm' WHERE stop_id = 3;
UPDATE stops SET stop_name = 'Điểm 4 - Công viên 30/4' WHERE stop_id = 4;
UPDATE stops SET stop_name = 'Điểm 5 - Trường Lê Quý Đôn' WHERE stop_id = 5;

UPDATE stops SET stop_address = 'Chợ Bến Thành, Q.1' WHERE stop_id = 1;
UPDATE stops SET stop_address = 'Công xã Paris, Q