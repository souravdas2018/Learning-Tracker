# Author: Sourav Kumar Das

# Routes

Purpose: Route definitions that map HTTP endpoints to controller functions and apply middleware.

Notes:
- Each route file registers Express routes (e.g., `router.get('/...')`).
- Middleware like `auth.middleware` and `admin.middleware` are applied here to protect endpoints.

Testing:
- Use integration tests to exercise routes with a test database. See `test-case/backend` for examples.

Files:
- `course.routes.js`, `auth.routes.js`, `dashboard.routes.js`, `admin.routes.js`
