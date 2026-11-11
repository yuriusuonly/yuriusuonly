import lifesaverIcon from "../../../png/lifesaver-icon.png";

/**
 * Lifesaver Medicords experience card content for the /experience dimension.
 * @module screens/experience/lifesaver-medicords
 */

/** @type {{ name: string, description: string, period: string, location: string, stack: { label: string, items: string[] }, highlights: string[], liveUrl: string, appStoreUrl: string, playStoreUrl: string, icon: import("react-native").ImageSourcePropType }} */
const lifesaverMedicords = {
  name: "Lifesaver Medicords Inc.",
  description: "Junior Mobile Developer at a SaaS startup that digitalizes medical records with online consultations.",
  period: "May 2026",
  location: "Aurora Blvd, Cubao, Quezon City",
  stack: {
    label: "Tech stack we use:",
    items: ["Dart/Flutter", "Go", "Redis", "MySQL", "AWS"]
  },
  highlights: [
    "Integrated peer-to-peer live video calling and chat using WebRTC over a WebSocket connection.",
    "Handled deployment to both Apple App Store Connect and Google Play Developer Console for the iOS and Android platforms.",
    "Collaborated with end-to-end testing and automation tooling — Claude Code for agentic workflows, Trello MCP, and Git/GitHub version control."
  ],
  liveUrl: "https://lifesaver.care",
  appStoreUrl: "https://apps.apple.com/ph/app/lifesaver-for-doctors/id6737030949",
  playStoreUrl: "https://play.google.com/store/apps/details?id=care.lifesaver.lifesaver_medicords_doctor&hl=en",
  icon: lifesaverIcon
};

export default lifesaverMedicords;
