# Controllers

Purpose: Request handlers that receive HTTP requests, call service-layer logic, and return HTTP responses.

Common pattern:
- Validate input (light)
- Call corresponding function in `../services/*`
- Handle success and error responses (status codes + JSON body)

Typical files:
- `auth.controller.js` — signup/login/logout
- `course.controller.js` — course/module endpoints and progress update
- `dashboard.controller.js` — dashboard endpoints

Keep controllers thin; put business rules in services.
