# Contexts

Purpose: React Context providers for application-wide state (auth, theme, etc.).

Key file:
- `AuthContext.tsx` — manages authentication state, token storage, and helper actions (`login`, `logout`, `signup`).

Guidelines:
- Keep contexts small and testable; prefer hooks (`useAuth`) for consumption.
