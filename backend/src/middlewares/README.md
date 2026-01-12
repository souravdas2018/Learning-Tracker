# Author: Sourav Kumar Das

# Middlewares

Purpose: Reusable Express middleware functions to handle authentication, authorization, and common request processing.

Examples:
- `auth.middleware.js` — validates user JWT and attaches `req.user`
- `admin.middleware.js` — ensures caller has admin privileges

Keep middleware focused and side-effect free where possible.
