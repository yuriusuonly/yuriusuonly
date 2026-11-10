/**
 * Canonical design tokens for non-Tailwind consumers (the 3D scene, motion, and
 * overlay layers). Tailwind classes remain the styling source for markup; these
 * values mirror DESIGN.md so the animated background and expansion overlay layers stay on
 * the same TikTok-inspired palette.
 * @module shared/tokens
 */

/**
 * Brand palette (hex strings, no alpha).
 *
 * @typedef {object} ColorTokens
 * @property {string} primary Blue — featured/tile accents (`#25F4EE`).
 * @property {string} secondary Red — award/highlight accents (`#FE2C55`).
 * @property {string} ink Near-black — text and dark tiles (`#161823`).
 * @property {string} stage Off-white — page canvas (`#F1F1F2`).
 * @property {string} surface White — cards (`#FFFFFF`).
 */

/**
 * @type {ColorTokens}
 */
export const COLORS = {
  primary: "#25F4EE",
  secondary: "#FE2C55",
  ink: "#161823",
  stage: "#F1F1F2",
  surface: "#FFFFFF"
};

/**
 * One interactive "dimension" — the themed world a tile's domain expansion
 * opens into, ordered across the tile's accent colors and the void backdrop
 *
 * @typedef {object} DimensionTheme
 * @property {string} id Route identifier ("home", "projects", "awards", "clients", "void").
 * @property {string} name Display name shown in domain pages.
 * @property {string} tagline Short copy used in scene overlays.
 * @property {string} accent Dominant brand color driving overlays and lights.
 * @property {string} void Canvas/fog backdrop color of the dimension.
 * * @property {string[]} shapes Accent colors cycled by the floating geometry.
 * @property {string} lightColor Primary fill-light color.
 * @property {string} rimColor Backlight/rim color.
 * @property {string} headlineClass Tailwind text-surface color class for headlines on the void.
 */

/**
 * @type {Object<string, DimensionTheme>}
 */
export const DIMENSIONS = {
  home: {
    id: "home",
    name: "Home",
    tagline: "The stage dimension.",
    accent: COLORS.primary,
    void: "#EAF7F6",
    shapes: [COLORS.primary, COLORS.secondary, COLORS.ink],
    lightColor: "#BDFCF8",
    rimColor: COLORS.secondary,
    headlineClass: "text-[#161823]"
  },
  projects: {
    id: "projects",
    name: "Projects",
    tagline: "251 shipped and counting.",
    accent: COLORS.primary,
    void: "#0B4F52",
    shapes: [COLORS.primary, "#9BF9F5", COLORS.surface],
    lightColor: "#25F4EE",
    rimColor: "#FFFFFF",
    headlineClass: "text-white"
  },
  awards: {
    id: "awards",
    name: "Awards",
    tagline: "172 global design awards.",
    accent: COLORS.secondary,
    void: "#4A0A16",
    shapes: [COLORS.secondary, "#FF8FA6", COLORS.primary],
    lightColor: "#FE2C55",
    rimColor: "#FFD2DB",
    headlineClass: "text-white"
  },
  clients: {
    id: "clients",
    name: "Clients",
    tagline: "156 collaborations worldwide.",
    accent: COLORS.ink,
    void: "#05060B",
    shapes: [COLORS.ink, "#3A3D52", COLORS.primary],
    lightColor: "#C9CCDD",
    rimColor: COLORS.primary,
    headlineClass: "text-white"
  },
};

/**
 * Standalone theme for the not-found dimension (`+not-found`): a lighter,
 * calmer stage than tile domains — no route of its own in the portal set.
 *
 * @type {DimensionTheme}
 */
export const VOID = {
  id: "void",
  name: "Void",
  tagline: "Unmapped territory.",
  accent: COLORS.primary,
  void: "#E4ECF6",
  shapes: [COLORS.primary, COLORS.secondary, "#B9C6DE"],
  lightColor: "#9BF9F5",
  rimColor: COLORS.secondary,
  headlineClass: "text-[#161823]"
};

