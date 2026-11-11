import tiptapIcon from "../../../png/tiptap-icon.png";

/**
 * TipTap project card content for the /projects dimension.
 * @module screens/projects/tiptap
 */

/** @type {{ name: string, description: string, stack: string, repoUrl: string, liveUrl: string, liveLabel: string, icon: import("react-native").ImageSourcePropType }} */
const tiptap = {
  name: "TipTap",
  description: "A cross-platform Flutter app that turns knowledge into a fast, vertical feed of short, verified facts — science, history, nature, space, and culture.",
  stack: "Flutter · Firebase · AdMob · In-App Purchases",
  repoUrl: "https://github.com/yuriusuonly/tiptap",
  liveUrl: "https://yuriusu-tiptap.firebaseapp.com",
  liveLabel: "Live site",
  icon: tiptapIcon
};

export default tiptap;
