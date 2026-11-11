import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
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
import tiptap from "../../shared/tiptap.js";
import dinoDash from "../../shared/dino-dash.js";
import superchat from "../../shared/superchat.js";
import mojisumi from "../../shared/mojisumi.js";

/**
 * Projects dimension route (`src/app/projects/index.js`): home-theme
 * cyan-void world opened from the featured/logo and Projects portals.
 * Features the project cards from `src/shared` (TipTap, Dino Dash,
 * Superchat, Mojisumi) — icon avatar, title, description, stack, and
 * GitHub/live links (live chip only when a live URL exists).
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
 * Content for a single project card, as exported by `src/shared/*.js`.
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
 * Props for {@link ProjectCard} — content from `src/shared` plus row placement.
 *
 * @typedef {object} ProjectCardProps
 * @property {ProjectCardData} project Project content, outbound links, and icon asset.
 * @property {boolean} [halfWidth] Render the card at half width on desktop rows.
 */

/**
 * Project card inside the projects dimension.
 *
 * @param {ProjectCardProps} props - Component props.
 * @returns {JSX.Element} A tilting project card with GitHub/live links.
 */
function ProjectCard({ project, halfWidth = false }) {
  const { name, description, stack, repoUrl, liveUrl, liveLabel = "Live site", icon } = project;
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
    <View className={`h-64 md:h-full ${halfWidth ? "md:w-1/2" : "md:flex-1"}`}>
      <TiltCard style={{ flex: 1 }} maxTilt={9}>
        <View className="relative h-full flex-1 rounded-2xl bg-[#161823] p-5 md:p-6">
        <CornerMark positionClass="right-4 top-4 md:right-5 md:top-5" />
        <View className="flex-row items-center gap-3">
          <Image
            source={icon}
            className="!h-10 !w-10 rounded-full border border-white/20"
            resizeMode="cover"
            accessibilityLabel={`${name} icon`}
          />
          <Text className="flex-1 font-outfit text-2xl md:text-3xl font-extrabold leading-none text-[#25F4EE]">{name}</Text>
        </View>
        <Text className="mt-3 font-outfit text-xs md:text-sm text-white/70 leading-snug">{description}</Text>
        <Text className="mt-2 font-outfit text-[10px] md:text-xs text-white/50">{stack}</Text>
        <View className="mt-4 flex-row flex-wrap gap-3">
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open the ${name} repository on GitHub`}
            onPress={() => openLink(repoUrl)}
            className="rounded-full border border-white/30 px-4 py-2 active:opacity-80"
          >
            <Text className="font-outfit text-xs md:text-sm text-white">GitHub ↗</Text>
          </Pressable>
          {liveUrl ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Open the ${name} ${liveLabel.toLowerCase()} page`}
              onPress={() => openLink(liveUrl)}
              className="rounded-full bg-[#25F4EE] px-4 py-2 active:opacity-80"
            >
              <Text className="font-outfit text-xs md:text-sm font-semibold text-[#161823]">{liveLabel} ↗</Text>
            </Pressable>
          ) : null}
        </View>
        </View>
      </TiltCard>
    </View>
  );
}

/**
 * Projects dimension page: portfolio highlights staged in the cyan void.
 *
 * @returns {JSX.Element} The themed projects dimension.
 */
export default function ProjectsDimension() {
  const theme = PROJECTS_THEME;
  return (
    <DomainShell theme={theme} homePortal>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-grow items-center justify-center p-5 pb-28 md:p-10 md:pb-32">
          <View className="w-full max-w-5xl">
          <View className="flex-row items-center gap-2">
            <Text className="text-base" style={{ color: theme.lightColor }}>❖</Text>
            <Text className="font-outfit text-base md:text-lg font-semibold text-white">Projects</Text>
          </View>

          {/* Project cards: two per row on desktop */}
          <View className="mt-6 md:mt-10 flex-col gap-3 md:gap-4">
            {[[tiptap, dinoDash], [superchat, mojisumi]].map((/** @type {ProjectCardData[]} */ row) => (
              <View key={row[0].name} className="flex-col gap-3 md:flex-row md:gap-4 md:h-64">
                {row.map((project) => (
                  <ProjectCard key={project.name} project={project} halfWidth />
                ))}
              </View>
            ))}
          </View>
          </View>
        </View>
      </ScrollView>
    </DomainShell>
  );
}
