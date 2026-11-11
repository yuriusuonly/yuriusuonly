# AGENTS.md

## Stack & scope
- Expo (SDK ~58) + Expo Router app targeting **web only** (`app.config.js` sets `platforms: ["web"]`, `web.output: "static"`, `bundler: "metro"` with `apiRoutes: true`).
- UI/styling: React 19, React Native Web, NativeWind v4 + Tailwind v3. Global CSS entry is `src/stylesheets/global.css` (wired in `metro.config.js`).
- Plain JavaScript codebase: no TypeScript dependency and no lint/test/typecheck scripts in the repo; the only CI is the push-to-deploy Expo Hosting workflow on `portfolio` pushes, which exports the web build on the GitHub runner and deploys only the artifact to EAS via `npm run eas:deploy` (see `README.md` → Deployment). Types are documented with JSDoc (`@module`, `@typedef`/`@type`, `@param`, `@returns` — never `@example`).

## Commands (from `package.json`)
- `npm run expo:start` — starts dev server on `$URL_PORT` after `set -a && . ./.env && set +a`; requires `.env` (notably `URL_PORT`).
- `npm run expo:start:tunnel` — dev server with tunnel (no `.env` export wrapper).
- `npm run expo:build` — `expo export --platform web --output-dir build` (static export to `build/`).
- `npm run expo:serve` — serves `build/` on `$URL_PORT` (loads `.env` like `expo:start`).
- `npm run opencode` — launches OpenCode (loads `.env` like `expo:start`).
- Caddy (HTTPS reverse proxy to local serve): `npm run caddy` — loads `.env` natively via Caddy's `--envfile` flag; `npm run caddy:trust` — plain command, needs no env since it uses the default admin endpoint (`localhost:2019`, kept on in `Caddyfile`).
- Docker: `npm run docker:build|up|down|logs` (`docker compose`, uses `.env` via interpolation and build args `URL_PORT`/`URL_PROXY_PORT`); `npm run docker` runs the full cycle (`docker:build` && `docker:up` && `docker:logs` — stays attached to the logs).

## Project structure / conventions
- **No absolute paths anywhere in the project** (source, configs, docs). Use workspace-relative paths; exception: `node_modules/` internals (e.g. an installed package's own config) may do what the tooling requires.
- Routing uses Expo Router file-based routes under `src/app/` (e.g. `_layout.js`, `index.js`, `+not-found.js`, `+html.js`, and dimension routes like `src/app/projects/index.js` — thin re-exports of their screens). Screens live under `src/screens/` (`root.js` — the home screen; `projects/`, `awards/`, `career/` — one folder per dimension with its screen named after the folder, e.g. `projects.js`, plus flat content files per card: `projects/` holds `tiptap.js`, `dino-dash.js`, `superchat.js`, `mojisumi.js`; `awards/` holds `cs50x.js`; `career/` holds `lifesaver-medicords.js`).
- Shared modules live under `src/shared/` (`config.js` reads `EXPO_PUBLIC_*` env vars; `theme.js` exports base color tokens and the `DimensionTheme` shape only — screens compose their own dimension themes internally from `COLORS`). Zustand stores live under `src/stores/` (`expansion-store.js` — overture origins + collapse exits). Reusable components live under `src/components/` (`tilt-card.js`, `animated-background.js`, `domain-shell.js`, `list.js`).
- Motion stack: React Native `Animated` + DOM pointer events only — no WebGL (`three` was removed; keep the 2D approach); `zustand` for expansion overture state.
- API/special routes follow Expo Router web conventions in filenames: `src/app/api/health+api.js`, `manifest.json+api.js`, `robots.txt+api.js`, `service-worker.js+api.js`.
- Shared app config: `src/shared/config.js` reads `EXPO_PUBLIC_*` env vars; `app.config.js` derives app name/version from `EXPO_PUBLIC_TITLE`/`EXPO_PUBLIC_VERSION` and the Expo/EAS slug from `EAS_PROJECT_SLUG`.
- Assets: `png/`, `jpg/` (photos, e.g. `jpg/avatar.jpg` — the home About Me avatar), `svg/`, `ttf/` (custom font `Outfit` loaded in `src/app/_layout.js` from `ttf/Outfit-VariableFont_wght.ttf`). Local design references (e.g. `.dribbble/portfolio-website-v1.png`, gitignored) may live under `.dribbble/`; the Dribbble shot link and author are documented in `DESIGN.md`.
- MCP: `opencode.json` configures the local `dribbble` MCP server (`dribbble-mcp` via `npx`) for Dribbble access when needed; it uses Dribbble OAuth and typically requires `DRIBBBLE_CLIENT_ID`/`DRIBBBLE_CLIENT_SECRET` in the environment (sourced from `.env` per runtime), not hardcoded.

## Runtime & deployment notes
- `.env` holds both `EXPO_PUBLIC_*` (bundled/client-visible) and server/proxy vars (`URL_PROTOCOL`, `URL_HOST`, `URL_PORT`, `URL_PROXY_PROTOCOL`, `URL_PROXY_HOST`, `URL_PROXY_PORT`, `URL_BASE`, `URL_API`), Expo/EAS deploy auth and linkage (`EAS_TOKEN` — remapped to the `EXPO_TOKEN` env name `eas-cli` reads by the `eas:initialize`/`eas:deploy` scripts, which invoke `eas-cli` via `npx` — `EAS_PROJECT_ID` for `app.config.js` → `extra.eas`, `EAS_PROJECT_SLUG` for `expo.slug`), deploy-push config (`GH_TOKEN` and `GH_REPO` for the `github:*` scripts). Several npm scripts source `.env` directly via `set -a && . ./.env && set +a` (needed: Expo CLI loads `.env` itself but ignores its own `PORT` when picking the dev-server port, so the shell must expand `$URL_PORT` first); `caddy` uses Caddy's native `--envfile`, `caddy:trust` needs no env, and `opencode.json` loads it via Node's `--env-file` flag — keep `.env` POSIX-compatible (simple `KEY=value` lines; `--env-file` requires Node ≥ 20.6).
- `Dockerfile` + `docker-compose.yml`: the image builds the static export (`npm run expo:build`) and defines no CMD — both service commands are plain argv arrays in compose: `server` runs `expo serve` with `--port ${URL_PORT}` interpolated from `.env`, `caddy` runs the HTTPS edge with `BACKEND_HOST=server` for the `{$BACKEND_HOST:localhost}` Caddyfile placeholder. Compose consumes `URL_PORT`/`URL_PROXY_PORT` as build args and runtime env for the placeholders. Server healthcheck hits `http://localhost:$URL_PORT/api/health` (wget, argv form — no shell).
- `build/` and `node_modules/` are generated/installed artifacts (gitignored). Edit source under `src/` and config at repo root, not `build/`.
 - `EXPO_PUBLIC_*` edits reach the dev server automatically (Expo CLI restarts on `.env` changes), but `expo export` can keep Metro's transformer cache across runs even with `--clear` — if a rebuilt bundle still shows previously inlined strings, delete `.expo/web/cache` (and the `build/` output dir, which `expo export` does not clean) and export again.
- `src/app/_layout.js` registers `/service-worker.js` on mount (client-side); service worker is implemented via the Expo Router `service-worker.js+api.js` route.

## Maintenance
- Whenever possible, update `README.md`, `CONTRIBUTING.md`, and `DESIGN.md` to reflect relevant changes (behavior, config, conventions, UI/tokens, workflows).
- Whenever possible, update `.*ignore*` files (e.g. `.gitignore`, `.dockerignore`) when new generated artifacts, local files, or build outputs should be excluded.
- Follow the commit rules in `CONTRIBUTING.md` (**Commits & PRs**): commit automatically as work completes, using the tagged types and message format defined there — but never push automatically; pushes are always explicit requests.
- Do not duplicate repeated mentions/references across or within the docs. State each fact once in its canonical doc, and reference it elsewhere instead of restating it (e.g. the project tree lives in `README.md`; `CONTRIBUTING.md` links to it).
