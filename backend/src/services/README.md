# Author: Sourav Kumar Das

# Services

Purpose: Contain business logic and orchestrate repository calls. Services are the single source of domain rules.

Responsibilities:
- Validate or normalize data for repositories
- Compose repository operations into higher-level actions
- Apply business rules (e.g., progress increments, enrollment initialization)

Testing:
- Services should be unit-tested with mocked repositories. See `test-case/backend` for examples.

Examples:
- `course.service.js` — merges module data with user progress and computes derived values
- `auth.service.js` — user creation and token generation
- `ai.service.js` — all AI features; calls Google Gemini first and falls back to Groq on any error. Exports 10 functions:
  1. `generateInsight(dashboardData)` — personalised 2-3 sentence coaching insight
  2. `askStudyAssistant(moduleTitle, courseTitle, question, history)` — module-scoped study Q&A
  3. `generateQuiz(moduleTitle, courseTitle)` — 5-question MCQ JSON
  4. `getRecommendations(enrolledTitles, availableCourses)` — up to 3 course suggestions
  5. `generalChat(question, history, dashboardContext)` — general learning assistant chat
  6. `generateAdminSummary(dashboardData)` — executive platform health report
  7. `getAtRiskAnalysis(dashboardData)` — engagement risk JSON with riskLevel, summary, risks[]
  8. `generateCourseDescription(courseTitle)` — 2-3 sentence course description
  9. `adminChat(question, history, dashboardContext)` — admin-aware conversational assistant
  10. `getContentGapAnalysis(dashboardData)` — content gap JSON with gaps[] and insight
