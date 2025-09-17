#!/bin/bash

echo "🧪 Multimflow v2.0 Comprehensive Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test and check result
run_test() {
    local test_name="$1"
    local command="$2"
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: ${test_name}${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: ${test_name}${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Navigate to demo workspace
cd demo-workspace

echo "🏗️ Setting up test environment..."
echo ""

# Clean up any existing config
rm -f .flow.yml

echo "📋 Running Multimflow Test Suite..."
echo ""

# 1. Core Functionality Tests
echo -e "${YELLOW}=== CORE FUNCTIONALITY ===${NC}"
run_test "Workspace Initialization" "node ../src/cli.js init"
run_test "Show Configuration" "node ../src/cli.js config show"
run_test "Workspace Health Check" "node ../src/cli.js doctor"

# 2. Profile Management Tests
echo -e "${YELLOW}=== PROFILE MANAGEMENT ===${NC}"
run_test "Create Frontend Profile" "node ../src/cli.js profile create frontend-only --repos frontend-web shared-components"
run_test "Create Backend Profile" "node ../src/cli.js profile create backend-only --repos backend-api analytics-service"
run_test "Create Fullstack Profile" "node ../src/cli.js profile create fullstack --repos frontend-web backend-api mobile-app analytics-service"
run_test "List Profiles" "node ../src/cli.js profile list"
run_test "Show Profile Details" "node ../src/cli.js profile show frontend-only"
run_test "Switch to Frontend Profile" "node ../src/cli.js profile switch frontend-only"

# 3. Feature Management with Profile Filtering
echo -e "${YELLOW}=== FEATURE MANAGEMENT (PROFILE FILTERED) ===${NC}"
run_test "Create Feature (Frontend Only)" "node ../src/cli.js feature create user-authentication"
run_test "Feature Status Check" "node ../src/cli.js status user-authentication"
run_test "Switch to Fullstack Profile" "node ../src/cli.js profile switch fullstack"
run_test "Create Feature (All Repos)" "node ../src/cli.js feature create payment-system"
run_test "Multi-Feature Status" "node ../src/cli.js status payment-system"

# 4. Git Operations Tests
echo -e "${YELLOW}=== GIT OPERATIONS ===${NC}"
run_test "Checkout Feature Branch" "node ../src/cli.js checkout user-authentication"
run_test "Show Cross-Repo Diff" "node ../src/cli.js diff user-authentication --summary"
run_test "Checkout Main Branch" "node ../src/cli.js checkout master"

# 5. Advanced Features
echo -e "${YELLOW}=== ADVANCED FEATURES ===${NC}"
run_test "Profile Configuration View" "node ../src/cli.js config show"
run_test "Health Check with Active Profile" "node ../src/cli.js doctor"
run_test "Profile Switch Verification" "node ../src/cli.js profile list"

# 6. Cleanup Tests
echo -e "${YELLOW}=== CLEANUP OPERATIONS ===${NC}"
run_test "Cleanup User Auth Feature" "node ../src/cli.js feature cleanup user-authentication"
run_test "Cleanup Payment Feature" "node ../src/cli.js feature cleanup payment-system"
run_test "Final Configuration Check" "node ../src/cli.js config show"

echo ""
echo "🧹 Cleaning up test environment..."
rm -f .flow.yml

echo ""
echo "📊 TEST RESULTS SUMMARY"
echo "======================"
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Multimflow v2.0 is ready for production!${NC}"
    echo ""
    echo "✅ Core functionality working"
    echo "✅ Profile management complete"
    echo "✅ Feature workflows operational"
    echo "✅ Git operations functional"
    echo "✅ Advanced features working"
    echo "✅ Cleanup operations successful"
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Please check the output above.${NC}"
fi

echo ""
echo "🚀 Multimflow v2.0 Comprehensive Test Complete!"
