# Yuriusu

[![Expo Hosting deploy](https://img.shields.io/github/actions/workflow/status/yuriusuonly/yuriusuonly/.github%2Fworkflows%2Fdeploy.yml?branch=portfolio&label=Expo%20Hosting%20deploy)](https://github.com/yuriusuonly/yuriusuonly/actions/workflows/deploy.yml)
[![Expo SDK 58](https://img.shields.io/badge/Expo%20SDK-58-000000?logo=expo&logoColor=white)](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough.md)

A web-only Expo Router app styled with NativeWind/Tailwind (React Native Web + NativeWind v4 + Tailwind v3, React 19). Static web export with server-rendered API routes; deployable via Expo Hosting (EAS), Node (expo serve) + Caddy, or Docker.

**2D interactive portfolio** — pressing a bento tile expands its "domain" from the exact click point into a themed dimension page (Projects / Awards / Clients) with an animated drifting-blob background, pointer-tilted tiles, and a reverse "collapse" when you head home (state via `zustand`, no WebGL). Details in [DESIGN.md](./DESIGN.md).

Repository: `git@github.com:yuriusuonly/yuriusuonly.git` (default branch: `portfolio`, the only branch).

Docs:
- [CONTRIBUTING.md](./CONTRIBUTING.md) — rules, conventions, structure, workflows
- [DESIGN.md](./DESIGN.md) — UI/UX guidelines and design tokens
- [AGENTS.md](./AGENTS.md) — agent/automation guidance

## Configuration

`.env` is the **single source of truth** for project configuration (no fallback values elsewhere). Required for dev/serve/Caddy/Docker. `.env` keys:

| Key | Purpose |
| --- | --- |
| `EXPO_PUBLIC_TITLE` | App/site title (client-visible). Used for Expo app `name` in `app.config.js`, UI/config (`src/shared/config.js`), document title/meta, and PWA manifest. |
| `EXPO_PUBLIC_DESCRIPTION` | App/site description (client-visible). Used in shared config, HTML meta description, and PWA manifest. |
| `EXPO_PUBLIC_VERSION` | App version string (client-visible). Used for Expo app `version` in `app.config.js` and exposed via shared config. |
| `URL_PROTOCOL` | Protocol for the app/service environment (e.g. `http`). |
| `URL_HOST` | Host/interface the app is associated with (e.g. `0.0.0.0`). |
| `URL_PORT` | HTTP port for the Expo dev/serve process; scripts and the Docker/Caddy proxy upstream target this port. |
| `URL_PROXY_PROTOCOL` | Protocol for the TLS proxy edge (e.g. `https`). |
| `URL_PROXY_HOST` | Host/interface the TLS proxy edge is associated with (e.g. `0.0.0.0`). |
| `URL_PROXY_PORT` | HTTPS proxy port served by Caddy in local proxy and Docker runtime. |
| `URL_BASE` | Base URL/path prefix for the app (project-level config value). |
| `URL_API` | API base/path value for the project (project-level config value). |
| `EAS_TOKEN` | EAS access token consumed by `eas-cli` (invoked via `npx` by the `eas:*` scripts) — the `eas:initialize`/`eas:deploy` scripts remap it to the `EXPO_TOKEN` env name that `eas-cli` reads from the sourced `.env` (locally and in CI); create at expo.dev → Account settings → Access tokens; keep secret. |
| `EAS_PROJECT_ID` | Expo Hosting project id printed by `npm run eas:initialize`; consumed by `app.config.js` (`extra.eas.projectId`). |
| `EAS_PROJECT_SLUG` | Expo/EAS project slug (`yuriusuonly`) — must match the remote project; consumed by `app.config.js` (`expo.slug`). |
| `GH_REPO` | Exact HTTPS repository URL (`https://github.com/yuriusuonly/yuriusuonly.git`), used by `npm run github:secrets` (gh resolves the URL) and `npm run github:remote`. |
| `GH_TOKEN` | GitHub PAT used by the `github:secrets` script (`gh` reads it automatically from the sourced environment); keep secret. |

Notes:
- Keep `.env` **POSIX-compatible** (simple `KEY=value` lines): every consumer loads it natively — `set -a` sourcing in `expo:start`/`expo:serve`, Caddy's `--envfile` in `caddy`, and Node's `--env-file` in `opencode.json`.
- `EXPO_PUBLIC_*` values are bundled into the client — never put secrets there.
- Docker: `URL_PORT`/`URL_PROXY_PORT` are passed as build args from `.env` via `docker-compose.yml` and consumed as runtime env for the Caddyfile placeholders.

## Local development

```bash
npm ci                    # install deps (no fallback; use lockfile)
npm run expo:start        # loads .env; runs Expo dev server on $PORT
npm run expo:start:tunnel # tunnel mode (when LAN access is blocked)
npm run opencode          # launch OpenCode (loads .env)
```

Dev server availability is announced by Expo CLI in the terminal; `URL_PORT` in `.env` controls the port.

## Build & serve (static)

```bash
npm run expo:build  # exports to build/ (--platform web, Metro bundler)
npm run expo:serve  # serves build/ on $URL_PORT (loads .env)
```

`build/` is gitignored/generated — do not edit by hand.

## Local HTTPS (Caddy)

```bash
npm run caddy       # run Caddy (proxies https://localhost:$URL_PROXY_PORT -> localhost:$URL_PORT)
npm run caddy:trust  # trust local CA in system (needed for SW in some browsers)
```

- Caddyfile admin endpoint stays enabled (`localhost:2019`) because `caddy:trust` needs it; disabling it breaks `caddy:trust`.
- The automatic HTTP→HTTPS redirect server is disabled (binds `:80`, needs root); TLS serves on `$URL_PROXY_PORT` only.

## Deployment (Expo Hosting)

```bash
npm run eas:initialize # one-time: link the project; paste the printed Project ID into .env (EAS_PROJECT_ID)
npm run eas:deploy  # exports the web build locally, then deploys build/ to production (EAS_TOKEN auth)
```

- **Pipeline:** `npm run eas:deploy` (sourced with `.env`) exports the web build (`npm run expo:build` → `build/`), then runs `eas deploy --non-interactive --prod --export-dir build` via `npx eas-cli` to upload **only the finished build artifact** and publish it to production Expo Hosting — EAS runs no builds, so the Free plan's CI/CD minutes stay untouched.
- **Automated:** the GitHub Actions workflow `.github/workflows/deploy.yml` runs on push to `portfolio` (or manual dispatch): it restores `.env` from the `DOT_ENV` repository secret, then runs `npm run eas:deploy` — the export runs on the GitHub runner (free for public repositories), and only the artifact is sent to EAS. Nothing is committed or pushed back to the repository. Update/push are manual via `npm run github:deploy` — it refreshes the `DOT_ENV` secret against `$GH_REPO` first, then runs `git -c "credential.helper=!gh auth git-credential" push origin HEAD` — the credential helper — feeds the `GH_TOKEN` in `.env` to git over HTTPS — no SSH key is needed, and `HEAD` pushes the currently checked-out branch to its same-name branch on `origin` with no branch name hardcoded. Configure the remote once with `npm run github:remote` (adds `origin` at the exact `GH_REPO` HTTPS URL; it errors on rerun since `origin` already exists).
- `eas-cli` (invoked via `npx` by the `eas:*` scripts) authenticates with only the `EAS_TOKEN` access token in `.env` — the scripts remap it to the `EXPO_TOKEN` env name `eas-cli` reads from the sourced environment (no interactive login — create at expo.dev → Account settings → Access tokens); `app.config.js` supplies the linked project via `extra.eas.projectId` (from `EAS_PROJECT_ID` in `.env` — the config is fully env-derived and cannot be written to by the CLI), and its `slug` comes from `EAS_PROJECT_SLUG` in `.env` (must match the remote EAS project). Because the export runs wherever `eas` runs (GitHub runner or this machine) with `.env` restored, no variables need mirroring in the EAS Dashboard environment.
- `eas.json` pins the CLI version (`cli.version` `>= 27.6.0`, matching the `eas-cli` version used by the `eas:*` scripts) and declares an empty `production` build profile as a guard — no EAS builds run under the artifact-only pipeline.
- Keep the EAS GitHub integration disconnected while the GitHub Actions workflow is the push trigger (the workflow file's `on.push` would double-run otherwise).
- The local `web.output: "static"` export still drives the Node/Docker runtime; hosted API routes would need the `server` output mode on Expo Hosting instead.

## Docker

```bash
npm run docker:build # compose build (no cache)
npm run docker:up    # start containers (detached)
npm run docker:logs  # follow logs
npm run docker:down  # stop containers
npm run docker       # full cycle: docker:build && docker:up && docker:logs (stays attached to logs)
```

- Two services share one multi-stage image (see `docker-compose.yml`), which defines no CMD — all runtime commands are plain argv arrays in compose: `server` runs `expo serve` with `--port ${URL_PORT}` interpolated from `.env`, and `caddy` is the HTTPS edge (`BACKEND_HOST=server` points the Caddyfile's `{$BACKEND_HOST:localhost}` placeholder at the server service).
- `.env` drives everything via compose interpolation (`${URL_PORT}`/`${URL_PROXY_PORT}`) and build args; restart policy is `unless-stopped`.
- Healthcheck lives on the `server` service and hits `http://localhost:$URL_PORT/api/health` (returns `{status: "ok", timestamp, uptime}`); `caddy` waits for `server` to become healthy via `depends_on` conditions.

## Routes & endpoints

| Route | Source | Purpose |
| --- | --- | --- |
| `/` | `src/app/index.js` | Home page: bento-grid portfolio with portal tiles to dimension screens |
| `/projects` | `src/app/projects/index.js` | Projects dimension page (themed highlights + return portal) |
| `/awards` | `src/app/awards/index.js` | Awards dimension page (themed highlights + return portal) |
| `/clients` | `src/app/clients/index.js` | Clients dimension page (themed highlights + return portal) |
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
├── .github/
│   └── workflows/
│       └── deploy.yml
├── Caddyfile
├── README.md
├── CONTRIBUTING.md
├── DESIGN.md
├── eas.json
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
│   │   ├── awards/
│   │   │   └── index.js
│   │   ├── clients/
│   │   │   └── index.js
│   │   ├── projects/
│   │   │   └── index.js
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

- **Port already in use** (`$URL_PORT` or `$URL_PROXY_PORT`) — see what binds to these in `.env`; adjust `.env` and rerun.
- **`caddy:trust` fails** with `dial tcp [::1]:2019: connect: connection refused` — Caddy admin endpoint (`localhost:2019`) must be enabled in the `Caddyfile`.
- **Service Worker changes not visible** — the worker (`/service-worker.js`) is served with `Cache-Control: no-cache` but `skipWaiting`/`clients.claim` are aggressive; hard-refresh, then unregister the SW in DevTools > Application > Service Workers if stale.
- **`docker compose build` changes not picked up** — `docker:build` intends `--no-cache`; rebuild anytime `.env` ports or `Dockerfile` stages change.

