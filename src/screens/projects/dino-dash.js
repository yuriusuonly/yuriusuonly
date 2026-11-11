import dinoDashIcon from "../../../png/dinorun-icon.png";

/**
 * Dino Dash project card content for the /projects dimension.
 * @module screens/projects/dino-dash
 */

/** @type {{ name: string, description: string, stack: string, repoUrl: string, liveUrl: string, liveLabel: string, icon: import("react-native").ImageSourcePropType }} */
const dinoDash = {
  name: "Dino Dash",
  description: "A 2D pixel-art adventure game built with the Flutter Flame engine — run, jump, bite, and dash through a post-apocalyptic dino world.",
  stack: "Flutter · Flame Engine",
  repoUrl: "https://github.com/yuriusuonly/dinorun",
  liveUrl: "https://yuriusuonly.itch.io/dinodash",
  liveLabel: "Play",
  icon: dinoDashIcon
};

export default dinoDash;
