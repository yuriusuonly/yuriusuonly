import { ScrollView, Text, View } from "react-native";
import config from "../shared/config.js";
import { COLORS } from "../shared/theme.js";

/**
 * Void dimension theme for the not-found screen, composed locally from base
 * color tokens.
 *
 * @type {import("../shared/theme.js").DimensionTheme}
 */
const VOID_THEME = {
  id: "void",
  name: "Void",
  tagline: "Unmapped territory.",
  accent: COLORS.primary,
  void: "#E4ECF6",
  shapes: [COLORS.primary, COLORS.secondary, "#B9C6DE"],
  lightColor: "#9BF9F5",
  rimColor: COLORS.secondary,
  headlineClass: "text-[#161823]"
};
import DomainShell from "../components/domain-shell.js";

/**
 * Fallback route (`src/app/+not-found.js`) rendered when no route matches.
 * The 404 lives in its own lighter, calmer dimension (no floating geometry) —
 * same tokens, per DESIGN.md.
 * @module app/+not-found
 */

/**
 * Small white corner-bracket crop mark matching the home tile accent.
 *
 * @param {{ markClass?: string, positionClass?: string }} [props] - Tailwind overrides: border color and inset position (defaults align to the card edge).
 * @returns {JSX.Element} The corner bracket decoration positioned absolutely.
 */
function CornerMark({ markClass = "border-white/90", positionClass = "right-2 top-2" }) {
  return (
    <View className={`absolute h-2.5 w-2.5 md:h-3 md:w-3 border-t-2 border-r-2 ${positionClass} ${markClass}`} />
  );
}

/**
 * 404 screen displayed for unmatched routes: an unmapped void dimension.
 *
 * @returns {JSX.Element} Centered bento panel with a giant 404 display title inside the void scene.
 */
export default function NotFound() {
  return (
    <DomainShell theme={VOID_THEME} calm homePortal>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-grow items-center justify-center p-4 pb-28 md:p-10 md:pb-32">
          <View className="w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[2.75rem] p-5 md:p-8 items-center">
          {/* Giant display title with corner-bracket accent */}
          <View className="relative self-center px-1">
            <Text className="font-outfit text-7xl md:text-9xl font-black tracking-tight text-[#161823] leading-none">
              404
            </Text>
            <View className="absolute -top-1 right-0 h-3 w-3 md:h-4 md:w-4 border-t-4 border-r-4 border-[#161823]" />
          </View>

          {/* Cyan identity-style card describing the miss */}
          <View className="relative mt-4 md:mt-6 w-full md:max-w-md bg-[#25F4EE] rounded-3xl p-5 md:p-6">
            <CornerMark markClass="border-[#161823]/90" positionClass="right-5 top-5 md:right-6 md:top-6" />
            <Text className="font-outfit text-2xl md:text-3xl font-semibold text-[#161823]">Hmm...</Text>
            <Text className="font-outfit mt-2 text-base md:text-lg text-[#161823] leading-snug">
              The page you are looking for is not part of {config.title}.
            </Text>
            <View className="mt-4 md:mt-5 border-b border-dashed border-[#161823]/70 pb-2 self-stretch">
              <Text className="font-outfit text-xs md:text-sm text-[#161823]">Check the URL or head back home.</Text>
            </View>
          </View>
          </View>
        </View>
      </ScrollView>
    </DomainShell>
  );
}
