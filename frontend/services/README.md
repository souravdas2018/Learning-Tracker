# Author: Sourav Kumar Das

# Services (API)

Purpose: Centralized API client and service helpers for backend communication.

Key file:
- `api.ts` — Axios instance with request/response interceptors and exported high-level API functions (`authAPI`, `courseAPI`, `dashboardAPI`, `adminAPI`, `adminAuthAPI`, `aiAPI`).

Usage:
- Import `courseAPI` or `authAPI` and call methods like `courseAPI.getModulesByCourse(courseId)`.
- Import `aiAPI` for all AI features. Available methods:
  - `aiAPI.getInsight(dashboardData)` — personalised learning insight
  - `aiAPI.askAssistant({ moduleTitle, courseTitle, question, history })` — study assistant
  - `aiAPI.getQuiz(moduleTitle, courseTitle)` — quiz generation
  - `aiAPI.getRecommendations(enrolledTitles, availableCourses)` — course recommendations
  - `aiAPI.chat(question, history, dashboardContext?)` — general user dashboard chat
  - `aiAPI.getAdminSummary(dashboardData)` — admin platform summary
  - `aiAPI.getAtRiskAnalysis(dashboardData)` — engagement risk analysis
  - `aiAPI.generateCourseDescription(courseTitle)` — course description generator
  - `aiAPI.adminChat(question, history, dashboardContext?)` — admin-aware chat
  - `aiAPI.getContentGapAnalysis(dashboardData)` — content gap analysis

Notes:
- Ensure `NEXT_PUBLIC_API_BASE_URL` is set in your environment when running locally or in containers.
