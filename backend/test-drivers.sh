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
echo "🚗 DRIVER MANAGEMENT MODULE TESTING"
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

# Test 1: Get all drivers (before creation)
echo -e "\n${YELLOW}TEST 1: Get All Drivers (Before Creation)${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/drivers" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $RESPONSE | grep -q '"data"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
  ((FAILED++))
fi

# Test 2: Create first driver
echo -e "\n${YELLOW}TEST 2: Create Driver - driver2@ssb.com${NC}"
CREATE_DRIVER=$(curl -s -X POST "$API_URL/api/drivers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email":"driver2@ssb.com",
    "password":"Driver@123",
    "full_name":"Nguyễn Văn B",
    "phone":"0987654322",
    "license_number":"DL002",
    "license_expiry":"2026-12-31",
    "address":"456 Lê Lợi St, HCMC",
    "emergency_contact":"0987654321"
  }')

DRIVER_ID=$(echo $CREATE_DRIVER | grep -o '"driver_id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$DRIVER_ID" ]; then
  echo -e "${GREEN}✅ PASSED - Driver ID: $DRIVER_ID${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $CREATE_DRIVER"
  ((FAILED++))
fi

# Test 3: Create second driver
echo -e "\n${YELLOW}TEST 3: Create Driver - driver3@ssb.com${NC}"
CREATE_DRIVER2=$(curl -s -X POST "$API_URL/api/drivers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email":"driver3@ssb.com",
    "password":"Driver@123",
    "full_name":"Trần Thị C",
    "phone":"0987654323",
    "license_number":"DL003",
    "license_expiry":"2025-06-30",
    "address":"789 Nguyễn Hue St, HCMC",
    "emergency_contact":"0987654322"
  }')

DRIVER_ID_2=$(echo $CREATE_DRIVER2 | grep -o '"driver_id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$DRIVER_ID_2" ]; then
  echo -e "${GREEN}✅ PASSED - Driver ID: $DRIVER_ID_2${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $CREATE_DRIVER2"
  ((FAILED++))
fi

# Test 4: Get driver by ID
echo -e "\n${YELLOW}TEST 4: Get Driver By ID${NC}"
GET_DRIVER=$(curl -s -X GET "$API_URL/api/drivers/$DRIVER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $GET_DRIVER | grep -q "$DRIVER_ID"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $GET_DRIVER"
  ((FAILED++))
fi

# Test 5: Get all drivers (after creation)
echo -e "\n${YELLOW}TEST 5: Get All Drivers (After Creation)${NC}"
ALL_DRIVERS=$(curl -s -X GET "$API_URL/api/drivers?limit=10&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $ALL_DRIVERS | grep -q '"pagination"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $ALL_DRIVERS"
  ((FAILED++))
fi

# Test 6: Get drivers by status filter
echo -e "\n${YELLOW}TEST 6: Filter Drivers by Status${NC}"
FILTER_STATUS=$(curl -s -X GET "$API_URL/api/drivers?status=available" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $FILTER_STATUS | grep -q '"data"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $FILTER_STATUS"
  ((FAILED++))
fi

# Test 7: Search drivers by name
echo -e "\n${YELLOW}TEST 7: Search Drivers by Name${NC}"
SEARCH_DRIVER=$(curl -s -X GET "$API_URL/api/drivers?search=Nguyễn" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $SEARCH_DRIVER | grep -q '"full_name"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $SEARCH_DRIVER"
  ((FAILED++))
fi

# Test 8: Update driver information
echo -e "\n${YELLOW}TEST 8: Update Driver Information${NC}"
UPDATE_DRIVER=$(curl -s -X PUT "$API_URL/api/drivers/$DRIVER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "license_number":"DL002_UPDATED",
    "address":"New Address",
    "emergency_contact":"0987654320",
    "rating":4.5
  }')

if echo $UPDATE_DRIVER | grep -q '"success"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $UPDATE_DRIVER"
  ((FAILED++))
fi

# Test 9: Update driver status
echo -e "\n${YELLOW}TEST 9: Update Driver Status${NC}"
UPDATE_STATUS=$(curl -s -X PUT "$API_URL/api/drivers/$DRIVER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"on-leave"}')

if echo $UPDATE_STATUS | grep -q '"success"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $UPDATE_STATUS"
  ((FAILED++))
fi

# Test 10: Get driver schedules
echo -e "\n${YELLOW}TEST 10: Get Driver Schedules${NC}"
GET_SCHEDULES=$(curl -s -X GET "$API_URL/api/drivers/$DRIVER_ID/schedules" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $GET_SCHEDULES | grep -q '"success"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $GET_SCHEDULES"
  ((FAILED++))
fi

# Test 11: Get available drivers
echo -e "\n${YELLOW}TEST 11: Get Available Drivers${NC}"
AVAILABLE=$(curl -s -X GET "$API_URL/api/drivers/available" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $AVAILABLE | grep -q '"success"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $AVAILABLE"
  ((FAILED++))
fi

# Test 12: Delete driver
echo -e "\n${YELLOW}TEST 12: Delete Driver${NC}"
DELETE_DRIVER=$(curl -s -X DELETE "$API_URL/api/drivers/$DRIVER_ID_2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $DELETE_DRIVER | grep -q '"success"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $DELETE_DRIVER"
  ((FAILED++))
fi

# Test 13: Verify delete
echo -e "\n${YELLOW}TEST 13: Verify Deleted Driver Cannot Be Found${NC}"
VERIFY_DELETE=$(curl -s -X GET "$API_URL/api/drivers/$DRIVER_ID_2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $VERIFY_DELETE | grep -q '"error"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $VERIFY_DELETE"
  ((FAILED++))
fi

# Test 14: Duplicate license number validation
echo -e "\n${YELLOW}TEST 14: Prevent Duplicate License Number${NC}"
DUP_LICENSE=$(curl -s -X POST "$API_URL/api/drivers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email":"driverduplicate@ssb.com",
    "password":"Driver@123",
    "full_name":"Duplicate License",
    "phone":"0987654324",
    "license_number":"DL002_UPDATED",
    "license_expiry":"2026-12-31",
    "address":"Some Address",
    "emergency_contact":"0987654321"
  }')

if echo $DUP_LICENSE | grep -q '"error"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $DUP_LICENSE"
  ((FAILED++))
fi

# Test 15: Duplicate email validation
echo -e "\n${YELLOW}TEST 15: Prevent Duplicate Email${NC}"
DUP_EMAIL=$(curl -s -X POST "$API_URL/api/drivers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email":"driver2@ssb.com",
    "password":"Driver@123",
    "full_name":"Duplicate Email",
    "phone":"0987654325",
    "license_number":"DL100",
    "license_expiry":"2026-12-31",
    "address":"Some Address",
    "emergency_contact":"0987654321"
  }')

if echo $DUP_EMAIL | grep -q '"error"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $DUP_EMAIL"
  ((FAILED++))
fi

# Print summary
echo -e "\n==========================================="
echo "🧪 TEST RESULTS SUMMARY"
echo "==========================================="
echo -e "${GREEN}✅ Tests Passed: $PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
PASS_RATE=$((PASSED * 100 / TOTAL))
echo "📊 Pass Rate: $PASS_RATE% ($PASSED/$TOTAL)"
echo "==========================================="

# Exit with appropriate code
if [ $FAILED -eq 0 ]; then
  exit 0
else
  exit 1
fi
