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
echo "🛣️  KIỂM TRA MODULE QUẢN LÝ TUYẾN ĐƯỜNG"
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

# Kiểm tra 1: Lấy tất cả tuyến đường (trước khi tạo)
echo -e "\n${YELLOW}KIỂM TRA 1: Lấy Tất Cả Tuyến Đường (Trước Khi Tạo)${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/routes" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $RESPONSE | grep -q '"data"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $RESPONSE"
  ((FAILED++))
fi

# Kiểm tra 2: Tạo tuyến đường thứ nhất
echo -e "\n${YELLOW}KIỂM TRA 2: Tạo Tuyến Đường - Tuyến A${NC}"
CREATE_ROUTE=$(curl -s -X POST "$API_URL/api/routes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "route_name":"Tuyến Đường A Sáng",
    "route_code":"ROUTE_A_MN",
    "description":"Tuyến đường chiều sáng từ Q1 tới trường",
    "distance_km":25,
    "estimated_duration":45,
    "status":"active"
  }')

ROUTE_ID=$(echo $CREATE_ROUTE | grep -o '"route_id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$ROUTE_ID" ]; then
  echo -e "${GREEN}✅ VỀ ĐỀ - ID Tuyến: $ROUTE_ID${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $CREATE_ROUTE"
  ((FAILED++))
fi

# Kiểm tra 3: Tạo tuyến đường thứ hai
echo -e "\n${YELLOW}KIỂM TRA 3: Tạo Tuyến Đường - Tuyến B${NC}"
CREATE_ROUTE2=$(curl -s -X POST "$API_URL/api/routes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "route_name":"Tuyến Đường B Chiều",
    "route_code":"ROUTE_B_AF",
    "description":"Tuyến đường chiều chiều từ trường tới Q1",
    "distance_km":28,
    "estimated_duration":50,
    "status":"active"
  }')

ROUTE_ID_2=$(echo $CREATE_ROUTE2 | grep -o '"route_id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$ROUTE_ID_2" ]; then
  echo -e "${GREEN}✅ VỀ ĐỀ - ID Tuyến: $ROUTE_ID_2${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $CREATE_ROUTE2"
  ((FAILED++))
fi

# Kiểm tra 4: Lấy tuyến đường theo ID
echo -e "\n${YELLOW}KIỂM TRA 4: Lấy Tuyến Đường Theo ID${NC}"
GET_ROUTE=$(curl -s -X GET "$API_URL/api/routes/$ROUTE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $GET_ROUTE | grep -q "$ROUTE_ID"; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $GET_ROUTE"
  ((FAILED++))
fi

# Kiểm tra 5: Lấy tất cả tuyến đường (sau khi tạo)
echo -e "\n${YELLOW}KIỂM TRA 5: Lấy Tất Cả Tuyến Đường (Sau Khi Tạo)${NC}"
ALL_ROUTES=$(curl -s -X GET "$API_URL/api/routes?limit=10&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $ALL_ROUTES | grep -q '"pagination"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $ALL_ROUTES"
  ((FAILED++))
fi

# Kiểm tra 6: Lọc tuyến đường theo trạng thái
echo -e "\n${YELLOW}KIỂM TRA 6: Lọc Tuyến Đường Theo Trạng Thái${NC}"
FILTER_STATUS=$(curl -s -X GET "$API_URL/api/routes?status=active" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $FILTER_STATUS | grep -q '"data"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $FILTER_STATUS"
  ((FAILED++))
fi

# Kiểm tra 7: Tìm kiếm tuyến đường theo tên
echo -e "\n${YELLOW}KIỂM TRA 7: Tìm Kiếm Tuyến Đường Theo Tên${NC}"
SEARCH_ROUTE=$(curl -s -X GET "$API_URL/api/routes?search=Tuyến%20A" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $SEARCH_ROUTE | grep -q '"route_name"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $SEARCH_ROUTE"
  ((FAILED++))
fi

# Kiểm tra 8: Thêm điểm dừng vào tuyến đường
echo -e "\n${YELLOW}KIỂM TRA 8: Thêm Điểm Dừng Vào Tuyến Đường${NC}"
ADD_STOP=$(curl -s -X POST "$API_URL/api/routes/$ROUTE_ID/stops" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "stop_name":"Ga Tân Sơn Nhất",
    "stop_address":"1 Trường Sơn, Q.Tân Bình",
    "latitude":10.8141,
    "longitude":106.7295,
    "stop_order":1
  }')

if echo $ADD_STOP | grep -q '"stop_name"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $ADD_STOP"
  ((FAILED++))
fi

# Kiểm tra 9: Thêm điểm dừng thứ hai
echo -e "\n${YELLOW}KIỂM TRA 9: Thêm Điểm Dừng Thứ Hai${NC}"
ADD_STOP2=$(curl -s -X POST "$API_URL/api/routes/$ROUTE_ID/stops" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "stop_name":"Trung Tâm Thương Mại Diamond",
    "stop_address":"34 Lê Duẩn, Q.1",
    "latitude":10.8050,
    "longitude":106.7330,
    "stop_order":2
  }')

if echo $ADD_STOP2 | grep -q '"stop_name"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $ADD_STOP2"
  ((FAILED++))
fi

# Kiểm tra 10: Lấy các điểm dừng của tuyến đường
echo -e "\n${YELLOW}KIỂM TRA 10: Lấy Các Điểm Dừng Của Tuyến Đường${NC}"
GET_STOPS=$(curl -s -X GET "$API_URL/api/routes/$ROUTE_ID/stops" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $GET_STOPS | grep -q '"stop_name"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $GET_STOPS"
  ((FAILED++))
fi

# Kiểm tra 11: Cập nhật thông tin tuyến đường
echo -e "\n${YELLOW}KIỂM TRA 11: Cập Nhật Thông Tin Tuyến Đường${NC}"
UPDATE_ROUTE=$(curl -s -X PUT "$API_URL/api/routes/$ROUTE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "distance_km":27,
    "estimated_duration":48,
    "description":"Tuyến đường cập nhật"
  }')

if echo $UPDATE_ROUTE | grep -q '"success"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $UPDATE_ROUTE"
  ((FAILED++))
fi

# Kiểm tra 12: Lấy tuyến đường cùng với điểm dừng
echo -e "\n${YELLOW}KIỂM TRA 12: Lấy Tuyến Đường Cùng Với Điểm Dừng${NC}"
GET_WITH_STOPS=$(curl -s -X GET "$API_URL/api/routes/$ROUTE_ID?includeStops=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $GET_WITH_STOPS | grep -q '"route_name"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $GET_WITH_STOPS"
  ((FAILED++))
fi

# Kiểm tra 13: Ngăn chặn mã tuyến trùng lặp
echo -e "\n${YELLOW}KIỂM TRA 13: Ngăn Chặn Mã Tuyến Trùng Lặp${NC}"
DUP_CODE=$(curl -s -X POST "$API_URL/api/routes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "route_name":"Tuyến Trùng",
    "route_code":"ROUTE_A_MN",
    "description":"Tuyến trùng",
    "distance_km":20,
    "estimated_duration":40,
    "status":"active"
  }')

if echo $DUP_CODE | grep -q '"error"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $DUP_CODE"
  ((FAILED++))
fi

# Kiểm tra 14: Lấy lịch trình của tuyến đường
echo -e "\n${YELLOW}KIỂM TRA 14: Lấy Lịch Trình Của Tuyến Đường${NC}"
ROUTE_SCHEDULES=$(curl -s -X GET "$API_URL/api/routes/$ROUTE_ID/schedules" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $ROUTE_SCHEDULES | grep -q '"success"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $ROUTE_SCHEDULES"
  ((FAILED++))
fi

# Kiểm tra 15: Xóa tuyến đường
echo -e "\n${YELLOW}KIỂM TRA 15: Xóa Tuyến Đường${NC}"
DELETE_ROUTE=$(curl -s -X DELETE "$API_URL/api/routes/$ROUTE_ID_2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $DELETE_ROUTE | grep -q '"success"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $DELETE_ROUTE"
  ((FAILED++))
fi

# Kiểm tra 16: Xác minh tuyến đường đã xóa không tìm thấy
echo -e "\n${YELLOW}KIỂM TRA 16: Xác Minh Tuyến Đường Đã Xóa Không Tìm Thấy${NC}"
VERIFY_DELETE=$(curl -s -X GET "$API_URL/api/routes/$ROUTE_ID_2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $VERIFY_DELETE | grep -q '"error"'; then
  echo -e "${GREEN}✅ VỀ ĐỀ${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ KHÔNG VỀ ĐỀ${NC}"
  echo "Phản hồi: $VERIFY_DELETE"
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
