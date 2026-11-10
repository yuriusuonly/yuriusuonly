import { ScrollView, Text, View } from "react-native";
import { COLORS } from "../../shared/theme.js";

/**
 * Projects dimension theme composed locally from base color tokens.
 *
 * @type {import("../../shared/theme.js").DimensionTheme}
 */
const PROJECTS_THEME = {
  id: "projects",
  name: "Projects",
  tagline: "251 shipped and counting.",
  accent: COLORS.primary,
  void: "#0B4F52",
  shapes: [COLORS.primary, "#9BF9F5", COLORS.surface],
  lightColor: "#25F4EE",
  rimColor: "#FFFFFF",
  headlineClass: "text-white"
};
import DomainShell from "../../components/domain-shell.js";
import TiltCard from "../../components/tilt-card.js";

/**
 * Projects dimension route (`src/app/projects/index.js`): home-theme
 * cyan-void world opened from the featured/logo and Projects portals.
 * Stat placeholder copy — wire real data before production.
 * @module app/projects
 */

/**
 * Corner-bracket crop mark for the dimension tiles (white or dark variant).
 *
 * @param {{ dark?: boolean, positionClass?: string }} [props] - Render the ink mark for light tiles and optionally override inset position.
 * @returns {JSX.Element} The corner bracket decoration positioned absolutely.
 */
function CornerMark({ dark = false, positionClass = "right-2 top-2" }) {
  return (
    <View
      className={`absolute h-2.5 w-2.5 md:h-3 md:w-3 border-t-2 border-r-2 ${positionClass} ${dark ? "border-[#161823]/90" : "border-white/90"}`}
    />
  );
}

/**
 * Single highlight tile inside the projects dimension.
 *
 * @param {{ number: string, label: string, tileClass: string, textClass: string, dark?: boolean }} props - Content and surface classes.
 * @returns {JSX.Element} A tilting bento tile.
 */
function HighlightTile({ number, label, tileClass, textClass, dark }) {
  return (
    <TiltCard style={{ flex: 1 }} maxTilt={9}>
      <View className={`relative h-full flex-1 items-center justify-center rounded-2xl ${tileClass}`}>
        <CornerMark dark={dark} positionClass="right-4 top-4 md:right-5 md:top-5" />
        <Text className={`font-outfit text-3xl md:text-5xl font-extrabold leading-none ${textClass}`}>{number}</Text>
        <Text className={`font-outfit mt-2 text-sm md:text-base leading-tight ${textClass}`}>{label}</Text>
      </View>
    </TiltCard>
  );
}

/**
 * Projects dimension page: portfolio highlights staged in the cyan void.
 *
 * @returns {JSX.Element} The themed projects dimension with a return portal.
 */
export default function ProjectsDimension() {
  const theme = PROJECTS_THEME;
  return (
    <DomainShell theme={theme} returnPortal>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-grow items-center justify-center p-5 pb-28 md:p-10 md:pb-32">
          <View className="w-full max-w-5xl">
          <View className="flex-row items-center gap-2">
            <Text className="text-base" style={{ color: theme.lightColor }}>❖</Text>
            <Text className="font-outfit text-base md:text-lg font-semibold text-white">Projects</Text>
          </View>
          <Text className="font-outfit text-5xl md:text-8xl font-black tracking-tight leading-none mt-2" style={{ color: theme.accent }}>
            251
          </Text>
          <Text className="font-outfit mt-3 md:mt-4 max-w-lg text-base md:text-xl text-white/80 leading-snug">
            Shipped projects across brand, interface, and interactive work — each one worth opening a domain for.
          </Text>

          {/* Highlight tiles */}
          <View className="mt-6 md:mt-10 flex-col gap-3 md:flex-row md:gap-4 h-72 md:h-56">
            <HighlightTile number="120" label="Product & UI" tileClass="bg-[#25F4EE]" textClass="text-[#161823]" dark />
            <HighlightTile number="86" label="Brand & Logo" tileClass="bg-[#FE2C55]" textClass="text-white" />
            <HighlightTile number="45" label="Interactive 3D" tileClass="bg-[#161823]" textClass="text-white" />
          </View>
          </View>
        </View>
      </ScrollView>
    </DomainShell>
  );
}
