import { getDefaultConfig } from "expo/metro-config";
import { withNativeWind } from "nativewind/metro";

/**
 * Metro bundler configuration for Expo with NativeWind CSS support.
 * @module metro.config
 */

const config = getDefaultConfig(__dirname);

/**
 * Default Metro config wrapped with NativeWind so Tailwind classes in
 * `src/stylesheets/global.css` are processed by the bundler.
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
export default withNativeWind(
  config,
  {
    input: "src/stylesheets/global.css",
  }
);
