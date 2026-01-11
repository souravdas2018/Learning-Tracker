# Test Cases Summary

## Overview

This directory contains comprehensive test cases for the Learning Tracker application. Tests are organized into backend and frontend test suites.

## Backend Tests

### Files Created
- `test-case/backend/package.json` - Test dependencies and scripts
- `test-case/backend/jest.setup.js` - Jest configuration
- `test-case/backend/__tests__/auth.test.js` - Authentication tests
- `test-case/backend/__tests__/admin.test.js` - Admin functionality tests
- `test-case/backend/__tests__/course.test.js` - Course management tests
- `test-case/backend/__tests__/dashboard.test.js` - Dashboard service tests
- `test-case/backend/__tests__/utils.test.js` - JWT utility tests

### Test Coverage

1. **Authentication Tests (auth.test.js)**
   - User signup (success and failure cases)
   - User login (success and failure cases)
   - Password validation
   - Error handling

2. **Admin Tests (admin.test.js)**
   - Admin signup
   - Admin login
   - Access control validation
   - Error handling

3. **Course Tests (course.test.js)**
   - Course creation
   - Course update
   - Course deletion
   - Module creation
   - Module retrieval
   - Enrollment counts

4. **Dashboard Tests (dashboard.test.js)**
   - User dashboard data aggregation
   - Admin dashboard statistics
   - Progress calculations
   - Empty data handling

5. **Utils Tests (utils.test.js)**
   - JWT token generation for users
   - JWT token generation for admins
   - Token validation

## Frontend Tests

### Files Created
- `test-case/frontend/package.json` - Test dependencies and scripts
- `test-case/frontend/jest.setup.js` - Jest and React Testing Library setup
- `test-case/frontend/__tests__/components/Layout.test.tsx` - Layout component tests
- `test-case/frontend/__tests__/contexts/AuthContext.test.tsx` - Auth context tests
- `test-case/frontend/__tests__/services/api.test.ts` - API service tests

### Test Coverage

1. **Component Tests (Layout.test.tsx)**
   - Layout rendering
   - Admin badge display
   - User information display
   - Logout functionality

2. **Context Tests (AuthContext.test.tsx)**
   - Auth context provider
   - User signup
   - User login
   - Token management

3. **API Tests (api.test.ts)**
   - Authentication API calls
   - Course API calls
   - Admin API calls
   - Error handling

## CI/CD Integration

### GitHub Actions Workflow
- **File**: `.github/workflows/test.yml`
- **Triggers**: Push and pull requests to `testing` branch
- **Jobs**:
  1. Backend Tests - Runs all backend test suites
  2. Frontend Tests - Runs all frontend test suites
  3. Test Summary - Ensures all tests pass

### Workflow Features
- Node.js 18 setup
- Dependency caching
- Coverage reports
- Parallel test execution
- Fail fast on errors

## Running Tests Locally

### Backend
```bash
cd test-case/backend
npm install
npm test
```

### Frontend
```bash
cd test-case/frontend
npm install
npm test
```

## Test Strategy

### Mocking Strategy
- **Backend**: Mocks Supabase repositories and JWT utilities
- **Frontend**: Mocks Next.js router, API services, and React contexts
- **External Services**: All external dependencies are mocked

### Test Principles
1. Tests are isolated and independent
2. Tests use mocks for external dependencies
3. Tests cover success and failure scenarios
4. Tests verify expected behavior and error handling
5. Tests are maintainable and readable

## Coverage Goals

- Backend: Service layer logic, authentication, business rules
- Frontend: Component rendering, context providers, API integration
- Utilities: JWT generation and validation

## Notes

- All tests must pass before merging to the testing branch
- Tests use mocks to avoid external dependencies
- Test data is kept minimal and focused
- Tests follow AAA pattern (Arrange, Act, Assert)
