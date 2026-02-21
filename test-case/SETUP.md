# Test Setup Instructions

## Prerequisites

- Node.js 18+ installed
- npm installed

## Installation

### Backend Tests

```bash
cd test-case/backend
npm install
```

### Frontend Tests

```bash
cd test-case/frontend
npm install
```

## Running Tests

### Backend Tests

```bash
cd test-case/backend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:ci       # Run tests for CI/CD (with coverage)
```

### Frontend Tests

```bash
cd test-case/frontend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:ci       # Run tests for CI/CD (with coverage)
```

## CI/CD Integration

Tests automatically run on the `testing` branch via GitHub Actions workflow (`.github/workflows/test.yml`).

The workflow:
1. Checks out code
2. Sets up Node.js
3. Installs dependencies
4. Runs backend tests
5. Runs frontend tests
6. Generates coverage reports
7. Fails if any tests fail

## Test Structure

- Backend tests are in `test-case/backend/__tests__/`
- Frontend tests are in `test-case/frontend/__tests__/`
- Each test file follows the pattern: `*.test.js` or `*.test.tsx`

## Notes

- Tests use mocks for external dependencies (Supabase, APIs)
- Tests should be independent and not rely on external services
- All tests must pass before merging to the testing branch