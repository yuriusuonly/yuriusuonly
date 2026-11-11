import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { COLORS } from "../../shared/theme.js";

/**
 * Awards dimension theme composed locally from base color tokens.
 *
 * @type {import("../../shared/theme.js").DimensionTheme}
 */
const AWARDS_THEME = {
  id: "awards",
  name: "Awards",
  tagline: "172 global design awards.",
  accent: COLORS.secondary,
  void: "#4A0A16",
  shapes: [COLORS.secondary, "#FF8FA6", COLORS.primary],
  lightColor: "#FE2C55",
  rimColor: "#FFD2DB",
  headlineClass: "text-white"
};
import DomainShell from "../../components/domain-shell.js";
import TiltCard from "../../components/tilt-card.js";
import cs50x from "./cs50x.js";

/**
 * Awards dimension screen (`src/screens/awards/awards.js`): red-void world
 * opened from the Awards stat and 172-Global-Design-Awards portals, rendered
 * by the `/awards` route (`src/app/awards/index.js`).
 * Features the award cards from this folder (CS50x) — icon avatar, title,
 * description, issuer · year, and a certificate link chip.
 * @module screens/awards/awards
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
 * Content for a single award card, as exported by this folder's card files.
 *
 * @typedef {object} AwardCardData
 * @property {string} name Card title (award name).
 * @property {string} description Card description.
 * @property {string} issuer Issuing organization.
 * @property {string} year Year awarded.
 * @property {string} url Verification/certificate URL.
 * @property {import("react-native").ImageSourcePropType} icon Card icon asset.
 */

/**
 * Props for {@link AwardCard} — content from this folder plus row placement.
 *
 * @typedef {object} AwardCardProps
 * @property {AwardCardData} award Award content, verification link, and icon asset.
 * @property {boolean} [halfWidth] Render the card at half width on desktop rows.
 */

/**
 * Award card inside the awards dimension.
 *
 * @param {AwardCardProps} props - Component props.
 * @returns {JSX.Element} A tilting award card with a certificate link.
 */
function AwardCard({ award, halfWidth = false }) {
  const { name, description, issuer, year, url, icon } = award;
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
    <View className={`h-80 md:h-full ${halfWidth ? "md:w-1/2" : "md:flex-1"}`}>
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
          <Text className="flex-1 font-outfit text-2xl md:text-3xl font-extrabold leading-none text-[#FE2C55]">{name}</Text>
        </View>
        <Text className="mt-3 font-outfit text-xs md:text-sm text-white/70 leading-snug">{description}</Text>
        <Text className="mt-2 font-outfit text-[10px] md:text-xs text-white/50">{issuer} · {year}</Text>
        <View className="mt-4 flex-row flex-wrap gap-3">
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open the ${name} certificate`}
            onPress={() => openLink(url)}
            className="rounded-full bg-[#FE2C55] px-4 py-2 active:opacity-80"
          >
            <Text className="font-outfit text-xs md:text-sm font-semibold text-[#161823]">Certificate ↗</Text>
          </Pressable>
        </View>
        </View>
      </TiltCard>
    </View>
  );
}

/**
 * Awards dimension screen: recognition highlights staged in the red void.
 *
 * @returns {JSX.Element} The themed awards dimension.
 */
export default function AwardsDimension() {
  const theme = AWARDS_THEME;
  return (
    <DomainShell theme={theme} homePortal>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-grow items-center justify-center p-5 pb-28 md:p-10 md:pb-32">
          <View className="w-full max-w-5xl">
          <View className="flex-row items-center gap-2">
            <Text className="text-base" style={{ color: theme.lightColor }}>❖</Text>
            <Text className="font-outfit text-base md:text-lg font-semibold text-white">Awards</Text>
          </View>

          {/* Award cards: two per row on desktop */}
          <View className="mt-6 md:mt-10 flex-col gap-3 md:gap-4">
            {[[cs50x]].map((/** @type {AwardCardData[]} */ row) => (
              <View key={row[0].name} className="flex-col gap-3 md:flex-row md:gap-4 md:h-64">
                {row.map((award) => (
                  <AwardCard key={award.name} award={award} halfWidth />
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
