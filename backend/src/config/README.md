# Config

Purpose: Contains configuration clients and environment-backed setup used across the backend.

Key file:
- `supabase.js` — initializes and exports the Supabase client using `SUPABASE_URL` and `SUPABASE_KEY` from environment variables.

Notes:
- Keep secrets in environment variables (see `backend/README.md`).
