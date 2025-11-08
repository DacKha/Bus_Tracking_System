#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

echo "==========================================="
echo "👨‍🎓 STUDENT MANAGEMENT MODULE TESTING"
echo "==========================================="

API_URL="http://localhost:5000"

# First, get admin token for all operations
echo -e "\n${BLUE}🔑 Getting Admin Token${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ssb.com","password":"Admin@123"}')

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✅ Got Admin Token${NC}"
else
  echo -e "${RED}❌ Failed to get Admin Token${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

# Test 1: Get all students (before creation)
echo -e "\n${YELLOW}TEST 1: Get All Students (Before Creation)${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/students" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $RESPONSE | grep -q '"data"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
  ((FAILED++))
fi

# Test 2: Create first student
echo -e "\n${YELLOW}TEST 2: Create Student - linked to parent 1${NC}"
CREATE_STUDENT=$(curl -s -X POST "$API_URL/api/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "parent_id":1,
    "full_name":"Phạm Minh An",
    "date_of_birth":"2015-05-15",
    "gender":"male",
    "grade":"10",
    "class":"10A1",
    "student_code":"STU001",
    "pickup_address":"123 Nguyễn Hữu Cảnh, HCMC",
    "pickup_latitude":10.8141,
    "pickup_longitude":106.7295,
    "dropoff_address":"School Campus, HCMC",
    "dropoff_latitude":10.8200,
    "dropoff_longitude":106.7350,
    "special_needs":"None"
  }')

STUDENT_ID=$(echo $CREATE_STUDENT | grep -o '"student_id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$STUDENT_ID" ]; then
  echo -e "${GREEN}✅ PASSED - Student ID: $STUDENT_ID${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $CREATE_STUDENT"
  ((FAILED++))
fi

# Test 3: Create second student with same parent
echo -e "\n${YELLOW}TEST 3: Create Second Student - linked to parent 1${NC}"
CREATE_STUDENT2=$(curl -s -X POST "$API_URL/api/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "parent_id":1,
    "full_name":"Phạm Minh Bảo",
    "date_of_birth":"2017-08-22",
    "gender":"female",
    "grade":"8",
    "class":"8A2",
    "student_code":"STU002",
    "pickup_address":"123 Nguyễn Hữu Cảnh, HCMC",
    "pickup_latitude":10.8141,
    "pickup_longitude":106.7295,
    "dropoff_address":"School Campus, HCMC",
    "dropoff_latitude":10.8200,
    "dropoff_longitude":106.7350,
    "special_needs":"None"
  }')

STUDENT_ID_2=$(echo $CREATE_STUDENT2 | grep -o '"student_id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$STUDENT_ID_2" ]; then
  echo -e "${GREEN}✅ PASSED - Student ID: $STUDENT_ID_2${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $CREATE_STUDENT2"
  ((FAILED++))
fi

# Test 4: Get student by ID
echo -e "\n${YELLOW}TEST 4: Get Student By ID${NC}"
GET_STUDENT=$(curl -s -X GET "$API_URL/api/students/$STUDENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $GET_STUDENT | grep -q "$STUDENT_ID"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $GET_STUDENT"
  ((FAILED++))
fi

# Test 5: Get all students (after creation)
echo -e "\n${YELLOW}TEST 5: Get All Students (After Creation)${NC}"
ALL_STUDENTS=$(curl -s -X GET "$API_URL/api/students?limit=10&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $ALL_STUDENTS | grep -q '"pagination"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $ALL_STUDENTS"
  ((FAILED++))
fi

# Test 6: Get students by parent
echo -e "\n${YELLOW}TEST 6: Get Students By Parent${NC}"
PARENT_STUDENTS=$(curl -s -X GET "$API_URL/api/students/parent/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $PARENT_STUDENTS | grep -q '"success"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $PARENT_STUDENTS"
  ((FAILED++))
fi

# Test 7: Filter students by grade
echo -e "\n${YELLOW}TEST 7: Filter Students by Grade${NC}"
FILTER_GRADE=$(curl -s -X GET "$API_URL/api/students?grade=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $FILTER_GRADE | grep -q '"data"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $FILTER_GRADE"
  ((FAILED++))
fi

# Test 8: Filter students by class
echo -e "\n${YELLOW}TEST 8: Filter Students by Class${NC}"
FILTER_CLASS=$(curl -s -X GET "$API_URL/api/students?class=10A1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $FILTER_CLASS | grep -q '"data"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $FILTER_CLASS"
  ((FAILED++))
fi

# Test 9: Search students by name
echo -e "\n${YELLOW}TEST 9: Search Students by Name${NC}"
SEARCH_STUDENT=$(curl -s -X GET "$API_URL/api/students?search=Phạm" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $SEARCH_STUDENT | grep -q '"full_name"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $SEARCH_STUDENT"
  ((FAILED++))
fi

# Test 10: Update student information
echo -e "\n${YELLOW}TEST 10: Update Student Information${NC}"
UPDATE_STUDENT=$(curl -s -X PUT "$API_URL/api/students/$STUDENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "grade":"11",
    "class":"11A1",
    "special_needs":"Math support needed"
  }')

if echo $UPDATE_STUDENT | grep -q '"success"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $UPDATE_STUDENT"
  ((FAILED++))
fi

# Test 11: Create student with invalid parent (should fail)
echo -e "\n${YELLOW}TEST 11: Prevent Student Creation with Invalid Parent${NC}"
INVALID_PARENT=$(curl -s -X POST "$API_URL/api/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "parent_id":9999,
    "full_name":"Test Student",
    "date_of_birth":"2015-05-15",
    "gender":"male",
    "grade":"10",
    "class":"10A1",
    "student_code":"STU003",
    "pickup_address":"Test Address"
  }')

if echo $INVALID_PARENT | grep -q '"error"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $INVALID_PARENT"
  ((FAILED++))
fi

# Test 12: Duplicate student code validation
echo -e "\n${YELLOW}TEST 12: Prevent Duplicate Student Code${NC}"
DUP_CODE=$(curl -s -X POST "$API_URL/api/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "parent_id":2,
    "full_name":"Another Student",
    "date_of_birth":"2016-03-10",
    "gender":"male",
    "grade":"9",
    "class":"9B1",
    "student_code":"STU001",
    "pickup_address":"Some Address"
  }')

if echo $DUP_CODE | grep -q '"error"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $DUP_CODE"
  ((FAILED++))
fi

# Test 13: Get student schedules
echo -e "\n${YELLOW}TEST 13: Get Student Schedules${NC}"
STUDENT_SCHEDULES=$(curl -s -X GET "$API_URL/api/students/$STUDENT_ID/schedules" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $STUDENT_SCHEDULES | grep -q '"success"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $STUDENT_SCHEDULES"
  ((FAILED++))
fi

# Test 14: Filter students by active status
echo -e "\n${YELLOW}TEST 14: Filter Students by Active Status${NC}"
FILTER_ACTIVE=$(curl -s -X GET "$API_URL/api/students?is_active=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $FILTER_ACTIVE | grep -q '"data"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $FILTER_ACTIVE"
  ((FAILED++))
fi

# Test 15: Delete student (soft delete)
echo -e "\n${YELLOW}TEST 15: Delete Student (Soft Delete)${NC}"
DELETE_STUDENT=$(curl -s -X DELETE "$API_URL/api/students/$STUDENT_ID_2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $DELETE_STUDENT | grep -q '"success"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $DELETE_STUDENT"
  ((FAILED++))
fi

# Test 16: Verify deleted student (soft delete shows as inactive)
echo -e "\n${YELLOW}TEST 16: Verify Soft Deleted Student${NC}"
VERIFY_DELETE=$(curl -s -X GET "$API_URL/api/students/$STUDENT_ID_2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $VERIFY_DELETE | grep -q '"is_active":false'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED (Not soft deleted)${NC}"
  echo "Response: $VERIFY_DELETE"
  ((FAILED++))
fi

# Print summary
echo -e "\n==========================================="
echo "🧪 TEST RESULTS SUMMARY"
echo "==========================================="
echo -e "${GREEN}✅ Tests Passed: $PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
  PASS_RATE=$((PASSED * 100 / TOTAL))
  echo "📊 Pass Rate: $PASS_RATE% ($PASSED/$TOTAL)"
fi
echo "==========================================="

# Exit with appropriate code
if [ $FAILED -eq 0 ]; then
  exit 0
else
  exit 1
fi
