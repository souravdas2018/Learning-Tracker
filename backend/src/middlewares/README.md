# Author: Sourav Kumar Das

# Middlewares

Purpose: Reusable Express middleware functions to handle authentication, authorization, and common request processing.

Examples:
- `auth.middleware.js` — validates user JWT and attaches `req.user`
- `admin.middleware.js` — ensures caller has admin privileges
- `rateLimit.middleware.js` — global rate limiting
- `validation.middleware.js` — express-validator result handler

Guidance:
- Keep middleware small and composable. Do not perform heavy business logic here; delegate to services.
