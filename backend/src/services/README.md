# Services

Purpose: Contain business logic and orchestrate repository calls. Services are the single source of domain rules.

Responsibilities:
- Validate or normalize data for repositories
- Compose repository operations into higher-level actions
- Apply business rules (e.g., progress increments, enrollment initialization)

Examples:
- `course.service.js` — merges module data with user progress and computes derived values
- `auth.service.js` — user creation and token generation
