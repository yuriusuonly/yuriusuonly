/**
 * Babel preset wiring for Expo Router / NativeWind transpilation.
 * @module babel.config
 */

/**
 * Configures Babel caching and the Expo + NativeWind preset chain.
 *
 * @param {object} config - The Babel config object provided by Babel's CLI.
 * @returns {{presets: string[]}} The transformed Babel config with the required presets.
 */
export default function Babel(config) {
  config.cache(true);

  return {
    presets: [
      "babel-preset-expo",
      "nativewind/babel"
    ],
  };
}
