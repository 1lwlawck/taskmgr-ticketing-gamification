# taskmgr-ticketing-gamification (frontend)

Vue 3 + Vite + Pinia frontend for the ticketing + gamification app.

## Setup
1. Copy `.env.example` to `.env` and set:
   - `VITE_API_BASE_URL` (e.g., http://localhost:8080/api/v1)
   - `VITE_API_KEY` (if backend enforces API key)
2. Install deps: `npm install`
3. Dev server: `npm run dev`
4. Build: `npm run build` (outputs to `dist/`)

## Running end-to-end
- Start backend (see backend README). Ensure migrations applied and API reachable at `http://localhost:8080`.
- Start frontend: `npm run dev`, open the provided URL (default http://localhost:5173).
- Use credentials you registered in the app (or seeded users if you ran the backend seeder).

## Auth
- Login/Register hit `/auth/login` and `/auth/register`.
- Change password is available on the Profile page; calls `POST /auth/change-password` (requires JWT and API key if enabled).

## Features
- Projects board, tickets CRUD, comments (edit/delete by author).
- XP/leaderboard widgets; XP rolls back if ticket leaves `done` status.
- Invites, activity feed, member lists per project.

## Tips
- If CORS/API key errors, ensure backend CORS allows `X-API-Key` and frontend `.env` has matching key.
- Large bundle warning on build is informational; code splitting can be added if needed.
