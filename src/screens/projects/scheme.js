import schemeIcon from "../../../png/scheme-icon.png";

/**
 * Scheme project card content for the /projects dimension.
 * @module screens/projects/scheme
 */

/** @type {{ name: string, description: string, stack: string, repoUrl: string, icon: import("react-native").ImageSourcePropType }} */
const scheme = {
  name: "Scheme",
  description: "A full-stack SQL schema playground built with Bun and SQLite — a server-rendered, three-pane workspace for writing and running arbitrary SQL with real-time sync across sessions, written in vanilla JavaScript with zero third-party dependencies.",
  stack: "Bun · SQLite · Vanilla JavaScript",
  repoUrl: "https://github.com/yuriusuonly/scheme",
  icon: schemeIcon
};

export default scheme;
