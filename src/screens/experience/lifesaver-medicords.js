import lifesaverIcon from "../../../png/lifesaver-icon.png";

/**
 * Lifesaver Medicords experience card content for the /experience dimension.
 * @module screens/experience/lifesaver-medicords
 */

/** @type {{ name: string, role: string, description: string, period: string, location: string, stack: string, highlights: string[], appStoreUrl: string, playStoreUrl: string, icon: import("react-native").ImageSourcePropType }} */
const lifesaverMedicords = {
  name: "Lifesaver Medicords",
  role: "Junior Mobile Developer",
  description: "A SaaS startup that digitalizes medical records with online consultations.",
  period: "May 2026",
  location: "Aurora Blvd, Cubao, Quezon City",
  stack: "Dart/Flutter · Go · Redis · MySQL · Amazon AWS",
  highlights: [
    "Integrated peer-to-peer live video calling and chat using WebRTC over a WebSocket connection.",
    "Handled deployment to both Apple App Store Connect and Google Play Developer Console for the iOS and Android platforms.",
    "Collaborated with end-to-end testing and automation tooling — Claude Code for agentic workflows, Trello MCP, and Git/GitHub version control."
  ],
  appStoreUrl: "https://apps.apple.com/ph/app/lifesaver-for-doctors/id6737030949",
  playStoreUrl: "https://play.google.com/store/apps/details?id=care.lifesaver.lifesaver_medicords_doctor&hl=en",
  icon: lifesaverIcon
};

export default lifesaverMedicords;
