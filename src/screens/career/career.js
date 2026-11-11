import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { COLORS } from "../../shared/theme.js";

/**
 * Career dimension theme composed locally from base color tokens.
 *
 * @type {import("../../shared/theme.js").DimensionTheme}
 */
const CAREER_THEME = {
  id: "career",
  name: "Career",
  tagline: "Where I've worked.",
  accent: COLORS.ink,
  void: "#05060B",
  shapes: [COLORS.ink, "#3A3D52", COLORS.primary],
  lightColor: "#C9CCDD",
  rimColor: COLORS.primary,
  headlineClass: "text-white"
};
import DomainShell from "../../components/domain-shell.js";
import TiltCard from "../../components/tilt-card.js";
import { List, ListItem } from "../../components/list.js";
import lifesaverMedicords from "./lifesaver-medicords.js";

/**
 * Career dimension screen (`src/screens/career/career.js`):
 * ink-void world opened from the Career portal, rendered by the
 * `/career` route (`src/app/career/index.js`). Features the career
 * cards from this folder (Lifesaver Medicords Inc.) — icon avatar, title,
 * description, highlight bullets, tech stack list, period · location, and
 * Website / App Store / Play Store link chips.
 * @module screens/career/career
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
 * Content for a single career card, as exported by this folder's card files.
 *
 * @typedef {object} CareerCardData
 * @property {string} name Card title (company name).
 * @property {string} description Card description (role at the company and what it does).
 * @property {string} period Engagement period.
 * @property {string} location Engagement location.
 * @property {{ label: string, items: string[] }|undefined} stack Tech stack group rendered after the highlights: a labeled bullet with indented sub-bullets.
 * @property {string[]} highlights Highlight bullets rendered between the description and the stack.
 * @property {string} [liveUrl] Company website URL; the chip renders only when set.
 * @property {string} [appStoreUrl] Apple App Store URL; the chip renders only when set.
 * @property {string} [playStoreUrl] Google Play Store URL; the chip renders only when set.
 * @property {import("react-native").ImageSourcePropType} icon Card icon asset.
 */

/**
 * Props for {@link CareerCard} — content from this folder plus row placement.
 *
 * @typedef {object} CareerCardProps
 * @property {CareerCardData} career Career content, outbound website/store links, and icon asset.
 * @property {boolean} [halfWidth] Render the card at half width on desktop rows.
 */

/**
 * Career card inside the career dimension.
 *
 * @param {CareerCardProps} props - Component props.
 * @returns {JSX.Element} A tilting career card with website / store links.
 */
function CareerCard({ career, halfWidth = false }) {
  const { name, description, period, location, stack, highlights, liveUrl, appStoreUrl, playStoreUrl, icon } = career;
  /**
   * Open an outbound link (new tab on web, external app on native).
   *
   * @param {string} target - Destination URL.
   * @returns {void}
   */
  const openLink = (target) => {
    Linking.openURL(target).catch(() => {});
  };

  return (
    <View className={`${halfWidth ? "md:w-1/2" : "md:flex-1"}`}>
      <TiltCard style={{ flex: 1 }} maxTilt={9}>
        <View className="relative h-full flex-1 rounded-2xl bg-[#161823] p-5 md:p-6">
        <CornerMark positionClass="right-4 top-4 md:right-5 md:top-5" />
        <View className="flex-row items-center gap-3">
          <Image
            source={icon}
            className="!h-10 !w-10"
            resizeMode="contain"
            accessibilityLabel={`${name} icon`}
          />
          <Text className="flex-1 font-outfit text-2xl md:text-3xl font-extrabold leading-none text-white">{name}</Text>
        </View>
        <Text className="mt-3 font-outfit text-xs md:text-sm text-white/70 leading-snug">{description}</Text>
        <View className="mt-2">
          <List>
            {highlights.map((highlight) => (
              <ListItem key={highlight} label={highlight} />
            ))}
            {stack ? (
              <ListItem label={stack.label}>
                <List inset>
                  {stack.items.map((item) => (
                    <ListItem key={item} label={item} />
                  ))}
                </List>
              </ListItem>
            ) : null}
          </List>
        </View>
        <Text className="mt-2 font-outfit text-[10px] md:text-xs text-white/50">{period} · {location}</Text>
        <View className="mt-4 flex-row flex-wrap gap-3">
          {liveUrl ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Open the ${name} website`}
              onPress={() => openLink(liveUrl)}
              className="rounded-full bg-white px-4 py-2 active:opacity-80"
            >
              <Text className="font-outfit text-xs md:text-sm font-semibold text-[#161823]">Website ↗</Text>
            </Pressable>
          ) : null}
          {appStoreUrl ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Open the ${name} App Store page`}
              onPress={() => openLink(appStoreUrl)}
              className="rounded-full bg-white px-4 py-2 active:opacity-80"
            >
              <Text className="font-outfit text-xs md:text-sm font-semibold text-[#161823]">App Store ↗</Text>
            </Pressable>
          ) : null}
          {playStoreUrl ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Open the ${name} Play Store page`}
              onPress={() => openLink(playStoreUrl)}
              className="rounded-full bg-white px-4 py-2 active:opacity-80"
            >
              <Text className="font-outfit text-xs md:text-sm font-semibold text-[#161823]">Play Store ↗</Text>
            </Pressable>
          ) : null}
        </View>
        </View>
      </TiltCard>
    </View>
  );
}

/**
 * Career dimension page: career highlights staged in the ink void.
 *
 * @returns {JSX.Element} The themed career dimension.
 */
export default function CareerDimension() {
  const theme = CAREER_THEME;
  return (
    <DomainShell theme={theme} homePortal>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-grow items-center justify-center p-5 pb-28 md:p-10 md:pb-32">
          <View className="w-full max-w-5xl">
          <View className="flex-row items-center gap-2">
            <Text className="text-base" style={{ color: theme.lightColor }}>❖</Text>
            <Text className="font-outfit text-base md:text-lg font-semibold text-white">Career</Text>
          </View>

          {/* Career cards: two per row on desktop */}
          <View className="mt-6 md:mt-10 flex-col gap-3 md:gap-4">
            {[[lifesaverMedicords]].map((/** @type {CareerCardData[]} */ row) => (
              <View key={row[0].name} className="flex-col gap-3 md:flex-row md:gap-4">
                {row.map((career) => (
                  <CareerCard key={career.name} career={career} halfWidth />
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
