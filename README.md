# Portfolio

A web-only Expo Router app styled with NativeWind/Tailwind (React Native Web + NativeWind v4 + Tailwind v3, React 19). Static web export with server-rendered API routes; deployable via Node (expo serve) + Caddy or Docker.

Repository: `git@github.com:yuriusuonly/yuriusuonly.git` (default branch: `portfolio`).

Docs:
- [CONTRIBUTING.md](./CONTRIBUTING.md) — rules, conventions, structure, workflows
- [DESIGN.md](./DESIGN.md) — UI/UX guidelines and design tokens
- [AGENTS.md](./AGENTS.md) — agent/automation guidance

## Configuration

`.env` is the **single source of truth** for project configuration (no fallback values elsewhere). Required for dev/serve/Caddy/Docker. `.env` keys:

| Key | Purpose |
| --- | --- |
| `EXPO_PUBLIC_TITLE` | App/site title (client-visible). Used for Expo app `name`/`slug`/`scheme` in `app.config.js`, UI/config (`src/shared/config.js`), document title/meta, and PWA manifest. |
| `EXPO_PUBLIC_DESCRIPTION` | App/site description (client-visible). Used in shared config, HTML meta description, and PWA manifest. |
| `EXPO_PUBLIC_VERSION` | App version string (client-visible). Used for Expo app `version` in `app.config.js` and exposed via shared config. |
| `PROTOCOL` | Protocol for the app/service environment (e.g. `https`). |
| `HOST` | Host/interface the app/service is associated with (e.g. `0.0.0.0`). |
| `PORT` | HTTP port for the Expo dev/serve process; scripts and the Docker/Caddy proxy upstream target this port. |
| `HTTPS_PORT` | HTTPS port served by Caddy in local proxy and Docker runtime. |
| `BASE_URL` | Base URL/path prefix for the app (project-level config value). |
| `API_URL` | API base/path value for the project (project-level config value). |
| `DRIBBBLE_CLIENT_ID` | OAuth app Client ID for the local `dribbble` MCP server (`opencode.json` tooling; placeholder until registered at dribbble.com/account/applications/new). |
| `DRIBBBLE_CLIENT_SECRET` | OAuth app Client Secret for the local `dribbble` MCP server; keep secret. |

Notes:
- Keep `.env` **POSIX-compatible** (simple `KEY=value` lines): every consumer loads it natively — `set -a` sourcing in `expo:start`/`expo:serve`, Caddy's `--envfile` in `caddy:run`, and Node's `--env-file` in `opencode.json`.
- `EXPO_PUBLIC_*` values are bundled into the client — never put secrets there.
- Docker: `PORT`/`HTTPS_PORT` are passed as build args from `.env` via `docker-compose.yml` and consumed as runtime env for the Caddyfile placeholders.

## Local development

```bash
npm ci                    # install deps (no fallback; use lockfile)
npm run expo:start        # loads .env; runs Expo dev server on $PORT
npm run expo:start:tunnel # tunnel mode (when LAN access is blocked)
```

Dev server availability is announced by Expo CLI in the terminal; `PORT` in `.env` controls the port.

## Build & serve (static)

```bash
npm run expo:build  # exports to build/ (--platform web, Metro bundler)
npm run expo:serve  # serves build/ on $PORT (loads .env)
```

`build/` is gitignored/generated — do not edit by hand.

## Local HTTPS (Caddy)

```bash
npm run caddy:run    # run Caddy (proxies https://localhost:$HTTPS_PORT -> localhost:$PORT)
npm run caddy:trust  # trust local CA in system (needed for SW in some browsers)
```

- Caddyfile admin endpoint stays enabled (`localhost:2019`) because `caddy:trust` needs it; disabling it breaks `caddy:trust`.
- The automatic HTTP→HTTPS redirect server is disabled (binds `:80`, needs root); TLS serves on `$HTTPS_PORT` only.

## Docker

```bash
npm run docker:build # compose build (no cache)
npm run docker:up    # start containers (detached)
npm run docker:logs  # follow logs
npm run docker:down  # stop containers
```

- Two services share one multi-stage image (see `docker-compose.yml`), which defines no CMD — all runtime commands are plain argv arrays in compose: `server` runs `expo serve` with `--port ${PORT}` interpolated from `.env`, and `caddy` is the HTTPS edge (`BACKEND_HOST=server` points the Caddyfile's `{$BACKEND_HOST:localhost}` placeholder at the server service).
- `.env` drives everything via compose interpolation (`${PORT}`/`${HTTPS_PORT}`) and build args; restart policy is `unless-stopped`.
- Healthcheck lives on the `server` service and hits `http://localhost:$PORT/api/health` (returns `{status: "ok", timestamp, uptime}`); `caddy` waits for `server` to become healthy via `depends_on` conditions.

## Routes & endpoints

| Route | Source | Purpose |
| --- | --- | --- |
| `/` | `src/app/index.js` | Home page: title, description, and app logo |
| `404` (fallback) | `src/app/+not-found.js` | Not-found screen for unmatched routes |
| document shell | `src/app/+html.js` | Custom HTML document (charset/viewport/meta/manifest link) |
| `/api/health` | `src/app/api/health+api.js` | JSON `{status, timestamp, uptime}`; `Cache-Control: no-store`; used by Docker healthcheck |
| `/manifest.json` | `src/app/manifest.json+api.js` | PWA Web App Manifest (name, description, icon) |
| `/robots.txt` | `src/app/robots.txt+api.js` | robots.txt (allows all user agents) |
| `/service-worker.js` | `src/app/service-worker.js+api.js` | Minimal PWA service worker; registered on app mount by `src/app/_layout.js` |

## Project structure (tree)

```text
./
├── AGENTS.md
├── Caddyfile
├── README.md
├── CONTRIBUTING.md
├── DESIGN.md
├── LICENSE.txt
├── app.config.js
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── opencode.json
├── package.json
├── package-lock.json
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .env
├── .gitignore
├── png/
│   └── logo.png
├── src/
│   ├── app/
│   │   ├── _layout.js
│   │   ├── +html.js
│   │   ├── +not-found.js
│   │   ├── index.js
│   │   ├── api/
│   │   │   └── health+api.js
│   │   ├── manifest.json+api.js
│   │   ├── robots.txt+api.js
│   │   └── service-worker.js+api.js
│   ├── shared/
│   │   └── config.js
│   └── stylesheets/
│       └── global.css
├── svg/
│   └── logo.svg
└── ttf/
    └── Outfit-VariableFont_wght.ttf
```

`babel.config.js`, `metro.config.js`, `tailwind.config.js` are JavaScript toolchain configs (React Native components use JSX inside `.js` files). The codebase is plain JavaScript with JSDoc-typed interfaces — no `tsconfig.json` or `*.d.ts` files are present or required in this JS-only setup. `node_modules/`, `build/`, `.expo/`, `.git?/`, logs, `.DS_Store` are generated/ignored (see `.gitignore`, `.dockerignore`).

## Troubleshooting

- **Port already in use** (`$PORT` or `$HTTPS_PORT`) — see what binds to these in `.env`; adjust `.env` and rerun.
- **`caddy:trust` fails** with `dial tcp [::1]:2019: connect: connection refused` — Caddy admin endpoint (`localhost:2019`) must be enabled in the `Caddyfile`.
- **Service Worker changes not visible** — the worker (`/service-worker.js`) is served with `Cache-Control: no-cache` but `skipWaiting`/`clients.claim` are aggressive; hard-refresh, then unregister the SW in DevTools > Application > Service Workers if stale.
- **`docker compose build` changes not picked up** — `docker:build` intends `--no-cache`; rebuild anytime `.env` ports or `Dockerfile` stages change.

