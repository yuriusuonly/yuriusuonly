# Design guidelines

## Design reference
- **Source of truth for the UI direction:** this project's own bento-grid identity in the TikTok-inspired palette (Tokens below) — a fully original design, iterated directly in the app source (`src/app/`). There is no external design reference file to fetch.

## 3D & Motion (all screens)
- **Structure:** every screen renders inside a `DomainShell` (`src/components/domain/domain-shell.js`) — full-screen themed WebGL scene plus the DOM content layer. Themes live in `src/shared/tokens.js` (`DIMENSIONS` for `home`/`projects`/`awards`/`clients`, `VOID` for the 404), each with `accent`, `void` (backdrop/fog), `ground` (cat stage disc), `shapes`, and light colors. Do not redefine scene colors ad hoc; extend the token tables.
- **Scene:** `dimension-scene.js` mounts a client-only R3F `<Canvas>` (prerender-safe — nothing WebGL runs during static export) with fog matching the void, two tinted directional lights matched to the theme, a ground disc, floating brand-colored primitives (deterministic placement) with a pointer-parallax rig, and the chibi cat. The 404 dimension renders the same shell with `floatShapes={false}` for a calmer stage.
- **Chibi cat:** `three/chibi-cat.js` — procedural primitives (no models): big head, small body, cone ears, cone tail, collar in primary blue. Hops toward clicks and idles with a bob, tail sway, and a blink cycle. Movement targets flow through the Zustand store `src/shared/cat-store.js` (`pursue({x, y, teleport})`): `domain-shell` forwards every window `pointerdown` as a normalized viewport target, and publishes a teleport pop for the cat when a mount enters a dimension.
- **Tilt:** bento tiles and dimension tiles wrap in `TiltCard` (`src/components/motion/tilt-card.js`) — pointer-tilt (≤10°) with a spring return, bound to the react-native-web DOM node. Reduced motion (`prefers-reduced-motion: reduce`) disables the tilt and the overture; tile presses keep their `active:opacity-90` feedback.
- **Domain expansion:** pressing a portal tile routes to its dimension page (`/dimensions/projects|awards|clients`); the shell opens with a themed expanding disc that scales to cover and fades into the new environment — content is shown there, with a "Collapse domain · Home" portal back.
- **Interaction rule:** any click anywhere in a dimension walks the cat there (hop-walk with squash & stretch); the home tiles are portals — design future screens as shells with a theme, not standalone flat pages.

## Layout (home, `src/app/index.js`)
- Stage: the home dimension (theme `home` in `src/shared/tokens.js`) paints the stage; DOM content = one big white card `rounded-[2rem] md:rounded-[2.75rem]` centered with generous padding, `flex-col md:flex-row`.
- Portal tiles: featured tile, `251 Projects` stat, and split `172 Global Design Awards.` half open the projects/awards dimensions; `156 Awards` stat opens awards; `Clients` opens clients.
- Dimension pages (`src/app/dimensions/*.js`): themed headline (dimension accent) + tagline + row of three tilting highlight tiles (sector/award/category placeholders — stat numbers still placeholder copy: wire real data before production) + return portal.
- 404 screen (`src/app/+not-found.js`): the void dimension shell (`VOID` theme, no floating shapes) with the giant `404` display title with black corner-bracket accent and a blue identity-style card (`Hmm...`, "not part of `EXPO_PUBLIC_TITLE`", dashed underline hint), portal back home. Reuse the Tokens below; do not redefine values.
- Left rail: blue identity card (`bg-[#25F4EE] rounded-3xl`, dark `#161823` ink) headed by a `❖ About Me` chip; circular avatar on red (`bg-[#FE2C55]`) with `#161823` ring; `EXPO_PUBLIC_TITLE` in semibold Outfit; dark `#161823` circle badge (vinyl-style simplification); dashed underline for `EXPO_PUBLIC_DESCRIPTION` text.
- Right: giant display title (`EXPO_PUBLIC_TITLE`, `text-5xl md:text-8xl font-black tracking-tight`) with black corner-bracket accent, above a 2-row bento grid; tile heights implicit via `flex-1` rows with `gap-3 md:gap-4`.
- Tiles: featured tile on blue (`bg-[#25F4EE]`) with cover image; stacked stat tiles (`w-24 md:w-40`): blue `251 Projects` (dark text) over red `bg-[#FE2C55]` `156 Awards` (white text); row 2: dark `#161823` `Clients` tile + split `#161823`/blue tile — dark half with image, blue half `bg-[#25F4EE]` for `172 Global Design Awards.` (dark text).

## Tokens
- Tailwind/consumed values: TikTok-inspired scheme: blue `#25F4EE` (**primary** — identity card, featured tile, stats tiles), red `#FE2C55` (**secondary** — avatar circle, awards stat), neutrals: rich black `#161823` (dark tiles, ink text), light gray `#F1F1F2` (stage), panel `#ffffff`.
- Runtime tokens: `src/shared/tokens.js` mirrors the same palette constants (`COLORS`) plus the dimension themes; the 3D/motion/overlay layers read from it instead of restating hex values. Tailwind classes stay the styling source for markup.
- Ink rule: dark ink `text-[#161823]` on blue surfaces; white ink on red and `#161823` surfaces.
- Radii: tiles `rounded-2xl`, cards `rounded-3xl`, outer panel `rounded-[2rem] md:rounded-[2.75rem]`, circle badge/avatar `rounded-full`.
- Accents: crop-mark corner brackets top-right of every tile — `border-[#161823]/90` on blue surfaces, `border-white/90` elsewhere; dashed 1px underline for contact text (`#161823`/70 on blue, white/70 on dark).
- Dark mode: not part of the current reference — keep light-only until intentionally extended (`darkMode: "class"` is available).

## UI stack
- **Rendering:** React Native Web primitives (`View`, `Text`, `Image`, etc.) with **NativeWind v4** (`className`) and **Tailwind CSS v3**.
- **Global styles:** `src/stylesheets/global.css` (`@tailwind base/components/utilities`), wired via `metro.config.js` (`withNativeWind`) and Babel (`nativewind/babel` preset).
- **3D layer:** `three` + `@react-three/fiber` (Canvas scenes per dimension); **state:** `zustand` (`src/shared/cat-store.js` — chibi-cat targets); both are React-19 compatible.
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
