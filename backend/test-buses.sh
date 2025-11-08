#!/bin/bash

# Mã màu
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Không có màu

# Bộ đếm kiểm tra
PASSED=0
FAILED=0

echo "==========================================="
echo "🚌 KIỂM TRA MODULE QUẢN LÝ XE BUÝT"
echo "==========================================="

API_URL="http://localhost:5000"

# Lấy token của admin
echo -e "\n${BLUE}🔑 Lấy Token Admin${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ssb.com","password":"Admin@123"}')

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✅ Lấy Token Admin Thành Công${NC}"
else
  echo -e "${RED}❌ Lấy Token Admin Thất Bại${NC}"
  echo "Phản hồi: $LOGIN_RESPONSE"
  exit 1
fi

# Kiểm tra 1: Lấy tất cả xe buýt (trước khi tạo)
echo -e "\n${YELLOW}KIỂM TRA 1: Lấy Tất Cả Xe Buýt (Trước Khi Tạo)${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/buses" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $RESPONSE | grep -q '"data"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $RESPONSE"
  ((FAILED++))
fi

# Kiểm tra 2: Tạo xe buýt thứ nhất
echo -e "\n${YELLOW}KIỂM TRA 2: Tạo Xe Buýt - BUS001${NC}"
CREATE_BUS=$(curl -s -X POST "$API_URL/api/buses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "bus_number":"BUS006",
    "license_plate":"59A-12345",
    "capacity":50,
    "model":"Hyundai County",
    "year":2023,
    "status":"active",
    "last_maintenance_date":"2025-09-15",
    "next_maintenance_date":"2025-12-15"
  }')

BUS_ID=$(echo $CREATE_BUS | grep -o '"bus_id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$BUS_ID" ]; then
  echo -e "${GREEN}✅ VỀ ĐỀ - ID Xe: $BUS_ID${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $CREATE_BUS"
  ((FAILED++))
fi

# Kiểm tra 3: Tạo xe buýt thứ hai
echo -e "\n${YELLOW}KIỂM TRA 3: Tạo Xe Buýt - BUS007${NC}"
CREATE_BUS2=$(curl -s -X POST "$API_URL/api/buses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "bus_number":"BUS007",
    "license_plate":"59A-54321",
    "capacity":45,
    "model":"Thaco TB120S",
    "year":2022,
    "status":"active",
    "last_maintenance_date":"2025-08-20",
    "next_maintenance_date":"2025-11-20"
  }')

BUS_ID_2=$(echo $CREATE_BUS2 | grep -o '"bus_id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$BUS_ID_2" ]; then
  echo -e "${GREEN}✅ VỀ ĐỀ - ID Xe: $BUS_ID_2${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $CREATE_BUS2"
  ((FAILED++))
fi

# Kiểm tra 4: Lấy xe buýt theo ID
echo -e "\n${YELLOW}KIỂM TRA 4: Lấy Xe Buýt Theo ID${NC}"
GET_BUS=$(curl -s -X GET "$API_URL/api/buses/$BUS_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $GET_BUS | grep -q "$BUS_ID"; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $GET_BUS"
  ((FAILED++))
fi

# Kiểm tra 5: Lấy tất cả xe buýt (sau khi tạo)
echo -e "\n${YELLOW}KIỂM TRA 5: Lấy Tất Cả Xe Buýt (Sau Khi Tạo)${NC}"
ALL_BUSES=$(curl -s -X GET "$API_URL/api/buses?limit=10&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $ALL_BUSES | grep -q '"pagination"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $ALL_BUSES"
  ((FAILED++))
fi

# Kiểm tra 6: Lọc xe buýt theo trạng thái
echo -e "\n${YELLOW}KIỂM TRA 6: Lọc Xe Buýt Theo Trạng Thái${NC}"
FILTER_STATUS=$(curl -s -X GET "$API_URL/api/buses?status=active" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $FILTER_STATUS | grep -q '"data"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $FILTER_STATUS"
  ((FAILED++))
fi

# Kiểm tra 7: Tìm kiếm xe buýt theo số hiệu
echo -e "\n${YELLOW}KIỂM TRA 7: Tìm Kiếm Xe Buýt Theo Số Hiệu${NC}"
SEARCH_BUS=$(curl -s -X GET "$API_URL/api/buses?search=BUS006" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $SEARCH_BUS | grep -q '"bus_number"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $SEARCH_BUS"
  ((FAILED++))
fi

# Kiểm tra 8: Cập nhật thông tin xe buýt
echo -e "\n${YELLOW}KIỂM TRA 8: Cập Nhật Thông Tin Xe Buýt${NC}"
UPDATE_BUS=$(curl -s -X PUT "$API_URL/api/buses/$BUS_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "capacity":55,
    "model":"Hyundai County XL",
    "year":2024,
    "last_maintenance_date":"2025-10-01"
  }')

if echo $UPDATE_BUS | grep -q '"success"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $UPDATE_BUS"
  ((FAILED++))
fi

# Kiểm tra 9: Cập nhật trạng thái xe buýt
echo -e "\n${YELLOW}KIỂM TRA 9: Cập Nhật Trạng Thái Xe Buýt${NC}"
UPDATE_STATUS=$(curl -s -X PUT "$API_URL/api/buses/$BUS_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"maintenance"}')

if echo $UPDATE_STATUS | grep -q '"success"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $UPDATE_STATUS"
  ((FAILED++))
fi

# Kiểm tra 10: Lấy lịch trình của xe buýt
echo -e "\n${YELLOW}KIỂM TRA 10: Lấy Lịch Trình Của Xe Buýt${NC}"
BUS_SCHEDULES=$(curl -s -X GET "$API_URL/api/buses/$BUS_ID/schedules" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $BUS_SCHEDULES | grep -q '"success"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $BUS_SCHEDULES"
  ((FAILED++))
fi

# Kiểm tra 11: Lấy xe buýt có sẵn
echo -e "\n${YELLOW}KIỂM TRA 11: Lấy Xe Buýt Có Sẵn${NC}"
AVAILABLE=$(curl -s -X GET "$API_URL/api/buses/available" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $AVAILABLE | grep -q '"success"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $AVAILABLE"
  ((FAILED++))
fi

# Kiểm tra 12: Tìm kiếm theo biển số xe
echo -e "\n${YELLOW}KIỂM TRA 12: Tìm Kiếm Theo Biển Số Xe${NC}"
SEARCH_PLATE=$(curl -s -X GET "$API_URL/api/buses?search=59A-12345" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $SEARCH_PLATE | grep -q '"license_plate"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $SEARCH_PLATE"
  ((FAILED++))
fi

# Kiểm tra 13: Xóa xe buýt
echo -e "\n${YELLOW}KIỂM TRA 13: Xóa Xe Buýt${NC}"
DELETE_BUS=$(curl -s -X DELETE "$API_URL/api/buses/$BUS_ID_2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $DELETE_BUS | grep -q '"success"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $DELETE_BUS"
  ((FAILED++))
fi

# Kiểm tra 14: Xác minh xe buýt đã xóa không tìm thấy
echo -e "\n${YELLOW}KIỂM TRA 14: Xác Minh Xe Buýt Đã Xóa Không Tìm Thấy${NC}"
VERIFY_DELETE=$(curl -s -X GET "$API_URL/api/buses/$BUS_ID_2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $VERIFY_DELETE | grep -q '"error"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $VERIFY_DELETE"
  ((FAILED++))
fi

# Kiểm tra 15: Ngăn chặn số xe trùng lặp
echo -e "\n${YELLOW}KIỂM TRA 15: Ngăn Chặn Số Xe Trùng Lặp${NC}"
DUP_BUS_NUMBER=$(curl -s -X POST "$API_URL/api/buses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "bus_number":"BUS006",
    "license_plate":"59A-99999",
    "capacity":45,
    "model":"Test Bus",
    "year":2023,
    "status":"active"
  }')

if echo $DUP_BUS_NUMBER | grep -q '"error"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $DUP_BUS_NUMBER"
  ((FAILED++))
fi

# Kiểm tra 16: Ngăn chặn biển số xe trùng lặp
echo -e "\n${YELLOW}KIỂM TRA 16: Ngăn Chặn Biển Số Xe Trùng Lặp${NC}"
DUP_PLATE=$(curl -s -X POST "$API_URL/api/buses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "bus_number":"BUS008",
    "license_plate":"59A-12345",
    "capacity":45,
    "model":"Test Bus",
    "year":2023,
    "status":"active"
  }')

if echo $DUP_PLATE | grep -q '"error"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $DUP_PLATE"
  ((FAILED++))
fi

# In tóm tắt kết quả
echo -e "\n==========================================="
echo "🧪 TÓM TẮT KẾT QUẢ KIỂM TRA"
echo "==========================================="
echo -e "${GREEN}✅ Kiểm Tra VỀ Đề: $PASSED${NC}"
echo -e "${RED}❌ Kiểm Tra Không VỀ Đề: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
  PASS_RATE=$((PASSED * 100 / TOTAL))
  echo "📊 Tỷ Lệ VỀ Đề: $PASS_RATE% ($PASSED/$TOTAL)"
fi
echo "==========================================="

# Thoát với mã thích hợp
if [ $FAILED -eq 0 ]; then
  exit 0
else
  exit 1
fi
