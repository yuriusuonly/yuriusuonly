import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useExpansionStore } from "../stores/expansion-store.js";
import config from "../shared/config.js";
import { COLORS } from "../shared/theme.js";

/**
 * Home dimension theme composed locally from base color tokens.
 *
 * @type {import("../shared/theme.js").DimensionTheme}
 */
const HOME_THEME = {
  id: "home",
  name: "Home",
  tagline: "The stage dimension.",
  accent: COLORS.primary,
  void: "#EAF7F6",
  shapes: [COLORS.primary, COLORS.secondary, COLORS.ink],
  lightColor: "#BDFCF8",
  rimColor: COLORS.secondary,
  headlineClass: "text-[#161823]"
};
import DomainShell from "../components/domain/domain-shell.js";
import TiltCard from "../components/motion/tilt-card.js";
import logo from "../../png/logo.png";

/**
 * Home route (`src/app/index.js`): 2D interactive bento-grid portfolio layout
 * following DESIGN.md (bento layout, TikTok palette + typography tokens).
 * Bento tiles are portals: pressing one grows the tile's accent disc from the
 * click to cover the screen, then the pressed card's domain opens already
 * covered and dissolves into its themed environment.
 * @module app/index
 */

/** Duration (ms) of the pressed-card cover before navigation. */
const COVER_MS = 340;

/**
 * Card top-right crop-mark accent used across the bento tiles.
 *
 * @param {{ markClass?: string, positionClass?: string }} [props] - Tailwind overrides: border color and inset position (defaults align to the card edge).
 * @returns {JSX.Element} Small corner bracket decoration positioned absolutely.
 */
function CornerMark({ markClass = "border-white/90", positionClass = "right-2 top-2" }) {
  return (
    <View
      className={`absolute h-2.5 w-2.5 md:h-3 md:w-3 border-t-2 border-r-2 ${positionClass} ${markClass}`}
    />
  );
}

/**
 * Props for {@link StatTile}.
 *
 * @typedef {object} StatTileProps
 * @property {string} number Placeholder metric number to display.
 * @property {string} label Tile label rendered below the number.
 * @property {string} tileClass Tailwind classes for the tile surface.
 * @property {string} accent Accent color used for the expansion cover disc.
 * @property {string} [numberClass] Optional text color override for number and label.
 * @property {string} [markClass] Optional corner-mark border color override.
 * @property {string} [href] Route to push when the portal tile is pressed; omit for a non-portal tile.
 * @property {(href: string, accent: string, event?: import("react-native").GestureResponderEvent) => void} [onOpen] Portal open callback (required with href).
 */

/**
 * Numbered stat tile doubling as a domain portal when `href` is set.
 *
 * @param {StatTileProps} props - Component props.
 * @returns {JSX.Element} A rounded, tilting stat tile that opens its dimension.
 */
function StatTile({ number, label, tileClass, accent, numberClass, markClass, href, onOpen }) {
  const tile = (
    <View className={`relative h-full flex-1 items-center justify-center rounded-2xl ${tileClass}`}>
      <CornerMark positionClass="right-4 top-4 md:right-5 md:top-5" {...(markClass ? { markClass } : {})} />
      <Text className={`font-outfit text-2xl md:text-4xl font-extrabold leading-none ${numberClass ?? "text-[#161823]"}`}>{number}</Text>
      <Text className={`font-outfit mt-1 md:mt-2 text-sm md:text-base ${numberClass ?? "text-[#161823]"}`}>{label}</Text>
    </View>
  );
  if (!href || !onOpen) {
    return tile;
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={(/** @type {import("react-native").GestureResponderEvent} */ e) => onOpen(href, accent, e)} className="flex-1 active:opacity-90">
      <TiltCard style={{ flex: 1 }} maxTilt={10}>
        {tile}
      </TiltCard>
    </Pressable>
  );
}

/**
 * Pointer origin of a press as normalized viewport coordinates.
 *
 * @param {import("react-native").GestureResponderEvent} [event] Press event.
 * @returns {import("../stores/expansion-store.js").ExpansionOrigin} Normalized origin (center fallback).
 */
function originOf(event) {
  const point = event?.nativeEvent;
  if (point && typeof point.clientX === "number" && typeof window !== "undefined") {
    return {
      x: point.clientX / window.innerWidth,
      y: point.clientY / window.innerHeight
    };
  }
  return { x: 0.5, y: 0.6 };
}

/**
 * Landing screen rendered at `/`: left identity card + right pane (large black
 * projects portal and two stacked stat portals beside it), staged inside the
 * home-themed 2D dimension.
 *
 * @returns {JSX.Element} The 2D bento-grid portfolio layout.
 */
export default function Index() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(/** @type {{ href: string, origin: import("../stores/expansion-store.js").ExpansionOrigin, accent: string }|null} */ (null));
  const coverGrow = useRef(new Animated.Value(0)).current;

  // Clear any stale forward cover when Home is (re)focused so returning here
  // only shows the shell's closing (collapse) animation, never a replayed open.
  useFocusEffect(
    useCallback(() => {
      coverGrow.stopAnimation();
      coverGrow.setValue(0);
      setLeaving(null);
    }, [coverGrow])
  );

  // Pressed-card cover: grow the tile accent disc from the click, then stage
  // the destination handoff and navigate.
  useEffect(() => {
    if (!leaving) {
      return undefined;
    }
    if (typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      useExpansionStore.getState().setEntryStage({ origin: leaving.origin, accent: leaving.accent });
      router.push(leaving.href);
      return undefined;
    }
    Animated.timing(coverGrow, { toValue: 1, duration: COVER_MS, useNativeDriver: true }).start(({ finished }) => {
      if (!finished) {
        return;
      }
      useExpansionStore.getState().setEntryStage({ origin: leaving.origin, accent: leaving.accent });
      router.push(leaving.href);
    });
    return undefined;
  }, [leaving, coverGrow, router]);

  /**
   * Open a tile's domain: capture the pointer origin, play the cover here.
   *
   * @param {string} href Dimension route to expand into.
   * @param {string} accent The pressed tile's accent color (cover disc).
   * @param {import("react-native").GestureResponderEvent} [event] Press event for the pointer origin.
   * @returns {void}
   */
  const openDimension = (href, accent, event) => {
    if (leaving) {
      return;
    }
    setLeaving({ href, origin: originOf(event), accent });
  };

  return (
    <DomainShell theme={HOME_THEME}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-grow items-center justify-center p-4 md:p-10">
          <View className="w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[2.75rem] p-5 md:p-8 flex-col md:flex-row gap-4 md:gap-6">
          {/* Left rail: cyan about card */}
          <View className="flex-col gap-3 md:gap-4 md:w-[38%]">
            <View className="flex-row items-center gap-2">
              <Text className="text-base text-[#161823]">❖</Text>
              <Text className="font-outfit text-base md:text-lg font-semibold text-[#161823]">About Me</Text>
            </View>
            <View className="relative flex-1 bg-[#25F4EE] rounded-3xl p-5 md:p-6 items-center justify-center">
              <CornerMark markClass="border-[#161823]/90" positionClass="right-5 top-5 md:right-6 md:top-6" />
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

          {/* Right: large black projects card and two smaller stat cards beside it */}
          <View className="flex-1 flex-col gap-3 md:gap-4">
            <View className="hidden md:flex flex-row items-center gap-2 opacity-0" pointerEvents="none">
              <Text className="text-base">❖</Text>
              <Text className="font-outfit text-base md:text-lg font-semibold">About Me</Text>
            </View>
            <View className="h-56 flex-row gap-3 md:flex-1 md:h-auto md:gap-4">
              <Pressable accessibilityRole="button" accessibilityLabel="Open the clients dimension" onPress={(/** @type {import("react-native").GestureResponderEvent} */ e) => openDimension("/clients", COLORS.ink, e)} className="flex-1 active:opacity-90">
                <TiltCard style={{ flex: 1 }} maxTilt={10}>
                  <View className="relative h-full flex-1 overflow-hidden rounded-2xl bg-[#161823]">
                    <CornerMark positionClass="right-4 top-4 md:right-5 md:top-5" />
                    <Image
                      source={logo}
                      className="!h-full !w-full"
                      resizeMode="cover"
                      accessibilityLabel={`${config.title} clients`}
                    />
                  </View>
                </TiltCard>
              </Pressable>
              <View className="flex-col gap-3 md:gap-4 w-24 md:w-40">
                <StatTile number="251" label="Projects" tileClass="bg-[#25F4EE]" accent={COLORS.primary} markClass="border-[#161823]/90" href="/projects" onOpen={openDimension} />
                <StatTile number="156" label="Awards" tileClass="bg-[#FE2C55]" accent={COLORS.secondary} numberClass="text-white" href="/awards" onOpen={openDimension} />
              </View>
            </View>
          </View>
          </View>
        </View>
      </ScrollView>

      {/* Pressed-card cover disc: grows from the click until navigation */}
      {leaving && (
        <View pointerEvents="none" className="absolute inset-0">
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: 220,
                backgroundColor: leaving.accent,
                left: `${leaving.origin.x * 100}%`,
                top: `${leaving.origin.y * 100}%`,
                marginLeft: -110,
                marginTop: -110
              },
              { transform: [{ scale: coverGrow.interpolate({ inputRange: [0, 1], outputRange: [0.05, 32] }) }] }
            ]}
          />
        </View>
      )}
    </DomainShell>
  );
}
