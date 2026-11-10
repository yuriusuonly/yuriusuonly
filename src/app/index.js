import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useExpansionStore } from "../stores/expansion-store.js";
import config from "../shared/config.js";
import { DIMENSIONS } from "../shared/tokens.js";
import DomainShell from "../components/domain/domain-shell.js";
import TiltCard from "../components/motion/tilt-card.js";
import logo from "../../png/logo.png";

/**
 * Home route (`src/app/index.js`): 2D interactive bento-grid portfolio layout
 * following DESIGN.md (bento layout, TikTok palette + typography tokens).
 * Bento tiles are portals: pressing one expands its domain from the click —
 * the overture opens a themed dimension page there.
 * @module app/index
 */

/**
 * Card top-right crop-mark accent used across the bento tiles.
 *
 * @param {{ markClass?: string }} [props] - Tailwind border-color override for the accent (defaults to white — for red/`#161823` tiles; blue tiles use a dark mark).
 * @returns {JSX.Element} Small corner bracket decoration positioned absolutely.
 */
function CornerMark({ markClass = "border-white/90" }) {
  return (
    <View
      className={`absolute right-2 top-2 h-2.5 w-2.5 md:h-3 md:w-3 border-t-2 border-r-2 ${markClass}`}
    />
  );
}

/**
 * Stage the domain-expansion origin from a press event and push the route.
 *
 * @param {import("expo-router").Router} router Expo Router instance.
 * @param {string} href Dimension route to expand into.
 * @param {import("react-native").GestureResponderEvent} [event] Press event for the pointer origin (falls back to center).
 * @returns {void}
 */
function expandTo(router, href, event) {
  const point = typeof event?.nativeEvent?.clientX === "number" ? event.nativeEvent : null;
  if (point && typeof window !== "undefined") {
    useExpansionStore.getState().setExpansionOrigin({
      x: point.clientX / window.innerWidth,
      y: point.clientY / window.innerHeight
    });
  }
  router.push(href);
}

/**
 * Props for {@link StatTile}.
 *
 * @typedef {object} StatTileProps
 * @property {string} number Placeholder metric number to display.
 * @property {string} label Tile label rendered below the number.
 * @property {string} tileClass Tailwind classes for the tile surface.
 * @property {string} [numberClass] Optional text color override for number and label.
 * @property {string} [markClass] Optional corner-mark border color override.
 * @property {string} [href] Route to push when the portal tile is pressed; omit for a non-portal tile.
 */

/**
 * Numbered stat tile doubling as a domain portal when `href` is set.
 *
 * @param {StatTileProps} props - Component props.
 * @returns {JSX.Element} A rounded, tilting stat tile that opens its dimension.
 */
function StatTile({ number, label, tileClass, numberClass, markClass, href }) {
  const router = useRouter();
  const tile = (
    <View className={`relative h-full flex-1 items-center justify-center rounded-2xl ${tileClass}`}>
      <CornerMark {...(markClass ? { markClass } : {})} />
      <Text className={`font-outfit text-2xl md:text-4xl font-extrabold leading-none ${numberClass ?? "text-[#161823]"}`}>{number}</Text>
      <Text className={`font-outfit mt-1 md:mt-2 text-sm md:text-base ${numberClass ?? "text-[#161823]"}`}>{label}</Text>
    </View>
  );
  if (!href) {
    return tile;
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={(/** @type {import("react-native").GestureResponderEvent} */ e) => expandTo(router, href, e)} className="flex-1 active:opacity-90">
      <TiltCard style={{ flex: 1 }} maxTilt={10}>
        {tile}
      </TiltCard>
    </Pressable>
  );
}

/**
 * Landing screen rendered at `/`: left identity card + right bento grid of
 * domain portals, staged inside the home-themed 2D dimension.
 *
 * @returns {JSX.Element} The 2D bento-grid portfolio layout.
 */
export default function Index() {
  const router = useRouter();
  /** @param {string} href @param {import("react-native").GestureResponderEvent} [event] */
  const expand = (href, event) => expandTo(router, href, event);

  return (
    <DomainShell theme={DIMENSIONS.home}>
      <View className="flex-1 items-center justify-center p-4 md:p-10">
        <View className="w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[2.75rem] p-5 md:p-8 flex-col md:flex-row gap-6 md:gap-8">
          {/* Left rail: cyan about card */}
          <View className="flex-col gap-2 mt-14 md:mt-0 md:w-[38%]">
            <View className="flex-row items-center gap-2">
              <Text className="text-base text-[#161823]">❖</Text>
              <Text className="font-outfit text-base md:text-lg font-semibold text-[#161823]">About Me</Text>
            </View>
            <View className="relative flex-1 bg-[#25F4EE] rounded-3xl p-5 md:p-6 items-center justify-center">
              <CornerMark markClass="border-[#161823]/90" />
              {/* Avatar with ring on pink circle */}
              <View className="h-32 w-32 md:h-40 md:w-40 items-center justify-center rounded-full border-2 border-[#161823] bg-[#FE2C55]">
                <Image
                  source={logo}
                  className="!h-28 !w-28 md:!h-32 md:!w-32 rounded-full"
                  resizeMode="cover"
                  accessibilityLabel={`${config.title} logo`}
                />
              </View>
              {/* Identity */}
              <View className="mt-4 md:mt-6 self-start">
                <Text className="font-outfit text-2xl md:text-4xl font-semibold text-[#161823]">{config.title}</Text>
              </View>
              {/* Contact + spinning badge row */}
              <View className="mt-4 md:mt-6 self-stretch flex-row items-end justify-between gap-2">
                <View className="flex-1 border-b border-dashed border-[#161823]/70 pb-2">
                  <Text className="font-outfit text-xs md:text-sm text-[#161823]">{config.description}</Text>
                </View>
                <View className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#161823] items-center justify-center">
                  <View className="h-3 w-3 md:h-3.5 md:w-3.5 rounded-full bg-white" />
                </View>
              </View>
            </View>
          </View>

          {/* Right: giant title + bento portals */}
          <View className="flex-1 flex-col gap-4 md:gap-6">
            <View className="relative self-start px-1">
              <Text className="font-outfit text-5xl md:text-8xl font-black tracking-tight text-[#161823] leading-none">
                {config.title}
              </Text>
              <View className="absolute -top-1 right-0 h-3 w-3 md:h-4 md:w-4 border-t-4 border-r-4 border-[#161823]" />
            </View>

            {/* Row 1: featured image portal + stacked stat portals */}
            <View className="flex-row gap-3 md:gap-4 h-44 md:h-64">
              <Pressable accessibilityRole="button" accessibilityLabel="Open the projects dimension" onPress={(/** @type {import("react-native").GestureResponderEvent} */ e) => expand("/dimensions/projects", e)} className="flex-1 active:opacity-90">
                <TiltCard style={{ flex: 1 }} maxTilt={10}>
                  <View className="relative h-full flex-1 overflow-hidden rounded-2xl bg-[#25F4EE]">
                    <CornerMark markClass="border-[#161823]/90" />
                    <Image
                      source={logo}
                      className="!h-full !w-full"
                      resizeMode="cover"
                      accessibilityLabel={`${config.title} featured work`}
                    />
                  </View>
                </TiltCard>
              </Pressable>
              <View className="flex-col gap-3 md:gap-4 w-24 md:w-40">
                <StatTile number="251" label="Projects" tileClass="bg-[#25F4EE]" markClass="border-[#161823]/90" href="/dimensions/projects" />
                <StatTile number="156" label="Awards" tileClass="bg-[#FE2C55]" numberClass="text-white" href="/dimensions/awards" />
              </View>
            </View>

            {/* Row 2: clients + awards portals */}
            <View className="flex-row gap-3 md:gap-4 h-28 md:h-36">
              <Pressable accessibilityRole="button" accessibilityLabel="Open the clients dimension" onPress={(/** @type {import("react-native").GestureResponderEvent} */ e) => expand("/dimensions/clients", e)} className="flex-1 active:opacity-90">
                <TiltCard style={{ flex: 1 }} maxTilt={10}>
                  <View className="relative h-full flex-1 rounded-2xl bg-[#161823] items-center justify-center">
                    <CornerMark />
                    <Text className="font-outfit mt-3 md:mt-4 text-base md:text-xl text-white">Clients</Text>
                  </View>
                </TiltCard>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Open the awards dimension" onPress={(/** @type {import("react-native").GestureResponderEvent} */ e) => expand("/dimensions/awards", e)} className="flex-1 active:opacity-90">
                <TiltCard style={{ flex: 1 }} maxTilt={10}>
                  <View className="relative h-full flex-1 flex-row rounded-2xl bg-[#161823] overflow-hidden">
                    <View className="flex-1 items-center justify-center p-2 md:p-4">
                      <Image
                        source={logo}
                        className="!h-10 !w-10 md:!h-14 md:!w-14 rounded-full"
                        resizeMode="cover"
                        accessibilityLabel={`${config.title} awards highlight`}
                      />
                    </View>
                    <View className="relative flex-1 bg-[#25F4EE] items-center justify-center p-2 md:p-4">
                      <CornerMark markClass="border-[#161823]/90" />
                      <Text className="font-outfit text-xl md:text-3xl font-extrabold leading-none text-[#161823]">172</Text>
                      <Text className="font-outfit mt-1 text-xs md:text-sm text-[#161823] leading-tight">Global Design Awards.</Text>
                    </View>
                  </View>
                </TiltCard>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </DomainShell>
  );
}
