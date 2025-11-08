#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🧪 AUTH MODULE TESTING"
echo "=========================================="

API_URL="http://localhost:5000"

# Test 1: Health Check
echo -e "\n${YELLOW}TEST 1: Health Check${NC}"
curl -s -X GET "$API_URL/health" | grep -q "success" && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}"

# Test 2: Login - Admin
echo -e "\n${YELLOW}TEST 2: Admin Login${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ssb.com","password":"Admin@123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "Token: $TOKEN"
  ADMIN_TOKEN=$TOKEN
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi

# Test 3: Login - Driver
echo -e "\n${YELLOW}TEST 3: Driver Login${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"driver1@ssb.com","password":"Admin@123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✅ PASSED${NC}"
  DRIVER_TOKEN=$TOKEN
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi

# Test 4: Login - Parent
echo -e "\n${YELLOW}TEST 4: Parent Login${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"parent1@ssb.com","password":"Admin@123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✅ PASSED${NC}"
  PARENT_TOKEN=$TOKEN
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi

# Test 5: Get Me - With Valid Token
echo -e "\n${YELLOW}TEST 5: Get Current User (Admin)${NC}"
if [ ! -z "$ADMIN_TOKEN" ]; then
  curl -s -X GET "$API_URL/api/auth/me" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | grep -q "admin@ssb.com" && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}"
fi

# Test 6: Invalid Credentials
echo -e "\n${YELLOW}TEST 6: Invalid Credentials${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ssb.com","password":"WrongPassword"}')

echo $RESPONSE | grep -q "Invalid" && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}"

# Test 7: Missing Email
echo -e "\n${YELLOW}TEST 7: Missing Email${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"password":"Admin@123"}')

echo $RESPONSE | grep -q "required\|error" && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}"

# Test 8: Missing Password
echo -e "\n${YELLOW}TEST 8: Missing Password${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ssb.com"}')

echo $RESPONSE | grep -q "required\|error" && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}"

# Test 9: Invalid Email Format
echo -e "\n${YELLOW}TEST 9: Invalid Email Format${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","password":"Admin@123"}')

echo $RESPONSE | grep -q "Invalid\|error" && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}"

# Test 10: No Token in Request
echo -e "\n${YELLOW}TEST 10: No Token Access (Should Fail)${NC}"
curl -s -X GET "$API_URL/api/auth/me" | grep -q "Unauthorized\|error" && echo -e "${GREEN}✅ PASSED${NC}" || echo -e "${RED}❌ FAILED${NC}"

echo -e "\n=========================================="
echo "🧪 AUTH TESTING COMPLETE"
echo "=========================================="
