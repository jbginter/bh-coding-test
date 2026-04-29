# NFL Player Browser

A full-stack NFL player browser built on top of the [Sleeper API](https://api.sleeper.app/v1/players/nfl). Search, filter, sort, and favorite players from a paginated table, and click any row for a full player detail view.

## Setup & Run

**Prerequisites:** Node.js 22, Yarn 1.x

```bash
yarn install
```

Build the shared types package first (required before running either server or client):

```bash
yarn workspace @shared/types build
```

**Start both server and client together:**

```bash
yarn dev:all
```

Or start them separately in two terminals:

```bash
# Terminal 1 — API server on http://localhost:3001
yarn workspace @server/api dev

# Terminal 2 — Next.js client on http://localhost:3000
yarn workspace @client/web dev
```

**Run backend tests:**

```bash
node_modules/.bin/vitest run packages/server/src/routes/players.test.ts
```

**Type-check everything:**

```bash
yarn type-check
```

---

## Project Structure

```
packages/
├── shared/          # @shared/types — Player, PlayersResponse, PlayerQueryParams, SortColumn
├── server/          # @server/api — Express API on port 3001
│   └── src/
│       ├── services/        # sleeperService.ts — Sleeper API fetch + TTL cache
│       ├── utils/           # playerFilters.ts — pure filter / sort / paginate functions
│       ├── routes/          # players.ts — thin Express router
│       └── cache.ts         # generic in-memory TTL cache
└── client/          # @client/web — Next.js app on port 3000
    └── src/
        ├── components/      # Filters, PlayerTable, PlayerModal, Pagination + barrel index
        ├── hooks/           # usePlayers, useMeta, useFavorites + barrel index
        ├── lib/             # api.ts (API_URL), nflConstants.ts (team/position names)
        └── pages/           # index.tsx — main page
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/players` | Paginated, filtered, sorted player list |
| `GET` | `/api/players/meta` | Distinct position / team / status values for dropdowns |
| `GET` | `/health` | Server health check |

**`/api/players` query params:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | number | 1 | |
| `limit` | number | 25 | |
| `sort` | `last_name` \| `first_name` \| `position` \| `status` \| `team` | — | |
| `order` | `asc` \| `desc` | `asc` | |
| `position` | string | — | exact match |
| `team` | string | — | exact match |
| `status` | string | — | exact match |
| `q` | string | — | case-insensitive substring on first + last name |

---

## Major Decisions & Alternatives Considered

### Server-side filtering, sorting, and pagination
All three happen on the server before the response is sent. The Sleeper payload is ~10 MB and ~10k records — sending the full dataset to the client on every request would be slow and wasteful. Server-side processing means the client always receives a small, ready-to-render page of results.

The alternative (client-side filtering on a single large fetch) is simpler to implement but falls apart on slow connections and makes sorting and search feel sluggish at scale.

### Separation of concerns in the server
The server is split into three layers: `sleeperService.ts` owns the Sleeper API fetch and cache, `playerFilters.ts` contains pure filter/sort/paginate functions with no I/O, and `routes/players.ts` is a thin router that wires them together. This makes the business logic independently testable without spinning up Express or hitting the network.

### In-memory cache with TTL
The Sleeper API is read-only and the data changes infrequently. A module-level `Map` with a 5-minute TTL is sufficient: zero dependencies, trivially fast, and the cache is populated on first request. Subsequent requests return in microseconds.

The alternative would be Redis or Memcached — appropriate for multi-process or distributed deployments, but heavy overhead for a single-process dev server.

### localStorage for favorites
Favorites are stored client-side in `localStorage` under `nfl_favorites`. This avoids any need for a user auth system or a write API while still persisting across sessions and page refreshes.

The alternative (server-side favorites) would require a user identity layer (at minimum a session cookie) and a persistence store — a significant scope increase for a feature that works just as well locally.

### Shared types package
`@shared/types` is the single source of truth for `Player`, `PlayersResponse`, `PlayerQueryParams`, and `SortColumn`. Both the server and client import from it, so a change to the data contract only needs to happen in one place.

### No UI component library
The UI is built with Tailwind CSS utility classes and plain HTML elements. This keeps the dependency footprint small, makes every style decision explicit and reviewable, and avoids the overhead of learning a library's component API under time pressure.

The alternative (a component library like MUI/shadcn) would provide more polish faster, but adds build configuration and makes the code harder to read for someone unfamiliar with the library's abstractions.

### Vitest over Jest
Vitest is zero-config with TypeScript and ESM — no Babel transforms, no `ts-jest` setup. `tsx` is already in the dev dependencies, so Vitest just works.

---

## What I'd Do With One More Hour

- **Infinite scroll** — replace the Prev/Next pagination with an intersection-observer-based infinite scroll for a smoother browsing experience
- **Broader test coverage** — add integration tests for the Express route itself (using `supertest`) and component tests for the React side (using `@testing-library/react`)
- **Debounced sort** — currently a sort click fires a request immediately; debouncing it slightly would avoid a cascade of requests when a user clicks quickly between columns
- **Next.JS Proper Implemintation** - I'd setup next JS to have a 1 source for all (server/client) to simplify things more, and have server-side rendering where it could be used. This is less code on the frontend and fast speeds all around
- **Mobile Updates** - While the page is responsive, I'd spend more time on organizing the table, possibly combining first/last name and removing some of the fields like either Position and/or Teams to only show the more important fields.

---

## What I Used AI For

**Used AI for:**
- Scaffolding boilerplate (Express server setup, Next.js page shell, hook structure)
- Generating the initial TypeScript interfaces from the Sleeper API response shape
- Drafting the initial test stubs for the pure filter/sort/paginate functions
- CSS layout for the table and modal
- Code organization refactor (splitting the server god file, deduplicating shared constants, adding barrel exports)

**Reviewed and adjusted manually:**
- The `Object.values()` conversion for the Sleeper response map — the API returns a plain object keyed by player ID, not an array; AI-generated code assumed an array
- Null handling throughout: many players have `null` team, position, or status, and naive sort/filter implementations break without explicit null guards
- The `noEmit: false` fix in `packages/shared/tsconfig.json` — the root tsconfig sets `noEmit: true` and the shared package inherits it, silently producing no output on build; this required reading the compiled output (or lack of it) to catch
- The `downlevelIteration` issue in the client — the Next.js tsconfig targets ES5 and spreading a `Set` fails at compile time; replaced with `Array.from()`
- Test fixture counts — two tests had wrong expected values due to incorrect manual counting; caught by running the suite
- Import corruption introduced by a bulk rename (a `replace_all` that hit a string it had already partially replaced); caught by reading the git diff before committing

