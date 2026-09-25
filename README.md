# Desafio ZRP — Rick and Morty explorer

A job-interview technical challenge: a monolith that consumes the [Rick and Morty API](https://rickandmortyapi.com/api) through a BFF, with a web client (Next.js) and a mobile client (Flutter). Users can browse and search episodes, open an episode to see its (ordered) character list, and view a character's details in a modal.

## Architecture

```
desafio-zrp/
├── backend/   # Fastify + TypeScript BFF (Clean Architecture)
├── web/       # Next.js (App Router) + shadcn/ui
├── app/       # Flutter + Riverpod
└── .github/workflows/ci.yml
```

### Backend — BFF (`backend/`)

Fastify + TypeScript, no opinionated framework — the architecture is laid out manually to keep SOLID boundaries explicit:

- `src/domain` — entities and repository interfaces (ports). No dependency on anything outside itself.
- `src/application` — use-cases orchestrating business logic, depending only on `domain` ports.
- `src/infrastructure` — implementations of those ports (the Rick and Morty API HTTP client, caching), never leaking upstream response shapes past its boundary.
- `src/interface/http` — Fastify routes/controllers, translating HTTP ⇄ use-cases.

Tests: [Vitest](https://vitest.dev/), with upstream HTTP calls mocked via [msw](https://mswjs.io/) in integration tests. Endpoints proxying the Rick and Morty API are added phase by phase (see the API surface section below, which grows as they land).

### Web (`web/`)

Next.js App Router, TypeScript, [shadcn/ui](https://ui.shadcn.com/) (Tailwind + Base UI, this project's flavor of shadcn — its `Button` composes via a `render` prop rather than Radix's `asChild`) as the design system — chosen for the best visual quality at the lowest development cost, and because it fits Server Components/Next's fetch caching cleanly. Testing: Vitest + React Testing Library (unit) and Playwright (real browser flows).

> This project runs on Next.js 16, which changed some App Router APIs since earlier versions (`params`/`searchParams` are now Promises, `fetch()` is not cached by default, etc.) — see inline comments in the code where these matter.

The episode list screen (`/`) is an async Server Component that fetches `GET /episodes` from the backend with `next: { revalidate: 3600 }`. Search and pagination state live entirely in the URL (`?search=&page=`) via a plain server-rendered GET `<form>` and `Link`-based pagination controls — no client-side JavaScript is needed to keep that state, which is also the mechanism that will let back-navigation preserve list state once the detail screen exists. Requires `BACKEND_API_URL` (see below).

### App (`app/`)

Flutter + [Riverpod](https://riverpod.dev/), with light layering mirroring the backend's Clean Architecture spirit:

- `lib/domain` — entities and repository interfaces.
- `lib/data` — repository implementations (HTTP client).
- `lib/presentation` — screens, widgets, and Riverpod providers.

Testing: `flutter test` (widget/unit) and `integration_test` (drives the real app on a device/emulator).

## Decisions log

- **No shared types package** between `backend` and `web` — each is a fully independent project (own `package.json`/lockfile), trading a little duplication for less cross-folder coupling.
- **Character ordering** in an episode's detail view is alphabetical by name (the Rick and Morty API doesn't define an inherent order for a `characters` array) — a product assumption, open to revisiting.
- **Upstream 404-as-empty-page**: the Rick and Morty API returns HTTP 404 for both "no results for this search" and "page out of range" (same body shape as a genuine not-found). The BFF's episode repository treats any 404 from the list endpoint as an empty page rather than an error, so `GET /episodes` with no matches is a normal `200` with `episodes: []`, not a client-facing error.
- **State preservation on back-navigation**: on web, the episode list's search/page state lives in the URL (`?search=&page=`), so `Link`/back navigation naturally restores it. On the app, Flutter keeps the previous screen's `State` alive on the navigation stack by default, so the Riverpod provider backing the list isn't disposed when a detail screen is pushed on top.
- **Gitflow, released per phase**: this project is built in small phases (see the git history / PR list), each branched from `develop`, tested (automated + a real "run it like a user would" pass), reviewed, merged into `develop`, and immediately promoted to `main` — so `main` is always a fully working snapshot of the latest completed phase, not just of periodic releases.

## API surface (BFF)

| Method | Path                       | Description                                                                 |
| ------ | -------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/health`                  | Liveness check.                                                              |
| GET    | `/episodes?search=&page=`  | Paginated episode list, optionally filtered by name. `page` defaults to 1.  |

`GET /episodes` response shape:

```json
{
  "episodes": [{ "id": 1, "name": "Pilot", "airDate": "December 2, 2013", "episodeCode": "S01E01" }],
  "page": 1,
  "totalPages": 3,
  "totalCount": 51,
  "hasNext": true,
  "hasPrevious": false
}
```

A search/page combination with no matches returns `200` with an empty `episodes` array (the upstream API's own 404-for-empty-results is translated into a normal empty page, not an error). An unreachable or failing upstream API returns `502`; an invalid `page` returns `400`.

_(Grows as character endpoints are added in later phases.)_

## Running everything locally

### Backend

```bash
cd backend
npm install
cp .env.example .env   # defaults already point at the real Rick and Morty API
npm run dev             # http://localhost:3001
```

### Web

```bash
cd web
npm install
cp .env.example .env   # BACKEND_API_URL defaults to http://localhost:3001 — start the backend first
npm run dev              # http://localhost:3000
```

### App

```bash
cd app
flutter pub get
flutter run               # pick a connected device/emulator
```

## Testing

| Sub-project | Automated                          | Real consumption                                          |
| ----------- | ----------------------------------- | ----------------------------------------------------------- |
| `backend`   | `npm test` (Vitest, unit + integration) | Start `npm run dev`, hit endpoints with real HTTP requests against the live Rick and Morty API. |
| `web`       | `npm test` (Vitest + Testing Library)   | `npm run build && npm run test:e2e` — Playwright's `webServer` boots both the real backend and the web app, so these tests exercise the full stack (web → backend → the live Rick and Morty API) in a real Chromium browser, not mocks. |
| `app`       | `flutter test` (widget/unit)             | `flutter test integration_test` on a real emulator/device. |

## Gitflow

- Branches: `main` (always a fully working snapshot of the latest completed phase) and `develop` (integration).
- One phase = one `feature/<slug>` or `chore/<slug>` branch off `develop`, with Conventional Commits in English.
- Per phase: implement → automated + real consumption tests → PR (`feature`/`chore` → `develop`) → review → merge → promote `develop` → `main`.
