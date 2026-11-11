# Design guidelines

## Design reference
- **Visual inspiration (design language):** [“Portfolio Website V1”](https://dribbble.com/shots/21766554-Portfolio-Website-V1) by [Jon Daniel](https://dribbble.com/jondaniel) on Dribbble (shot id `21766554`). This project’s bento layout, palette, and crop-mark accents are an original implementation inspired by that shot’s design language; the shot’s own artwork/content (e.g. portrait, flamingo photo, Apple mark, “Jon Daniel” copy) is not used — our assets and `EXPO_PUBLIC_*` content replace it.
- **Local reference:** a local copy of the shot image may be stored as `.dribbble/portfolio-website-v1.png` (gitignored). The `.dribbble/` directory and its contents are local-only references (gitignored/dockerignored).
- **Dribbble MCP:** the workspace `dribbble` MCP server is configured in `opencode.json` (local `dribbble-mcp` via `npx`) for Dribbble access when needed; it uses Dribbble API OAuth and typically requires `DRIBBBLE_CLIENT_ID`/`DRIBBBLE_CLIENT_SECRET` in the environment. Dribbble API v2 access is limited to the authenticated context, so arbitrary public shot assets may still need to be added locally; the link/author above and any local copy in `.dribbble/` are the canonical references.

## 2D & Motion (all screens)
- **Structure:** every screen renders inside a `DomainShell` (`src/components/domain-shell.js`) — themed animated background plus the DOM content layer. `src/shared/theme.js` exports only base color tokens (`COLORS`) and the shared `DimensionTheme` shape; each screen composes its own theme internally from those tokens (home in `src/app/index.js`, dimensions in `src/app/{projects,awards,clients}/index.js`, void in `src/app/+not-found.js`), with `accent`, `void` (backdrop), `shapes` (blob palette), and light colors. Keep scene colors composed from `COLORS` rather than scattered ad-hoc values.
- **Animated background:** `src/components/animated-background.js` — the themed void with slow, drifting blurred blobs in brand colors (deterministic placement, `Animated` loops, no WebGL, prerender-safe). The 404 uses the `calm` variant (4 blobs instead of 8).
- **Expansion origin:** portal/card presses capture the exact pointer position (`clientX/clientY` → normalized in `src/stores/expansion-store.js` handoffs); every disc — forward or reverse — grows/shrinks from that precise point.
- **Tilt:** bento tiles and dimension tiles wrap in `TiltCard` (`src/components/tilt-card.js`) — pointer-tilt (≤10°) with a spring return, bound to the react-native-web DOM node. Reduced motion (`prefers-reduced-motion: reduce`) disables the tilt and the overture; tile presses keep their `active:opacity-90` feedback.
- **Domain expansion & collapse:** pressing a portal card grows that tile's accent disc from the click on the current screen until it covers it (~340ms), then navigates; the destination mounts **already covered** by the same disc at that same point and dissolves it into the new environment (~850ms). Going back is a single reverse animation anchored to the “Collapse domain” press: the leaving dimension’s accent is staged at that press point and Home mounts covered, shrinking the disc back into that pointer while fading (~700ms) — no intermediate cover on the leaving screen and never at the original open position. Staged via the store’s `setEntryStage`/`setExitStage` + `clearStages` (shells snapshot-read non-destructively so React's double-invoked initializers never drop the pointer origin). Cold loads/browser-back mount with no overture. Dimension pages keep a “Collapse domain · Home” portal back.
- **Interaction rule:** the home tiles are portals — design future screens as shells with a theme, not standalone flat pages.

## Layout (home, `src/app/index.js`)
- Stage: the home dimension (theme composed in `src/app/index.js` from `src/shared/theme.js` base tokens) paints the stage; DOM content = one big white card `rounded-[2rem] md:rounded-[2.75rem]` centered with generous padding, `flex-col md:flex-row`.
- Left rail: blue identity card (`bg-[#25F4EE] rounded-3xl`, dark `#161823` ink) headed by a `❖ About Me` chip; circular avatar on red (`bg-[#FE2C55]`) with `#161823` ring; `EXPO_PUBLIC_TITLE` in semibold Outfit; dark `#161823` circle badge (vinyl-style simplification); dashed underline for `EXPO_PUBLIC_DESCRIPTION` text.
- Right pane: fills the remaining area with its card tops aligned to the left cyan card (a spacer mirrors the left “About Me” chip offset). Contains one large black `#161823` featured projects portal tile (`flex-1`) and two smaller stacked stat portal tiles beside it (`w-24 md:w-40`): blue `251 Projects` (dark text, `border-[#161823]/90` mark) over red `bg-[#FE2C55]` `156 Awards` (white text). No large display title and no row below; the large tile uses the white corner mark and opens the projects dimension, the stat tiles open projects/awards.
- Dimension pages (`src/app/{projects,awards,clients}/index.js`): themed content row + return portal under the `❖ <Dimension>` label. Projects shows only that label plus real project cards (TipTap, DinoRun, Superchat — icon avatar, title, description, stack, GitHub/live links; two half-width cards per desktop row, the last card on its own row, stacked on mobile) — no display headline; awards/clients still use the accent display headline + tagline + three tilting highlight tiles (sector/award/category placeholders — wire real data before production).
- 404 screen (`src/app/+not-found.js`): the void dimension shell (void theme composed locally, calm variant) with the giant `404` display title with black corner-bracket accent and a blue identity-style card (`Hmm...`, "not part of `EXPO_PUBLIC_TITLE`", dashed underline hint), portal back home. Reuse the base tokens below; compose themes consistently from `COLORS`.

## Tokens
- Tailwind/consumed values: TikTok-inspired scheme: blue `#25F4EE` (**primary** — identity card, featured tile, stats tiles), red `#FE2C55` (**secondary** — avatar circle, awards stat), neutrals: rich black `#161823` (dark tiles, ink text), light gray `#F1F1F2` (stage), panel `#ffffff`.
- Runtime theme: `src/shared/theme.js` exports the base palette (`COLORS`) and `DimensionTheme` shape only. Each screen composes its dimension theme internally from `COLORS` (and local accents) and passes it to `DomainShell`; motion/overlay layers read from the provided theme. Tailwind classes stay the styling source for markup.
- Ink rule: dark ink `text-[#161823]` on blue surfaces; white ink on red and `#161823` surfaces.
- Radii: tiles `rounded-2xl`, cards `rounded-3xl`, outer panel `rounded-[2rem] md:rounded-[2.75rem]`, circle badge/avatar `rounded-full`.
- Accents: crop-mark corner brackets top-right of every tile — `border-[#161823]/90` on blue surfaces, `border-white/90` elsewhere; dashed 1px underline for contact text (`#161823`/70 on blue, white/70 on dark).
- Dark mode: not part of the current reference — keep light-only until intentionally extended (`darkMode: "class"` is available).

## UI stack
- **Rendering:** React Native Web primitives (`View`, `Text`, `Image`, etc.) with **NativeWind v4** (`className`) and **Tailwind CSS v3**.
- **Global styles:** `src/stylesheets/global.css` (`@tailwind base/components/utilities`), wired via `metro.config.js` (`withNativeWind`) and Babel (`nativewind/babel` preset).
- **Motion layer:** React Native `Animated` + DOM pointer events (tilt, drifting blobs, overture discs; no WebGL/no canvas); **state:** `zustand` (`src/stores/expansion-store.js` — overture origins + collapse exits); React-19 compatible.
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
- Logo: `png/logo.png` (used on home tiles, PWA manifest icon). Vector source in `svg/logo.svg` — dark `#161823` bento tile with a bold geometric letter `Y` in TikTok’s chromatic-aberration style (red `#FE2C55` and cyan `#25F4EE` offset highlights behind a white foreground). Render the PNG from the SVG with `rsvg-convert -w 1024 -h 1024 svg/logo.svg -o png/logo.png` after editing the source.
- TipTap project icon: `png/tiptap-icon.png` (from the TipTap repository; shown as an app-icon badge on the /projects project card).
- DinoRun project icon: `png/dinorun-icon.png` (a dino sprite frame from the game, nearest-neighbor upscaled onto a white badge; shown as an avatar on the /projects project card).
- Superchat project icon: `png/superchat-icon.png` (rasterized from the repository's `source/icon.svg` onto a white badge; shown as an avatar on the /projects project card).
- Favicon configured in `app.config.js` (`web.favicon: "png/logo.png"`).
- App name/description come from `EXPO_PUBLIC_TITLE`/`EXPO_PUBLIC_DESCRIPTION` (propagated to HTML/meta/manifest via config).

## Accessibility & document metadata
- Provide `accessibilityLabel` on meaningful images (e.g. logo on home tiles).
- `src/app/+html.js` sets `lang="en"`, viewport, charset, meta description, and links `/manifest.json`.
- Keep stat/badge text readable with sufficient contrast (dark ink on primary blue, white ink on secondary red and `#161823`).
