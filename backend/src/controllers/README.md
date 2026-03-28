# Controllers

Purpose: Request handlers that receive HTTP requests, call service-layer logic, and return HTTP responses.

Common pattern:
- Validate input (light)
- Call corresponding function in `../services/*`
- Handle success and error responses (status codes + JSON body)

Testing:
- Controllers are good candidates for integration tests that exercise routing, middleware, and service interactions.

Typical files:
- `auth.controller.js` — signup/login/logout
- `course.controller.js` — course/module endpoints and progress update
- `dashboard.controller.js` — dashboard endpoints
- `ai.controller.js` — all AI endpoint handlers; delegates entirely to `ai.service.js`. Handlers: `getInsight`, `askAssistant`, `getQuiz`, `getRecommendations`, `generalChat`, `getAdminSummary`, `getAtRiskAnalysis`, `generateCourseDescription`, `adminChat`, `getContentGapAnalysis`

Keep controllers thin; put business rules in services.
