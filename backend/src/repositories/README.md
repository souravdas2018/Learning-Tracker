# Author: Sourav Kumar Das

# Repositories

Purpose: Data access layer that communicates with Supabase/Postgres. Keep SQL/DB details here.

Guidelines:
- Expose small functions (createUser, getModulesByCourse, updateModuleProgress, etc.)
- Return Supabase results directly (or normalized) so services can decide how to handle them
- Handle DB-level errors only if necessary; prefer throwing to let service/controller respond

Testing:
- Use integration tests with a test database or in-memory DB to verify repository queries.

Key files:
- `course.repo.js`, `auth.repo.js`, `dashboard.repo.js`, `userCourse.repo.js`
