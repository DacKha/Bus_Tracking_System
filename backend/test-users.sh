#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000/api"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNzYi5jb20iLCJpYXQiOjE3NjEwMjA3NDUsImV4cCI6MTc2MTEwNzE0NX0.1HQrnNh-SqslTP7lrURsutLLk4YJAGZeco_ni8J6a8Y"

TESTS_PASSED=0
TESTS_FAILED=0

echo "=========================================="
echo "🧪 USER MANAGEMENT API TESTING"
echo "=========================================="

# Test 1: Get all users
echo -e "\n${YELLOW}TEST 1: Get All Users (Paginated)${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/users?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $RESPONSE | grep -q '"data"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  ((TESTS_FAILED++))
fi

# Test 2: Get all users with filter
echo -e "\n${YELLOW}TEST 2: Get All Users - Filter by Type${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/users?type=admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $RESPONSE | grep -q '"data"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  ((TESTS_FAILED++))
fi

# Test 3: Search users
echo -e "\n${YELLOW}TEST 3: Search Users${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/users/search?q=admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $RESPONSE | grep -q "admin"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  ((TESTS_FAILED++))
fi

# Test 4: Get single user
echo -e "\n${YELLOW}TEST 4: Get User by ID${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/users/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $RESPONSE | grep -q '"user_id"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  ((TESTS_FAILED++))
fi

# Test 5: Get non-existent user
echo -e "\n${YELLOW}TEST 5: Get Non-existent User (404)${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/users/99999" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $RESPONSE | grep -q "error\|not found"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  ((TESTS_FAILED++))
fi

# Test 6: Create new user
echo -e "\n${YELLOW}TEST 6: Create New User${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser'$(date +%s)'@ssb.com",
    "password": "TestPass123",
    "full_name": "Test User",
    "phone": "0901234567",
    "user_type": "parent"
  }')

if echo $RESPONSE | grep -q '"user_id"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((TESTS_PASSED++))
  # Extract user ID for later tests
  NEW_USER_ID=$(echo $RESPONSE | grep -o '"user_id":[0-9]*' | grep -o '[0-9]*')
else
  echo -e "${RED}❌ FAILED${NC}"
  ((TESTS_FAILED++))
  echo "Response: $RESPONSE"
fi

# Test 7: Create with duplicate email
echo -e "\n${YELLOW}TEST 7: Create User - Duplicate Email${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ssb.com",
    "password": "TestPass123",
    "full_name": "Duplicate User",
    "phone": "0901234567",
    "user_type": "parent"
  }')

if echo $RESPONSE | grep -q "error\|already exists"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  ((TESTS_FAILED++))
fi

# Test 8: Create with missing fields
echo -e "\n${YELLOW}TEST 8: Create User - Missing Email${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "TestPass123",
    "full_name": "Test User",
    "user_type": "parent"
  }')

if echo $RESPONSE | grep -q "error\|required"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  ((TESTS_FAILED++))
fi

# Test 9: Update user
echo -e "\n${YELLOW}TEST 9: Update User${NC}"
if [ ! -z "$NEW_USER_ID" ]; then
  RESPONSE=$(curl -s -X PUT "$API_URL/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "full_name": "Updated Test User",
      "phone": "0909999999"
    }')

  if echo $RESPONSE | grep -q "Updated Test User\|success"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAILED${NC}"
    ((TESTS_FAILED++))
  fi
else
  echo -e "${YELLOW}⊘ SKIPPED${NC} (No user created)"
fi

# Test 10: Delete user
echo -e "\n${YELLOW}TEST 10: Delete User${NC}"
if [ ! -z "$NEW_USER_ID" ]; then
  RESPONSE=$(curl -s -X DELETE "$API_URL/users/$NEW_USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  if echo $RESPONSE | grep -q "success\|deleted"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}❌ FAILED${NC}"
    ((TESTS_FAILED++))
    echo "Response: $RESPONSE"
  fi
else
  echo -e "${YELLOW}⊘ SKIPPED${NC} (No user created)"
fi

# Test 11: Filter by active status
echo -e "\n${YELLOW}TEST 11: Get Users - Filter by Active${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/users?is_active=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo $RESPONSE | grep -q '"data"'; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  ((TESTS_FAILED++))
fi

# Test 12: No authorization
echo -e "\n${YELLOW}TEST 12: No Authorization (Should Fail)${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/users")

if echo $RESPONSE | grep -q "Unauthorized\|error"; then
  echo -e "${GREEN}✅ PASSED${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ FAILED${NC}"
  ((TESTS_FAILED++))
fi

echo -e "\n=========================================="
echo "📊 TEST RESULTS SUMMARY"
echo "=========================================="
echo -e "${BLUE}Total Tests: $((TESTS_PASSED + TESTS_FAILED))${NC}"
echo -e "${GREEN}Passed: $TESTS_PASSED ✅${NC}"
echo -e "${RED}Failed: $TESTS_FAILED ❌${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  PASS_RATE=100
else
  PASS_RATE=$((TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED)))
fi

echo -e "${BLUE}Pass Rate: $PASS_RATE%${NC}"

echo -e "\n=========================================="
echo "🧪 USER MANAGEMENT TESTING COMPLETE"
echo "=========================================="

exit $TESTS_FAILED
