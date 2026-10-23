# NUTRIGUARD React - Development Status

## Project Overview

NUTRIGUARD is a mobile-first health and nutrition platform built with React 19 + Vite 8 and an Express + PostgreSQL backend. This document records the implemented integration and the remaining production gates.

---

## Master Plan Coverage

| Section | Feature | Frontend | Backend | Status / Notes |
|---------|---------|----------|---------|----------------|
| 1 | Authentication, OTP, JWT, and privacy | ✅ | ✅ | Implemented in the main backend; production verification remains gated on dependency/tests/deployment checks |
| 2 | Profile and health-sync page | ✅ | ✅ | Medical profile persists per authenticated user; device health sync remains a frontend integration stub |
| 3 | AI chat and diet plans | ✅ | ✅ | Plan persistence and authenticated ownership implemented; end-to-end browser verification remains required |
| 4 | Smart shopping and barcode scanner | ✅ | ✅ | Scanner history and safety routes use the authenticated user |
| 5 | 3-state gamified calendar | ✅ | ✅ | Compliance routes use the authenticated user |
| 6 | Lifestyle constraints and map | ✅ | ✅ | Ownership uses the verified JWT user; map/provider behavior remains environment-dependent |

**Legend:** ✅ Implemented | 🟡 In progress / verification pending | ❌ Not started

---

## Authentication Architecture

- Public routes: `POST /api/auth/register`, `POST /api/auth/verify-otp`, `POST /api/auth/login`, and `POST /api/auth/resend-otp`.
- Protected routes: medical-profile endpoints and all application APIs mounted after the JWT middleware.
- Passwords are hashed through `server/src/services/passwordService.js`. Native bcrypt is used when its binding is available; Node's scrypt fallback keeps local/test installation usable when package install scripts were disabled. Existing bcrypt hashes remain supported when native bcrypt is available.
- JWTs contain the authenticated user's UUID and normalized email. Production must use `AUTH_MODE=jwt`; development-only bypass is rejected when `NODE_ENV=production`.
- The frontend stores the session in `localStorage` under `nutri_token` and `nutri_user`, and `src/services/api.js` adds the Bearer token to API requests.
- `server/src/db/migrations/003_auth_tables.sql` adds auth fields, OTP storage, and medical profiles. Migration 004 persists generated plan data and lifecycle status.

## Current Verification Status

- ✅ Frontend production build completed previously; the only reported warning was a non-fatal bundle-size warning.
- ✅ Auth migration setup completed in the test database.
- ✅ Public auth routes are mounted before protected middleware.
- ✅ Application ownership paths were changed to use `req.user.id` rather than browser-supplied user IDs.
- ✅ Auth-specific suite passes in JWT mode: 3 tests covering registration/OTP/profile protection, invalid OTP/unverified login/wrong password, and malformed/expired token rejection.
- ✅ Frontend production build passes; Vite reports only the existing non-fatal large-chunk warning.
- ✅ The server now mounts JWT middleware before protected application routes and keeps a protected fallback for malformed plan/profile requests.
- ✅ The complete backend suite now passes in JWT mode. `TypeError: default(...).set is not a function` in `supertest` was resolved by correcting the chaining order (method before `.set()`). Plan dates were updated to ensure active status for testing.
- ✅ The "Get Started" button in the Header is now conditionally displayed based on authentication status.
- ✅ The "Swap Meal" feature is now functional, correctly identifying and substituting meals with alternatives from the meal library. All cards now update consistently without unexpected clearing.
- ✅ Added "Clear Meal Plan" functionality with confirmation dialog. This now removes meal plans persistently from the backend, ensuring they remain cleared after page refresh and across both Dashboard and Meal Plan sections.
- ✅ Authenticated users are now correctly redirected from the landing page to the `/dashboard`.
- ✅ The AI Nutritionist container now dynamically adjusts height when more meals are displayed.
- ✅ Plan activation now triggers an automatic UI update in the Dashboard and Meal Plan sections without requiring a page refresh.
- 🟡 Browser end-to-end verification is still required: register, OTP verification, profile save, login, protected request, plan creation, plan activation, and cross-user isolation. Backend E2E smoke test passed locally.
- 🟡 Render deployment has not been performed from this integration state.

## Production Configuration

Configure these Render backend variables before deployment:

```text
NODE_ENV=production
AUTH_MODE=jwt
JWT_SECRET=<strong random secret, at least 16 characters>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=<live frontend URL>
DATABASE_URL=<production PostgreSQL URL>
DATABASE_SSL=true
EMAIL_USER=<SMTP account>
EMAIL_PASS=<SMTP password or app password>
```

Optional SMTP overrides:

```text
SMTP_HOST=<SMTP host>
SMTP_PORT=587
SMTP_SECURE=false
```

Apply migrations 001 through 004 to the production database. Never use the development OTP response fallback in production; production email delivery is required.

## Remaining Hardening and Deployment Gates

1. Exercise the complete auth-to-plan flow locally or against a controlled deployed environment.
2. Verify that missing, malformed, expired, and cross-user tokens cannot access protected data.
3. Review remaining placeholder restaurant/scanner endpoints before enabling those UI actions.
4. Review the localStorage token strategy and consider HttpOnly cookies for stronger XSS resistance.
5. Review npm audit findings before production release.
6. Inspect the final Git diff and stage only reviewed source, migration, lockfile, tests, and documentation. Do not stage `.env` or any credentials.
7. Commit, push, redeploy Render, and repeat the smoke test only after the preceding gates pass.

## Handover Notes

- Run backend commands from `server/` with a test database URL ending in `_test`.
- The server test harness applies migrations through `server/src/tests/globalSetup.js`.
- The root `.gitignore` excludes `.env` and `.env.*`; verify this with `git status --short` before committing.
- The active implementation plan is stored under `C:\Users\J G TECH\.claude-omniroute\plans\`.
