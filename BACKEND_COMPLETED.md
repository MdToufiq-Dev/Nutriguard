# NUTRIGUARD Backend - Development Status

## Phase 0: Audit & Foundation Setup – 2026-10-03

**Status:** 🟡 In Progress (50% complete)

### Frontend Audit
- ✅ 4 features complete (calendar, chat+plans, scanner, delivery map)
- ✅ 64 unit tests passing
- ✅ localStorage persistence working
- ✅ All 6 routes functional
- ⚠️ Known gaps: swap uses same meal ID, budget/meals-per-day not enforced, plan is always 7 days, meal timings missing, calorie adjustment missing, label names (safe/warning/blocked not safe/cautionary/unsafe)

### Backend Scaffold Created
- ✅ `server/` directory initialized with ES modules
- ✅ `package.json` with all dependencies (express, pg, zod, helmet, cors, pino, opening_hours, node-cache)
- ✅ Core files created:
  - `src/index.js` - entry point with graceful shutdown
  - `src/app.js` - Express app with middleware chain
  - `src/config/env.js` - zod-validated environment variables
  - `src/utils/logger.js` - pino logger
- ✅ Security: AUTH_MODE=dev validation (refuses in production)

### Assumptions Logged
1. PostgreSQL 16+ will run locally (Docker or system install)
2. No API keys required for mock mode (LLM_PROVIDERS=mock, PRODUCTS_PROVIDER=seed, PLACES_PROVIDER=mock)
3. Free providers: Groq, Gemini (no billing), Open Food Facts (no key), OpenStreetMap
4. Frontend stays in localStorage mode until all backend APIs are ready, then switch via VITE_DATA_SOURCE=api
5. Auth stub: AUTH_MODE=dev uses hardcoded UUID, ignored in production
6. All health data is sent only to the server, never to third parties that train on it

### Next Phase (Phase 1: Foundation)
- Database pool and migrations (all 14 tables)
- Middleware: auth stub, validate, errorHandler, rateLimit, requestId
- Routes skeleton for all 8 endpoints groups
- Test harness with test database
- docker-compose.yml and SETUP.md

### Resume Point
Start Phase 1 by:
1. `npm install` in server/ (requires Node.js 22 LTS)
2. Create `src/db/pool.js` with connection pooling
3. Write migrations 0001-0014
4. Add stub routes that return 501 Not Implemented
5. Test database schema is created
