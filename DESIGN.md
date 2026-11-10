# Design guidelines

## Design reference
- **Source of truth for the UI direction:** the Dribbble shot ["Portfolio Website V1"](https://dribbble.com/shots/21766554-Portfolio-Website-V1) (id `21766554`; local reference copy: `.dribbble/portfolio-website-v1.png`, gitignored).
- The shot is fetched through the workspace `composio` MCP server (`https://connect.composio.dev/mcp` in `opencode.json`; its Dribbble toolkit replaces the retired local `dribbble` server) when a listing is available. **Verified limitation (2026-11-10):** Dribbble API v2 does not expose arbitrary shots — `GET /v2/shots/{id}` and `GET /v2/shots/popular` return `404 {"message":"Not found."}`; only `/v2/user/shots` (your own shots) works. `get_shot(21766554)` returns `404: Not found.`
- The shot image is fetched from `cdn.dribbble.com` via HTTP and stored under `.dribbble/` (gitignored/dockerignored, see `.gitignore`, `.dockerignore`).
- Figma design artifacts (local exports, screenshots, extracted design context) are written under `.figma/` (gitignored/dockerignored, see `.gitignore`, `.dockerignore`); the live design itself stays in Figma, accessed through the `figma` MCP server in `opencode.json`.
- **Live Figma file:** ["Portfolio"](https://www.figma.com/design/LzCr8gMi8aP1ZTBhnXaSJT) (file key `LzCr8gMi8aP1ZTBhnXaSJT`) — wireframes of both screens built from this spec: `Portfolio Colors` local variable collection (primary/secondary/ink/stage/surface, canvas IDs `3:3`–`3:7`), local components `Logo` (vector-imported from `svg/logo.svg`), `Corner Mark`, and `Stat Tile` (Components section `4:2`), and frames `01 · Home — Desktop` (`4:15`, 1440×960) and `02 · 404 — Desktop` (`4:16`, 1440×720).
- This is an **original implementation of the design language** (bento layout, palette, crop-mark accents), not a pixel clone: the shot's artwork/content (portrait, flamingo photo, Apple mark, "Jon Daniel" copy) is replaced by this project's own assets and `EXPO_PUBLIC_*` content. Stat numbers (251/156/172) are placeholder copy — wire real data before production.

## Layout (home, `src/app/index.js`)
- Stage: full-page light gray `bg-[#F1F1F2]`; one big white card `rounded-[2rem] md:rounded-[2.75rem]` centered with generous padding, `flex-col md:flex-row`.
- 404 screen (`src/app/+not-found.js`): same stage/panel language — giant `404` display title with black corner-bracket accent and a blue identity-style card (`Hmm...`, "not part of `EXPO_PUBLIC_TITLE`", dashed underline hint). Reuse the Tokens below; do not redefine values.
- Left rail: blue identity card (`bg-[#25F4EE] rounded-3xl`, dark `#161823` ink) headed by a `❖ About Me` chip; circular avatar on red (`bg-[#FE2C55]`) with `#161823` ring; `EXPO_PUBLIC_TITLE` in semibold Outfit; dark `#161823` circle badge (vinyl-style simplification); dashed underline for `EXPO_PUBLIC_DESCRIPTION` text.
- Right: giant display title (`EXPO_PUBLIC_TITLE`, `text-5xl md:text-8xl font-black tracking-tight`) with black corner-bracket accent, above a 2-row bento grid; tile heights implicit via `flex-1` rows with `gap-3 md:gap-4`.
- Tiles: featured tile on blue (`bg-[#25F4EE]`) with cover image; stacked stat tiles (`w-24 md:w-40`): blue `251 Projects` (dark text) over red `bg-[#FE2C55]` `156 Awards` (white text); row 2: dark `#161823` `Clients` tile + split `#161823`/blue tile — dark half with image, blue half `bg-[#25F4EE]` for `172 Global Design Awards.` (dark text).

## Tokens
- TikTok-inspired scheme: blue `#25F4EE` (**primary** — identity card, featured tile, stats tiles), red `#FE2C55` (**secondary** — avatar circle, awards stat), neutrals: rich black `#161823` (dark tiles, ink text), light gray `#F1F1F2` (stage), panel `#ffffff`.
- Ink rule: dark ink `text-[#161823]` on blue surfaces; white ink on red and `#161823` surfaces.
- Radii: tiles `rounded-2xl`, cards `rounded-3xl`, outer panel `rounded-[2rem] md:rounded-[2.75rem]`, circle badge/avatar `rounded-full`.
- Accents: crop-mark corner brackets top-right of every tile — `border-[#161823]/90` on blue surfaces, `border-white/90` elsewhere; dashed 1px underline for contact text (`#161823`/70 on blue, white/70 on dark).
- Dark mode: not part of the current reference — keep light-only until intentionally extended (`darkMode: "class"` is available).

## UI stack
- **Rendering:** React Native Web primitives (`View`, `Text`, `Image`, etc.) with **NativeWind v4** (`className`) and **Tailwind CSS v3**.
- **Global styles:** `src/stylesheets/global.css` (`@tailwind base/components/utilities`), wired via `metro.config.js` (`withNativeWind`) and Babel (`nativewind/babel` preset).
- **Dark mode:** Tailwind configured with `darkMode: "class"` (`tailwind.config.js`); current UI is light-themed.

## Typography
- **Primary font:** `Outfit` (variable font) loaded in `src/app/_layout.js` from `ttf/Outfit-VariableFont_wght.ttf` via `expo-font`.
- **Tailwind family:** `font-outfit` → `Outfit, sans-serif` (`tailwind.config.js` theme.extend). Use `font-outfit` for all branded text.
- **Scale (home):** display `text-5xl md:text-8xl font-black`; identity `text-2xl md:text-4xl` (semibold title); stats `text-2xl md:text-4xl font-extrabold`; copy labels `text-sm–xl`.

## Extending tokens & styles
- Add new tokens (colors, fonts, spacing) under `tailwind.config.js` `theme.extend` rather than ad-hoc inline styles; reuse presets (`nativewind/preset`).
- New utilities belong in `className` (React Native Web components).
- New fonts go in `ttf/` and load with `useFonts` in the layout, then map to a `fontFamily` token in `theme.extend`.
- Match the reference palette: TikTok-style blue `#25F4EE` primary / red `#FE2C55` secondary on `#F1F1F2`/`#161823` neutrals; keep crop-mark accents consistent on new tiles.

## Assets & branding
- Logo: `png/logo.png` (used on home tiles, PWA manifest icon). Vector source in `svg/logo.svg` — blue `#25F4EE` bento tile (primary), heavy white geometric `P` (echoing the black display type), white corner crop-mark chevron top-right (the tile accent motif; all colors from the Tokens below). Render the PNG from the SVG with `rsvg-convert -w 1024 -h 1024 svg/logo.svg -o png/logo.png` after editing the source.
- Favicon configured in `app.config.js` (`web.favicon: "png/logo.png"`).
- App name/description come from `EXPO_PUBLIC_TITLE`/`EXPO_PUBLIC_DESCRIPTION` (propagated to HTML/meta/manifest via config).

## Accessibility & document metadata
- Provide `accessibilityLabel` on meaningful images (e.g. logo on home tiles).
- `src/app/+html.js` sets `lang="en"`, viewport, charset, meta description, and links `/manifest.json`.
- Keep stat/badge text readable with sufficient contrast (dark ink on primary blue, white ink on secondary red and `#161823`).
