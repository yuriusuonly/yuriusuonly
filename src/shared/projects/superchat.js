import superchatIcon from "../../../png/superchat-icon.png";

/**
 * Superchat project card content for the /projects dimension.
 * @module shared/projects/superchat
 */

/** @type {import("./index.js").ProjectCardData} */
const superchat = {
  name: "Superchat",
  description: "A realtime chat app built with React and Firebase — sign in, send messages, and watch them sync live across clients.",
  stack: "React · Firebase · ESBuild",
  repoUrl: "https://github.com/yuriusuonly/superchat",
  liveUrl: "https://yuriusu-superchat.firebaseapp.com",
  liveLabel: "Live site",
  icon: superchatIcon
};

export default superchat;
