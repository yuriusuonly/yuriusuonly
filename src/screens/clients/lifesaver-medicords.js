import lifesaverIcon from "../../../png/lifesaver-icon.png";

/**
 * Lifesaver Medicords experience card content for the /clients dimension.
 * @module screens/clients/lifesaver-medicords
 */

/** @type {{ name: string, role: string, description: string, period: string, location: string, stack: string, highlights: string[], url: string, icon: import("react-native").ImageSourcePropType }} */
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
  url: "https://apps.apple.com/ph/app/lifesaver-for-doctors/id6737030949",
  icon: lifesaverIcon
};

export default lifesaverMedicords;
