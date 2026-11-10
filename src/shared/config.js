/**
 * Client-visible app metadata sourced from `EXPO_PUBLIC_*` environment variables.
 * @module shared/config
 */

/**
 * Title, description, and version pulled from the `.env` file via `EXPO_PUBLIC_*` vars.
 *
 * @typedef {object} AppConfig
 * @property {string} [title] App/site title (`EXPO_PUBLIC_TITLE`).
 * @property {string} [description] App/site description (`EXPO_PUBLIC_DESCRIPTION`).
 * @property {string} [version] App version string (`EXPO_PUBLIC_VERSION`).
 */

/**
 * Default shared config consumed by routes and documents.
 *
 * @type {AppConfig}
 */
const config = {
  title: process.env.EXPO_PUBLIC_TITLE,
  description: process.env.EXPO_PUBLIC_DESCRIPTION,
  version: process.env.EXPO_PUBLIC_VERSION
};

export default config;
