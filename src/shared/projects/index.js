import tiptap from "./tiptap.js";
import dinoDash from "./dino-dash.js";
import superchat from "./superchat.js";
import mojisumi from "./mojisumi.js";

/**
 * Content for a single project card on /projects.
 *
 * @typedef {object} ProjectCardData
 * @property {string} name Card title (project name).
 * @property {string} description Card description.
 * @property {string} stack Stack line rendered under the description.
 * @property {string} repoUrl GitHub repository URL (GitHub chip).
 * @property {string} [liveUrl] Deployed site URL; the live chip renders only when set.
 * @property {string} [liveLabel] Live chip label (defaults to "Live site" in the card).
 * @property {import("react-native").ImageSourcePropType} icon Card icon asset.
 */

/**
 * Project card contents for the /projects dimension, in display order
 * (two half-width cards per desktop row, top-left to bottom-right).
 *
 * @type {ProjectCardData[]}
 */
const PROJECTS = [tiptap, dinoDash, superchat, mojisumi];

export default PROJECTS;
