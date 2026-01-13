# Author: Sourav Kumar Das

# Config

Purpose: Contains configuration clients and environment-backed setup used across the backend.

Key file:
- `supabase.js` — initializes and exports the Supabase client using `SUPABASE_URL` and `SUPABASE_KEY` from environment variables.

Secrets & environment variables:
- Do not commit secrets. Use GitHub Actions secrets for CI/CD and Parameter Store/Secrets Manager in production.

See `DEPLOY.md` for deployment and secrets recommendations.
