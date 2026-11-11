import mojisumiIcon from "../../png/mojisumi-icon.png";

/**
 * Mojisumi project card content for the /projects dimension.
 * @module shared/mojisumi
 */

/** @type {{ name: string, description: string, stack: string, repoUrl: string, liveUrl?: string, liveLabel?: string, icon: import("react-native").ImageSourcePropType }} */
const mojisumi = {
  name: "Mojisumi",
  description: "A Nihongo writing practice app — interactive, stroke-by-stroke drawing for Hiragana, Katakana, and Kanji.",
  stack: "Flutter",
  repoUrl: "https://github.com/yuriusuonly/shodoshi",
  icon: mojisumiIcon
};

export default mojisumi;
