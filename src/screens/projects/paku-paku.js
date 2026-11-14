import pakuPakuIcon from "../../../png/paku-paku-icon.png";

/**
 * Paku Paku project card content for the /projects dimension.
 * @module screens/projects/paku-paku
 */

/** @type {{ name: string, description: string, stack: string, repoUrl: string, liveUrl: string, liveLabel: string, icon: import("react-native").ImageSourcePropType }} */
const pakuPaku = {
  name: "Paku Paku",
  description:
    "A web-only Expo Router app with a Supabase-backed menu, username/password authentication, admin profiles, and API routes, packaged for local development, Docker, and Expo Hosting.",
  stack: "Expo · React Native Web · Supabase · NativeWind",
  repoUrl: "https://github.com/yuriusuonly/paku-paku",
  liveUrl: "https://yuriusuonly-paku-paku.expo.app",
  liveLabel: "Live site",
  icon: pakuPakuIcon
};

export default pakuPaku;
