# Test Cases

This folder contains unit and integration tests used by the project.

Run tests (see individual package.json in test folders):

```bash
cd test-case/frontend
npm install
npm test

cd test-case/backend
npm install
npm test
```

The `testing` branch is used to run CI tests in GitHub Actions.

See root `README.md` for CI and deployment notes.
# Author: Sourav Kumar Das

# Learning Tracker Test Cases

This directory contains comprehensive test cases for the Learning Tracker application, separated into backend and frontend test suites.

## Structure

```
test-case/
├── backend/          # Backend test cases
│   ├── __tests__/    # Test files
│   ├── jest.setup.js # Jest configuration
│   └── package.json  # Test dependencies
├── frontend/         # Frontend test cases
│   ├── __tests__/    # Test files
│   ├── jest.setup.js # Jest configuration
│   └── package.json  # Test dependencies
└── README.md         # This file
```

## Backend Tests

The backend tests use Jest and Supertest to test API endpoints and service logic.

### Running Backend Tests

```bash
cd test-case/backend
npm install
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:ci       # Run tests for CI/CD
```

### CI/CD Integration

Tests are automatically run when code is merged to the `testing` branch via GitHub Actions.

The workflow:
1. Runs backend tests
2. Runs frontend tests
3. Generates coverage reports
4. Fails if any tests fail

### Test Coverage

Backend tests cover:
- Authentication (signup, login, logout)
- Admin operations (signup, login, access management)
- Course management (CRUD operations)
- Dashboard services (user and admin dashboards)
- JWT utilities

## Frontend Tests

The frontend tests use Jest and React Testing Library to test React components and contexts.

### Running Frontend Tests

```bash
cd test-case/frontend
npm install
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:ci       # Run tests for CI/CD
```

### Test Coverage

Frontend tests cover:
- React components (Layout, pages)
- Context providers (AuthContext)
- API services
- User interactions

## CI/CD Integration

Tests are automatically run when code is merged to the `testing` branch via GitHub Actions.

The workflow:
1. Runs backend tests
2. Runs frontend tests
3. Generates coverage reports
4. Fails if any tests fail

## Writing New Tests

### Backend Test Example

```javascript
describe('Feature Name', () => {
  test('should do something', async () => {
    // Arrange
    const mockData = { /* test data */ };
    
    // Act
    const result = await service.method(mockData);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

### Frontend Test Example

```typescript
describe('Component Name', () => {
  test('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Notes

- All tests should pass before merging to the testing branch
- Mock external dependencies (Supabase, APIs) in tests
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests isolated and independent
