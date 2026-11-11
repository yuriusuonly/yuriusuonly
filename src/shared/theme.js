/**
 * Base design color tokens for non-Tailwind consumers. Screens/dimensions compose
 * their own themes internally using these palette values; Tailwind classes remain
 * the styling source for markup.
 * @module shared/theme
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
 * opens into, composed by each screen from {@link COLORS} and local accents.
 *
 * @typedef {object} DimensionTheme
 * @property {string} id Route identifier ("home", "projects", "awards", "experience", "void").
 * @property {string} name Display name shown in domain pages.
 * @property {string} tagline Short copy used in scene overlays.
 * @property {string} accent Dominant brand color driving overlays and lights.
 * @property {string} void Canvas/fog backdrop color of the dimension.
 * @property {string[]} shapes Accent colors cycled by the floating geometry.
 * @property {string} lightColor Primary fill-light color.
 * @property {string} rimColor Backlight/rim color.
 * @property {string} headlineClass Tailwind text-surface color class for headlines on the void.
 */

