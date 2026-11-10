import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { pursue, useCatStore } from "../../shared/cat-store.js";
import { COLORS } from "../../shared/tokens.js";
import AnimatedBackground from "../background/animated-background.js";
import ScreenCat from "../pet/screen-cat.js";

/**
 * Domain shell: the full-screen frame for one "dimension".
 *
 * Layers the 2D animated background (`animated-background`), the Shimeji-style
 * screen cat (`screen-cat`), and the domain content, opening with an
 * expanding-color overture that grows from the exact pointer position where
 * the opening card was clicked (staged in the cat store by the portals).
 * Every click anywhere is forwarded to the cat as a chase target.
 * @module components/domain/domain-shell
 */

/**
 * Props for {@link DomainShell}.
 *
 * @typedef {object} DomainShellProps
 * @property {import("../../shared/tokens.js").DimensionTheme} theme Theme of the dimension being expanded into.
 * @property {import("react").ReactNode} [children] Dimension content layered above the scene.
 * @property {boolean} [returnPortal] When true, render the portal tile back to home (dimension/404 pages).
 * @property {boolean} [calm] Calm variant with fewer background blobs (404 treatment).
 */

/**
 * Internal overture snapshot used for the mount animation.
 *
 * @typedef {object} OvertureState
 * @property {import("../../shared/cat-store.js").ExpansionOrigin} origin Pointer origin of this expansion.
 * @property {Animated.Value} grow Disc scale animation.
 * @property {Animated.Value} fade Disc fade animation.
 */

/**
 * Themed dimension shell with pointer-originated expansion, click-chasing cat,
 * and portal exit.
 *
 * @param {DomainShellProps} props - Component props.
 * @returns {JSX.Element} Full-screen themed stage + content layer.
 */
export default function DomainShell({ theme, children, returnPortal = false, calm = false }) {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const [overture] = useState(/** @type {OvertureState} */ (() => ({
    origin: useCatStore.getState().takeExpansionOrigin() ?? { x: 0.5, y: 0.5 },
    grow: new Animated.Value(0),
    fade: new Animated.Value(1)
  })));
  const { origin, grow, fade } = overture;

  // Overture: expanding accent disc from the opening click + cat drop-in.
  useEffect(() => {
    pursue({ x: origin.x, y: origin.y + 0.34, teleport: true });
    if (typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      return undefined;
    }
    Animated.sequence([
      Animated.timing(grow, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 900, useNativeDriver: true })
    ]).start(() => setEntered(true));
    return undefined;
  }, [grow, fade, origin]);

  // Forward every window click to the screen cat as a chase target.
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
      {/* 2D animated stage */}
      <AnimatedBackground theme={theme} blobCount={calm ? 4 : 8} />
      <ScreenCat />

      {/* Content layer stays hit-testable; the stage and cat pass clicks through */}
      <View className="flex-1" pointerEvents="box-none">
        {children}

        {/* Domain-expansion overture: accent disc grows from the click point, then fades */}
        {!entered && (
          <View pointerEvents="none" className="absolute inset-0">
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: 220,
                  backgroundColor: theme.accent,
                  left: `${origin.x * 100}%`,
                  top: `${origin.y * 100}%`,
                  marginLeft: -110,
                  marginTop: -110
                },
                {
                  transform: [{ scale: grow.interpolate({ inputRange: [0, 1], outputRange: [0.05, 32] }) }],
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
