# Author: Sourav Kumar Das

# Services (API)

Purpose: Centralized API client and service helpers for backend communication.

Key file:
- `api.ts` — Axios instance with request/response interceptors and exported high-level API functions (`authAPI`, `courseAPI`, `dashboardAPI`).

Usage:
- Import `courseAPI` or `authAPI` and call methods like `courseAPI.getModulesByCourse(courseId)`.
