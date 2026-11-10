/**
 * Expo app configuration package built from environment variables.
 * @module app.config
 */

/**
 * Arguments provided by the Expo config pipeline.
 *
 * @typedef {object} AppConfigArgs
 * @property {Record<string, unknown>} config The base Expo config to extend.
 */

/**
 * Extends the base Expo config with web-only settings derived from `EXPO_PUBLIC_*` env vars.
 *
 * Values come from `.env` (the single source of truth), so they are treated as defined.
 *
 * @param {AppConfigArgs} options - Arguments provided by the Expo config pipeline.
 * @returns {Record<string, unknown>} The finalized Expo app config (web-only, static output, Metro bundler).
 */
export default function App({ config }) {
  return {
    ...config,
    name: process.env.EXPO_PUBLIC_TITLE,
    slug: process.env.EXPO_PUBLIC_TITLE.toLowerCase(),
    scheme: process.env.EXPO_PUBLIC_TITLE.toLowerCase(),
    version: process.env.EXPO_PUBLIC_VERSION,
    userInterfaceStyle: "automatic",
    platforms: [
      "web"
    ],
    web: {
      output: "static",
      bundler: "metro",
      favicon: "png/logo.png"
    },
    plugins: [
      [
        "expo-router",
        {
          sitemap: false,
          apiRoutes: true
        }
      ]
    ]
  };
}
