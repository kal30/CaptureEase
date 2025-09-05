#!/bin/bash

# CaptureEase Aggressive Testing Script
# This script runs comprehensive tests to ensure code quality and functionality

set -e  # Exit on any error

echo "🧪 CAPTUREEASE AGGRESSIVE TESTING SUITE"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required dependencies are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Install test dependencies
install_test_deps() {
    print_status "Installing test dependencies..."
    npm install --save-dev cypress @cypress/react axe-core cypress-axe
    print_success "Test dependencies installed"
}

# Run lint checks
run_lint() {
    print_status "Running ESLint checks..."
    if npm run lint 2>/dev/null || npx eslint src/ --ext .js,.jsx; then
        print_success "Lint checks passed"
    else
        print_warning "Lint checks found issues"
    fi
}

# Run unit tests with coverage
run_unit_tests() {
    print_status "Running unit tests with coverage..."
    if npm run test:coverage; then
        print_success "Unit tests passed with coverage"
    else
        print_error "Unit tests failed"
        return 1
    fi
}

# Run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    if npm run test:integration; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        return 1
    fi
}

# Run build test
run_build_test() {
    print_status "Running production build test..."
    if npm run build; then
        print_success "Build test passed"
        
        # Check bundle size
        if [ -d "build/static/js" ]; then
            BUNDLE_SIZE=$(du -sh build/static/js/*.js | head -n1 | cut -f1)
            print_status "Bundle size: $BUNDLE_SIZE"
        fi
    else
        print_error "Build test failed"
        return 1
    fi
}

# Run accessibility tests
run_a11y_tests() {
    print_status "Running accessibility tests..."
    # This would require custom implementation or pa11y
    print_warning "Accessibility tests require manual setup"
}

# Run performance tests
run_performance_tests() {
    print_status "Running performance tests..."
    print_warning "Performance tests require Lighthouse CLI or similar"
}

# Run security audit
run_security_audit() {
    print_status "Running security audit..."
    if npm audit; then
        print_success "Security audit passed"
    else
        print_warning "Security vulnerabilities found - review npm audit output"
    fi
}

# Run E2E tests (if Cypress is set up)
run_e2e_tests() {
    print_status "Checking for E2E tests..."
    if [ -f "cypress.config.js" ]; then
        print_status "Running E2E tests..."
        if npx cypress run --headless; then
            print_success "E2E tests passed"
        else
            print_error "E2E tests failed"
            return 1
        fi
    else
        print_warning "E2E tests not configured"
    fi
}

# Generate test report
generate_report() {
    print_status "Generating test report..."
    
    echo "
🧪 CAPTUREEASE TEST REPORT
=========================
Date: $(date)
Node Version: $(node --version)
NPM Version: $(npm --version)

Test Results:
- Unit Tests: ✅ Passed
- Integration Tests: ✅ Passed  
- Build Test: ✅ Passed
- Security Audit: ⚠️  Check required
- Bundle Analysis: 📊 Generated

Coverage Report:
$(find coverage -name "*.html" -type f | head -1 | xargs dirname)/index.html

Recommendations:
1. Review bundle size and optimize if needed
2. Add E2E tests for critical user flows
3. Implement accessibility testing
4. Set up performance monitoring
5. Configure CI/CD pipeline with these tests

" > test-report.txt
    
    print_success "Test report generated: test-report.txt"
}

# Main execution
main() {
    echo "Starting aggressive testing suite..."
    
    # Track start time
    START_TIME=$(date +%s)
    
    # Run all tests
    check_dependencies
    # install_test_deps  # Uncomment to auto-install
    
    # Core tests that should always run
    run_lint
    run_unit_tests
    run_integration_tests  
    run_build_test
    run_security_audit
    
    # Optional tests
    # run_a11y_tests
    # run_performance_tests
    # run_e2e_tests
    
    # Calculate total time
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    print_success "All tests completed in ${DURATION}s"
    generate_report
    
    echo ""
    print_success "🎉 AGGRESSIVE TESTING COMPLETE!"
    print_status "Next steps:"
    echo "1. Review test-report.txt"
    echo "2. Check coverage/lcov-report/index.html"
    echo "3. Address any warnings or failures"
    echo "4. Consider setting up CI/CD pipeline"
}

# Execute main function
main "$@"