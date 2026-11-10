import { ScrollView, Text, View } from "react-native";
import { DIMENSIONS } from "../../shared/tokens.js";
import DomainShell from "../../components/domain/domain-shell.js";
import TiltCard from "../../components/motion/tilt-card.js";

/**
 * Awards dimension route (`src/app/dimensions/awards.js`): red-void world
 * opened from the Awards stat and 172-Global-Design-Awards portals.
 * Stat placeholder copy — wire real data before production.
 * @module app/dimensions/awards
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
 * Single highlight tile inside the awards dimension.
 *
 * @param {{ number: string, label: string, tileClass: string, textClass: string, dark?: boolean }} props - Content and surface classes.
 * @returns {JSX.Element} A tilting bento tile.
 */
function HighlightTile({ number, label, tileClass, textClass, dark }) {
  return (
    <TiltCard style={{ flex: 1 }} maxTilt={9}>
      <View className={`relative h-full flex-1 items-center justify-center rounded-2xl ${tileClass}`}>
        <CornerMark dark={dark} />
        <Text className={`font-outfit text-3xl md:text-5xl font-extrabold leading-none ${textClass}`}>{number}</Text>
        <Text className={`font-outfit mt-2 text-sm md:text-base leading-tight ${textClass}`}>{label}</Text>
      </View>
    </TiltCard>
  );
}

/**
 * Awards dimension page: recognition highlights staged in the red void.
 *
 * @returns {JSX.Element} The themed awards dimension with a return portal.
 */
export default function AwardsDimension() {
  const theme = DIMENSIONS.awards;
  return (
    <DomainShell theme={theme} returnPortal>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-grow items-center justify-center p-4 pb-28 md:p-10 md:pb-32">
          <View className="w-full max-w-5xl">
          <View className="flex-row items-center gap-2">
            <Text className="text-base" style={{ color: theme.lightColor }}>❖</Text>
            <Text className="font-outfit text-base md:text-lg font-semibold text-white">Awards</Text>
          </View>
          <Text className="font-outfit text-5xl md:text-8xl font-black tracking-tight leading-none mt-2" style={{ color: theme.accent }}>
            172
          </Text>
          <Text className="font-outfit mt-3 md:mt-4 max-w-lg text-base md:text-xl text-white/80 leading-snug">
            Global design awards collected across juried competitions and community showcases.
          </Text>

          {/* Highlight tiles */}
          <View className="mt-6 md:mt-10 flex-col gap-3 md:flex-row md:gap-4 h-72 md:h-56">
            <HighlightTile number="61" label="Best in Show" tileClass="bg-[#FE2C55]" textClass="text-white" />
            <HighlightTile number="70" label="Gold Honors" tileClass="bg-[#25F4EE]" textClass="text-[#161823]" dark />
            <HighlightTile number="41" label="Knighted Juries" tileClass="bg-[#161823]" textClass="text-white" />
          </View>
          </View>
        </View>
      </ScrollView>
    </DomainShell>
  );
}
