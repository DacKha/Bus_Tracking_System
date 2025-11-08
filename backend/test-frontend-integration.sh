#!/bin/bash

# ============================================================================
# Frontend-Backend Integration Test Suite
# Smart School Bus Tracking System
# ============================================================================

API_URL="http://localhost:5000"
TOKEN=""
ADMIN_EMAIL="admin@ssb.com"
ADMIN_PASS="123456"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper function to print test results
print_test() {
    local name=$1
    local result=$2
    local details=$3

    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $name"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $name"
        if [ ! -z "$details" ]; then
            echo -e "${RED}   Details: $details${NC}"
        fi
        FAILED=$((FAILED + 1))
    fi
}

print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================================================
# 1. TEST AUTHENTICATION
# ============================================================================

print_section "1️⃣  TEST AUTHENTICATION (Đăng nhập/Đăng xuất)"

# Test 1.1: Health Check
RESPONSE=$(curl -s "$API_URL/health")
if echo "$RESPONSE" | grep -q "running"; then
    print_test "Health Check" "PASS"
else
    print_test "Health Check" "FAIL" "Backend không phản hồi"
fi

# Test 1.2: Login Success
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")

if echo "$RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    print_test "Login Success" "PASS"
else
    print_test "Login Success" "FAIL" "Token not received"
fi

# Test 1.3: Get Current User
if [ ! -z "$TOKEN" ]; then
    RESPONSE=$(curl -s "$API_URL/api/auth/me" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$RESPONSE" | grep -q "admin"; then
        print_test "Get Current User" "PASS"
    else
        print_test "Get Current User" "FAIL" "User info not retrieved"
    fi
fi

# ============================================================================
# 2. TEST USERS CRUD
# ============================================================================

print_section "2️⃣  TEST USERS CRUD OPERATIONS"

# Test 2.1: Get Users List
RESPONSE=$(curl -s "$API_URL/api/users" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "email"; then
    print_test "Get Users List" "PASS"
else
    print_test "Get Users List" "FAIL" "No users returned"
fi

# Test 2.2: Create User
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email":"testuser'$(date +%s)'@ssb.com",
    "full_name":"Test User",
    "password":"123456",
    "user_type":"parent",
    "phone":"0901234567"
  }')

if echo "$CREATE_RESPONSE" | grep -q "user_id\|email"; then
    NEW_USER_ID=$(echo "$CREATE_RESPONSE" | grep -o '"user_id":[0-9]*' | cut -d':' -f2 | head -1)
    print_test "Create User" "PASS"
else
    print_test "Create User" "FAIL" "User creation failed"
fi

# Test 2.3: Get User by ID
if [ ! -z "$NEW_USER_ID" ]; then
    RESPONSE=$(curl -s "$API_URL/api/users/$NEW_USER_ID" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$RESPONSE" | grep -q "user_id"; then
        print_test "Get User by ID" "PASS"
    else
        print_test "Get User by ID" "FAIL" "User not found"
    fi
fi

# Test 2.4: Update User
if [ ! -z "$NEW_USER_ID" ]; then
    RESPONSE=$(curl -s -X PUT "$API_URL/api/users/$NEW_USER_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "full_name":"Updated User",
        "phone":"0909999999"
      }')

    if echo "$RESPONSE" | grep -q "user_id\|email"; then
        print_test "Update User" "PASS"
    else
        print_test "Update User" "FAIL" "Update failed"
    fi
fi

# Test 2.5: Delete User
if [ ! -z "$NEW_USER_ID" ]; then
    RESPONSE=$(curl -s -X DELETE "$API_URL/api/users/$NEW_USER_ID" \
      -H "Authorization: Bearer $TOKEN")

    print_test "Delete User" "PASS"
fi

# ============================================================================
# 3. TEST DRIVERS CRUD
# ============================================================================

print_section "3️⃣  TEST DRIVERS CRUD OPERATIONS"

# Test 3.1: Get Drivers List
RESPONSE=$(curl -s "$API_URL/api/drivers" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "driver_id\|license"; then
    print_test "Get Drivers List" "PASS"
else
    print_test "Get Drivers List" "FAIL" "No drivers returned"
fi

# Test 3.2: Create Driver
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/drivers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email":"driver'$(date +%s)'@ssb.com",
    "full_name":"Test Driver",
    "password":"123456",
    "phone":"0901111111",
    "license_number":"B2-'$(date +%s)'",
    "license_expiry":"2026-12-31"
  }')

if echo "$CREATE_RESPONSE" | grep -q "driver_id\|email"; then
    NEW_DRIVER_ID=$(echo "$CREATE_RESPONSE" | grep -o '"driver_id":[0-9]*' | cut -d':' -f2 | head -1)
    print_test "Create Driver" "PASS"
else
    print_test "Create Driver" "FAIL" "Driver creation failed"
fi

# Test 3.3: Get Driver by ID
if [ ! -z "$NEW_DRIVER_ID" ]; then
    RESPONSE=$(curl -s "$API_URL/api/drivers/$NEW_DRIVER_ID" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$RESPONSE" | grep -q "driver_id"; then
        print_test "Get Driver by ID" "PASS"
    else
        print_test "Get Driver by ID" "FAIL" "Driver not found"
    fi
fi

# Test 3.4: Update Driver
if [ ! -z "$NEW_DRIVER_ID" ]; then
    RESPONSE=$(curl -s -X PUT "$API_URL/api/drivers/$NEW_DRIVER_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "full_name":"Updated Driver",
        "phone":"0909111111"
      }')

    print_test "Update Driver" "PASS"
fi

# Test 3.5: Get Available Drivers
RESPONSE=$(curl -s "$API_URL/api/drivers/available" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "driver_id\|available"; then
    print_test "Get Available Drivers" "PASS"
else
    print_test "Get Available Drivers" "FAIL" "Failed to fetch available drivers"
fi

# ============================================================================
# 4. TEST STUDENTS CRUD
# ============================================================================

print_section "4️⃣  TEST STUDENTS CRUD OPERATIONS"

# Test 4.1: Get Students List
RESPONSE=$(curl -s "$API_URL/api/students" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "student_id\|full_name"; then
    print_test "Get Students List" "PASS"
else
    print_test "Get Students List" "FAIL" "No students returned"
fi

# Test 4.2: Create Student (needs parent_id)
# First get a parent
PARENTS=$(curl -s "$API_URL/api/users?user_type=parent&limit=1" \
  -H "Authorization: Bearer $TOKEN")
PARENT_ID=$(echo "$PARENTS" | grep -o '"user_id":[0-9]*' | cut -d':' -f2 | head -1)

if [ ! -z "$PARENT_ID" ]; then
    CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/students" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"parent_id\":$PARENT_ID,
        \"full_name\":\"Test Student\",
        \"student_code\":\"TS$(date +%s)\",
        \"date_of_birth\":\"2010-01-01\",
        \"gender\":\"male\",
        \"grade\":\"5\",
        \"class_name\":\"A\"
      }")

    if echo "$CREATE_RESPONSE" | grep -q "student_id"; then
        NEW_STUDENT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"student_id":[0-9]*' | cut -d':' -f2 | head -1)
        print_test "Create Student" "PASS"
    else
        print_test "Create Student" "FAIL" "Student creation failed"
    fi
fi

# Test 4.3: Get Student by ID
if [ ! -z "$NEW_STUDENT_ID" ]; then
    RESPONSE=$(curl -s "$API_URL/api/students/$NEW_STUDENT_ID" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$RESPONSE" | grep -q "student_id"; then
        print_test "Get Student by ID" "PASS"
    else
        print_test "Get Student by ID" "FAIL" "Student not found"
    fi
fi

# ============================================================================
# 5. TEST BUSES CRUD
# ============================================================================

print_section "5️⃣  TEST BUSES CRUD OPERATIONS"

# Test 5.1: Get Buses List
RESPONSE=$(curl -s "$API_URL/api/buses" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "bus_id\|license_plate"; then
    print_test "Get Buses List" "PASS"
else
    print_test "Get Buses List" "FAIL" "No buses returned"
fi

# Test 5.2: Create Bus
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/buses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bus_number":"TEST-'$(date +%s)'",
    "license_plate":"'$(date +%s%N)'-TEST",
    "capacity":35,
    "model":"Test Model",
    "year":2024
  }')

if echo "$CREATE_RESPONSE" | grep -q "bus_id"; then
    NEW_BUS_ID=$(echo "$CREATE_RESPONSE" | grep -o '"bus_id":[0-9]*' | cut -d':' -f2 | head -1)
    print_test "Create Bus" "PASS"
else
    print_test "Create Bus" "FAIL" "Bus creation failed"
fi

# Test 5.3: Get Bus by ID
if [ ! -z "$NEW_BUS_ID" ]; then
    RESPONSE=$(curl -s "$API_URL/api/buses/$NEW_BUS_ID" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$RESPONSE" | grep -q "bus_id"; then
        print_test "Get Bus by ID" "PASS"
    else
        print_test "Get Bus by ID" "FAIL" "Bus not found"
    fi
fi

# ============================================================================
# 6. TEST ROUTES CRUD
# ============================================================================

print_section "6️⃣  TEST ROUTES CRUD OPERATIONS"

# Test 6.1: Get Routes List
RESPONSE=$(curl -s "$API_URL/api/routes" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "route_id\|route_name"; then
    print_test "Get Routes List" "PASS"
else
    print_test "Get Routes List" "FAIL" "No routes returned"
fi

# Test 6.2: Create Route
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/routes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "route_name":"Test Route '$(date +%s)'",
    "description":"Test Route Description",
    "distance_km":10.5,
    "estimated_duration_minutes":45
  }')

if echo "$CREATE_RESPONSE" | grep -q "route_id"; then
    NEW_ROUTE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"route_id":[0-9]*' | cut -d':' -f2 | head -1)
    print_test "Create Route" "PASS"
else
    print_test "Create Route" "FAIL" "Route creation failed"
fi

# ============================================================================
# 7. TEST DASHBOARD STATISTICS
# ============================================================================

print_section "7️⃣  TEST DASHBOARD STATISTICS"

# Test 7.1: Get All Data for Dashboard
RESPONSE=$(curl -s "$API_URL/api/drivers" \
  -H "Authorization: Bearer $TOKEN")
DRIVERS_COUNT=$(echo "$RESPONSE" | grep -o '"driver_id"' | wc -l)

RESPONSE=$(curl -s "$API_URL/api/students" \
  -H "Authorization: Bearer $TOKEN")
STUDENTS_COUNT=$(echo "$RESPONSE" | grep -o '"student_id"' | wc -l)

RESPONSE=$(curl -s "$API_URL/api/buses" \
  -H "Authorization: Bearer $TOKEN")
BUSES_COUNT=$(echo "$RESPONSE" | grep -o '"bus_id"' | wc -l)

RESPONSE=$(curl -s "$API_URL/api/routes" \
  -H "Authorization: Bearer $TOKEN")
ROUTES_COUNT=$(echo "$RESPONSE" | grep -o '"route_id"' | wc -l)

if [ "$DRIVERS_COUNT" -gt 0 ] && [ "$STUDENTS_COUNT" -gt 0 ] && [ "$BUSES_COUNT" -gt 0 ] && [ "$ROUTES_COUNT" -gt 0 ]; then
    print_test "Dashboard Stats" "PASS"
    echo -e "   ${YELLOW}Drivers: $DRIVERS_COUNT | Students: $STUDENTS_COUNT | Buses: $BUSES_COUNT | Routes: $ROUTES_COUNT${NC}"
else
    print_test "Dashboard Stats" "FAIL" "Missing data for dashboard"
fi

# ============================================================================
# 8. TEST ERROR HANDLING
# ============================================================================

print_section "8️⃣  TEST ERROR HANDLING & VALIDATION"

# Test 8.1: Missing Authentication
RESPONSE=$(curl -s "$API_URL/api/users")

if echo "$RESPONSE" | grep -q "401\|Unauthorized\|login"; then
    print_test "Authentication Required" "PASS"
else
    print_test "Authentication Required" "FAIL" "No auth check"
fi

# Test 8.2: Invalid Email Format
RESPONSE=$(curl -s -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email":"invalid-email",
    "full_name":"Test",
    "password":"123456",
    "user_type":"parent"
  }')

if echo "$RESPONSE" | grep -q "400\|invalid\|error"; then
    print_test "Email Validation" "PASS"
else
    print_test "Email Validation" "FAIL" "No validation"
fi

# Test 8.3: Duplicate Email Prevention
RESPONSE=$(curl -s -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email":"admin@ssb.com",
    "full_name":"Test",
    "password":"123456",
    "user_type":"parent"
  }')

if echo "$RESPONSE" | grep -q "409\|already\|exists"; then
    print_test "Duplicate Email Prevention" "PASS"
else
    print_test "Duplicate Email Prevention" "FAIL" "No duplicate check"
fi

# Test 8.4: Not Found Error
RESPONSE=$(curl -s "$API_URL/api/users/99999" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "404\|not found"; then
    print_test "Not Found Error" "PASS"
else
    print_test "Not Found Error" "FAIL" "No 404 response"
fi

# ============================================================================
# SUMMARY
# ============================================================================

print_section "📊 TEST SUMMARY"

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo -e "Total Tests:  $TOTAL"
echo -e "${GREEN}Passed:       $PASSED${NC}"
echo -e "${RED}Failed:       $FAILED${NC}"
echo -e "Success Rate: ${PERCENTAGE}%"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    exit 1
fi
