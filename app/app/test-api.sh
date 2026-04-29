#!/usr/bin/env bash
# White Day API Test Script
# Run: bash test-api.sh

BASE="http://localhost:3000/api/trpc"

echo "========================================"
echo "White Day API Test Script"
echo "========================================"
echo ""

# Test 1: Ping
echo "1. Testing ping..."
curl -s "$BASE/ping" | jq .
echo ""

# Test 2: List service types
echo "2. Testing service.listTypes..."
curl -s "$BASE/service.listTypes" | jq '.result.data.json | .[0:3]'
echo ""

# Test 3: Get wedding halls (typeId=1)
echo "3. Testing service.getByType (Wedding Halls)..."
curl -s "$BASE/service.getByType?input=%7B%22json%22%3A1%7D" | jq '.result.data.json | .[0:3]'
echo ""

# Test 4: Get service details (id=1)
echo "4. Testing service.getById (id=1)..."
curl -s "$BASE/service.getById?input=%7B%22json%22%3A1%7D" | jq '.result.data.json | {serviceId, sName, price, city, provider}'
echo ""

# Test 5: Search services
echo "5. Testing service.search (query=Rixos)..."
curl -s "$BASE/service.search?input=%7B%22json%22%3A%7B%22query%22%3A%22Rixos%22%7D%7D" | jq '.result.data.json'
echo ""

# Test 6: List providers
echo "6. Testing user.listProviders..."
curl -s "$BASE/user.listProviders" | jq '.result.data.json | .[0:3]'
echo ""

echo "========================================"
echo "Tests complete!"
echo ""
echo "Next: Try authentication with these commands:"
echo ""
echo "# Register a new user:"
echo "curl -X POST $BASE/auth.register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"json\":{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@test.com\",\"phone\":\"0123456789\",\"password\":\"123456\",\"role\":\"customer\"}}'"
echo ""
echo "# Login:"
echo "curl -X POST $BASE/auth.login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"json\":{\"email\":\"john@test.com\",\"password\":\"123456\"}}'"
echo ""
echo "# Get current user (replace TOKEN):"
echo "curl $BASE/auth.me -H 'Authorization: Bearer YOUR_TOKEN_HERE'"
echo ""
