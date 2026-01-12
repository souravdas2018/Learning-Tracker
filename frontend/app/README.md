# Author: Sourav Kumar Das

# App (Next.js App Router)

Purpose: Contains route-aware React components and pages handled by Next.js App Router.

Structure:
- Each folder under `app/` is a route; `page.tsx` files are entry points.
- Nested folders (e.g., `courses/[courseId]/modules`) represent dynamic routes and subpages.

Notes:
- Keep route UI focused on data fetching and rendering; use `services/api.ts` for network calls.
- Use `Layout.tsx` from `components` to wrap pages consistently.
