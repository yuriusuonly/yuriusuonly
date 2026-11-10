import { Text, View } from "react-native";
import config from "../shared/config.js";
import { VOID } from "../shared/tokens.js";
import DomainShell from "../components/domain/domain-shell.js";

/**
 * Fallback route (`src/app/+not-found.js`) rendered when no route matches.
 * The 404 lives in its own lighter, calmer dimension (no floating geometry) —
 * same tokens and portal-back-home affordance, per DESIGN.md.
 * @module app/+not-found
 */

/**
 * Small white corner-bracket crop mark matching the home tile accent.
 *
 * @returns {JSX.Element} The corner bracket decoration positioned absolutely.
 */
function CornerMark() {
  return (
    <View className="absolute right-2 top-2 h-2.5 md:h-3 w-2.5 md:w-3 border-t-2 border-r-2 border-white/90" />
  );
}

/**
 * 404 screen displayed for unmatched routes: an unmapped void dimension.
 *
 * @returns {JSX.Element} Centered bento panel with a giant 404 display title inside the void scene.
 */
export default function NotFound() {
  return (
    <DomainShell theme={VOID} floatShapes={false} returnPortal>
      <View className="flex-1 items-center justify-center p-4 md:p-10">
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
            <CornerMark markClass="border-[#161823]/90" />
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
    </DomainShell>
  );
}
