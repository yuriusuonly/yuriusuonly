import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { pursue } from "../../shared/cat-store.js";
import DimensionScene from "../three/dimension-scene.js";
import { COLORS } from "../../shared/tokens.js";

/**
 * Domain shell: the full-screen frame for one "dimension".
 *
 * Wraps a themed WebGL scene (`dimension-scene`) with an expanding-color
 * overture that plays on arrival (the domain-expansion moment), forwards all
 * window clicks to the chibi cat as hop targets, teleports the cat in on
 * mount, and (on dimension pages) renders the return portal home.
 * @module components/domain/domain-shell
 */

/**
 * Props for {@link DomainShell}.
 *
 * @typedef {object} DomainShellProps
 * @property {import("../../shared/tokens.js").DimensionTheme} theme Theme of the dimension being expanded into.
 * @property {import("react").ReactNode} [children] Dimension content layered above the scene.
 * @property {boolean} [returnPortal] When true, render the portal tile back to home (dimension/404 pages).
 * @property {boolean} [floatShapes] Whether floating geometry renders (default true).
 */

/**
 * Themed dimension shell with overture, click-following cat, and portal exit.
 *
 * @param {DomainShellProps} props - Component props.
 * @returns {JSX.Element} Full-screen themed scene + content layer.
 */
export default function DomainShell({ theme, children, returnPortal = false, floatShapes = true }) {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const grow = /** @type {import("react").MutableRefObject<Animated.Value>} */ (useRef(new Animated.Value(0)).current);
  const fade = /** @type {import("react").MutableRefObject<Animated.Value>} */ (useRef(new Animated.Value(1)).current);

  // Overture: expanding accent disc + teleport pop + fade.
  useEffect(() => {
    pursue({ x: 0.5, y: 0.92, teleport: true });
    if (typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      return undefined;
    }
    Animated.sequence([
      Animated.timing(grow, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 900, useNativeDriver: true })
    ]).start(() => setEntered(true));
    return undefined;
  }, [grow, fade]);

  // Forward every window click to the chibi cat as a hop target.
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    /** @param {PointerEvent} event */
    const onDown = (event) => {
      pursue({
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight
      });
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.void }}>
      {/* Themed WebGL stage */}
      <DimensionScene theme={theme} floatShapes={floatShapes} />

      {/* Click-through scenery layer keeps children above the canvas */}
      <View className="absolute inset-0" pointerEvents="box-none">
        {children}

        {/* Domain-expansion overture: expanding accent disc, then soft fade */}
        {!entered && (
          <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: 240,
                  height: 240,
                  borderRadius: 240,
                  backgroundColor: theme.accent
                },
                {
                  transform: [{ scale: grow.interpolate({ inputRange: [0, 1], outputRange: [0.05, 26] }) }],
                  opacity: fade
                }
              ]}
            />
          </View>
        )}

        {/* Return portal */}
        {returnPortal && (
          <View pointerEvents="box-none" className="absolute bottom-5 self-center md:bottom-8">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Return home"
              onPress={() => router.push("/")}
              className="rounded-full px-5 py-3 md:px-6 md:py-3 active:opacity-80"
              style={{ backgroundColor: COLORS.surface }}
            >
              <View className="flex-row items-center gap-2">
                <Text style={{ color: COLORS.ink }}>◈</Text>
                <Text className="font-outfit text-sm md:text-base font-semibold" style={{ color: COLORS.ink }}>
                  Collapse domain · Home
                </Text>
              </View>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
