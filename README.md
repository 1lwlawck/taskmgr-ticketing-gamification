# Ticketing + Gamification Frontend

This is a Vite + Vue 3 (Composition API) frontend scaffold for a ticketing platform that layers in gamification mechanics. It ships with Pinia stores, Vue Router routes, TailwindCSS for the monochrome UI, mocked data persisted to `localStorage`, and Vitest-based unit tests.

## Requirements

- Node.js 18+
- npm 9+

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173. Demo credentials are documented in `src/stores/users.js` (`avery`, `devon`, `parker`, all with password `password`). Feel free to register a new user—the first registration becomes an admin when the demo storage is empty.

### Available scripts

| Script        | Description                                  |
| ------------- | -------------------------------------------- |
| `npm run dev` | Start Vite dev server with hot reload.       |
| `npm run build` | Production bundle generation.             |
| `npm run preview` | Preview the production build locally.   |
| `npm run test` | Run Vitest unit tests once.                |
| `npm run test:watch` | Run Vitest in watch mode.            |

### Reset demo data

All state is persisted in `localStorage` under keys prefixed with `ttm_*`. To reset the workspace back to seed data:

1. Open your browser devtools.
2. Go to the **Application / Storage** tab.
3. Delete the keys `ttm_auth`, `ttm_users`, `ttm_projects`, `ttm_tickets`, `ttm_gamification`, and `ttm_audit`.
4. Refresh the page.

## Architecture overview

- **Vue 3 + Vite** for SPA scaffolding.
- **Pinia stores** for `auth`, `users`, `projects`, `tickets`, `gamification`, and `audit` state. Each store loads from/persists to `localStorage`. TODO markers highlight where API calls should replace mocks later.
- **Vue Router** protects routes client-side and switches between auth and main layouts.
- **TailwindCSS** enforces the black/gray/white palette with responsive layouts.
- **Components** for layout (sidebar, topbar), reusable cards, modals, a toast system, and XP/badge widgets.
- **Pages** cover login/register, dashboard, projects & detail (with SortableJS kanban + invite modal), tickets list & detail (with comments/history), leaderboard, admin management, profile editing, and join-by-code.
- **Gamification flow** awards XP based on ticket priority when status moves to `done`, logs XP events, and shows toast notifications.
- **Tests**: `src/tests/gamification.spec.js` exercises XP awarding logic using Vitest.

## Mocked backend

- There are **no real API calls**. Stores mutate in-memory state and immediately persist to `localStorage`.
- TODO comments in stores mark the exact spots where network calls/services should be dropped in.
- Invite codes, ticket IDs, and XP events are generated locally via helper utilities.

When you connect a backend, replace the Pinia action bodies with API integrations, keep the persistence helpers only for optimistic updates or remove them entirely.
