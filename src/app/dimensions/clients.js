import { Text, View } from "react-native";
import { DIMENSIONS } from "../../shared/tokens.js";
import DomainShell from "../../components/domain/domain-shell.js";
import TiltCard from "../../components/motion/tilt-card.js";

/**
 * Clients dimension route (`src/app/dimensions/clients.js`): ink-void world
 * opened from the Clients portal. Client-row placeholder copy — wire real
 * data before production.
 * @module app/dimensions/clients
 */

/**
 * Corner-bracket crop mark for the dimension tiles (white or dark variant).
 *
 * @param {{ dark?: boolean }} [props] - Render the ink mark for light tiles.
 * @returns {JSX.Element} The corner bracket decoration positioned absolutely.
 */
function CornerMark({ dark = false }) {
  return (
    <View
      className={`absolute right-2 top-2 h-2.5 w-2.5 md:h-3 md:w-3 border-t-2 border-r-2 ${dark ? "border-[#161823]/90" : "border-white/90"}`}
    />
  );
}

/**
 * Single client-sector tile inside the clients dimension.
 *
 * @param {{ sector: string, note: string, tileClass: string, textClass: string, dark?: boolean }} props - Content and surface classes.
 * @returns {JSX.Element} A tilting bento tile.
 */
function ClientTile({ sector, note, tileClass, textClass, dark }) {
  return (
    <TiltCard style={{ flex: 1 }} maxTilt={9}>
      <View className={`relative h-full flex-1 rounded-2xl p-4 md:p-6 justify-center ${tileClass}`}>
        <CornerMark dark={dark} />
        <Text className={`font-outfit text-xl md:text-2xl font-extrabold leading-tight ${textClass}`}>{sector}</Text>
        <Text className={`font-outfit mt-2 text-xs md:text-sm leading-snug ${textClass}`}>{note}</Text>
      </View>
    </TiltCard>
  );
}

/**
 * Clients dimension page: collaboration sectors staged in the ink void.
 *
 * @returns {JSX.Element} The themed clients dimension with a return portal.
 */
export default function ClientsDimension() {
  const theme = DIMENSIONS.clients;
  return (
    <DomainShell theme={theme} returnPortal>
      <View className="flex-1 items-center justify-center p-4 md:p-10">
        <View className="w-full max-w-5xl">
          <View className="flex-row items-center gap-2">
            <Text className="text-base" style={{ color: theme.lightColor }}>❖</Text>
            <Text className="font-outfit text-base md:text-lg font-semibold text-white">Clients</Text>
          </View>
          <Text className="font-outfit text-5xl md:text-8xl font-black tracking-tight leading-none mt-2" style={{ color: theme.accent }}>
            156
          </Text>
          <Text className="font-outfit mt-3 md:mt-4 max-w-lg text-base md:text-xl text-white/80 leading-snug">
            Collaborations across startups, studios, and global product teams.
          </Text>

          {/* Sector tiles */}
          <View className="mt-6 md:mt-10 flex-col gap-3 md:flex-row md:gap-4 h-72 md:h-56">
            <ClientTile sector="Consumer Apps" note="Social, media, entertainment." tileClass="bg-[#25F4EE]" textClass="text-[#161823]" dark />
            <ClientTile sector="Fintech & SaaS" note="Dashboards, onboarding flows." tileClass="bg-[#FE2C55]" textClass="text-white" />
            <ClientTile sector="Commerce" note="Brand stores, campaign pages." tileClass="bg-[#161823]" textClass="text-white" />
          </View>
        </View>
      </View>
    </DomainShell>
  );
}
