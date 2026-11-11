import { Linking, Pressable, ScrollView, Text, View } from "react-native";
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
 * Features the TipTap project card — title, tagline, description, and
 * GitHub/live links.
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
 * TipTap project card inside the projects dimension.
 *
 * @param {{ name: string, tagline: string, description: string, stack: string, repoUrl: string, liveUrl: string }} props - Project content and outbound links.
 * @returns {JSX.Element} A tilting project card with GitHub/live links.
 */
function ProjectCard({ name, tagline, description, stack, repoUrl, liveUrl }) {
  /**
   * Open an outbound link (new tab on web, external app on native).
   *
   * @param {string} url - Destination URL.
   * @returns {void}
   */
  const openLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <TiltCard style={{ flex: 1 }} maxTilt={9}>
      <View className="relative h-full flex-1 rounded-2xl bg-[#161823] p-5 md:p-6">
        <CornerMark positionClass="right-4 top-4 md:right-5 md:top-5" />
        <Text className="font-outfit text-2xl md:text-3xl font-extrabold leading-none text-[#25F4EE]">{name}</Text>
        <Text className="font-outfit mt-1 text-xs md:text-sm text-white/80">{tagline}</Text>
        <Text className="font-outfit mt-3 max-w-md text-xs md:text-sm text-white/70 leading-snug">{description}</Text>
        <Text className="font-outfit mt-2 text-[10px] md:text-xs text-white/50">{stack}</Text>
        <View className="mt-4 flex-row flex-wrap gap-3">
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open the ${name} repository on GitHub`}
            onPress={() => openLink(repoUrl)}
            className="rounded-full border border-white/30 px-4 py-2 active:opacity-80"
          >
            <Text className="font-outfit text-xs md:text-sm text-white">GitHub ↗</Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open the ${name} live site`}
            onPress={() => openLink(liveUrl)}
            className="rounded-full bg-[#25F4EE] px-4 py-2 active:opacity-80"
          >
            <Text className="font-outfit text-xs md:text-sm font-semibold text-[#161823]">Live site ↗</Text>
          </Pressable>
        </View>
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

          {/* Project card */}
          <View className="mt-6 md:mt-10 flex-col gap-3 md:flex-row md:gap-4 h-72 md:h-64">
            <ProjectCard
              name="TipTap"
              tagline="Tap. Learn. Impress."
              description="A cross-platform Flutter app that turns knowledge into a fast, vertical feed of short, verified facts — science, history, nature, space, and culture."
              stack="Flutter · Firebase · AdMob · In-App Purchases"
              repoUrl="https://github.com/yuriusuonly/tiptap"
              liveUrl="https://yuriusu-tiptap.firebaseapp.com"
            />
          </View>
          </View>
        </View>
      </ScrollView>
    </DomainShell>
  );
}
