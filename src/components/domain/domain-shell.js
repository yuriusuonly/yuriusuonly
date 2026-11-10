import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { pursue, useCatStore } from "../../stores/cat-store.js";
import { useExpansionStore } from "../../stores/expansion-store.js";
import { COLORS } from "../../shared/tokens.js";
import AnimatedBackground from "../background/animated-background.js";
import ScreenCat from "../pet/screen-cat.js";

/**
 * Domain shell: the full-screen frame for one "dimension".
 *
 * Layers the 2D animated background (`animated-background`), the Shimeji-style
 * screen cat (`screen-cat`), and the domain content. Tiles entering expand the
 * domain from their click point; the return portal plays the same animation in
 * reverse — the domain's accent disc grows to cover the screen, the previous
 * screen mounts still covered, and the disc shrinks back into the portal point
 * while fading (the collapse).
 * Every click anywhere is forwarded to the cat as a respawn target.
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
 * Internal overture state: values for the mount (expand or collapse) animation.
 *
 * @typedef {object} OvertureState
 * @property {import("../../stores/expansion-store.js").ExpansionOrigin} origin Pointer origin of this expansion or collapse.
 * @property {"expand"|"collapse"} mode Which overture to play on mount.
 * @property {string} accent Disc color (destination theme on expand; the leaving dimension's accent on collapse).
 * @property {Animated.Value} grow Disc scale driver.
 * @property {Animated.Value} fade Disc opacity driver (set only while covered on collapse).
 */

/**
 * Themed dimension shell with pointer-originated expansion, reverse collapse
 * on return, click-respawning cat, and portal exit.
 *
 * @param {DomainShellProps} props - Component props.
 * @returns {JSX.Element} Full-screen themed stage + content layer.
 */
export default function DomainShell({ theme, children, returnPortal = false, calm = false }) {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [overture] = useState(/** @type {OvertureState} */ (() => {
    // A staged exit means we are the previous screen re-opening in reverse.
    const stagedExit = useExpansionStore.getState().takeExitStage();
    const origin = stagedExit
      ? stagedExit.origin
      : useExpansionStore.getState().takeExpansionOrigin() ?? { x: 0.5, y: 0.5 };
    return {
      origin,
      mode: stagedExit ? "collapse" : "expand",
      accent: stagedExit ? stagedExit.accent : theme.accent,
      grow: new Animated.Value(stagedExit ? 1 : 0),
      fade: new Animated.Value(stagedExit ? 0 : 1)
    };
  }));
  const { origin, mode, accent, grow, fade } = overture;
  /** @type {{ current: boolean }} */
  const leavingRef = useRef(/** @type {boolean} */ (false));
  const exitGrow = useRef(new Animated.Value(0)).current;

  // Mount overture: expand forward, or play the collapse in reverse.
  useEffect(() => {
    pursue({ x: origin.x, y: origin.y * 0.6, teleport: true });
    if (typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      return undefined;
    }
    if (mode === "collapse") {
      // Reverse: still covered by the leaving dimension's accent disc —
      // shrink back into the portal point while the cover fades away.
      Animated.parallel([
        Animated.timing(grow, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true, delay: 260 })
      ]).start(() => setEntered(true));
    } else {
      Animated.sequence([
        Animated.timing(grow, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 900, useNativeDriver: true })
      ]).start(() => setEntered(true));
    }
    return undefined;
  }, [mode, grow, fade, origin]);

  // Forward every window click to the screen cat as a respawn target.
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

  /** Ongoing collapse on this screen, or the mount-time reverse overture. */
  const overtureDisc = (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: 220,
          backgroundColor: accent,
          left: `${origin.x * 100}%`,
          top: `${origin.y * 100}%`,
          marginLeft: -110,
          marginTop: -110
        },
        leaving
          ? // Forward part of the return: grow to cover before navigation.
            { transform: [{ scale: exitGrow.interpolate({ inputRange: [0, 1], outputRange: [0.05, 32] }) }], opacity: 1 }
          : {
              transform: [{ scale: grow.interpolate({ inputRange: [0, 1], outputRange: [0.05, 32] }) }],
              opacity: fade.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] })
            }
      ]}
    />
  );

  /**
   * Return portal press: cover this screen with the collapsing disc, then go.
   *
   * @param {import("react-native").GestureResponderEvent} event Portal press event.
   * @returns {void}
   */
  const collapseHome = (event) => {
    if (leavingRef.current) {
      return;
    }
    leavingRef.current = true;
    const point = typeof event?.nativeEvent?.clientX === "number" ? event.nativeEvent : null;
    const exitOrigin = point && typeof window !== "undefined"
      ? {
          x: point.clientX / window.innerWidth,
          y: point.clientY / window.innerHeight
        }
      : { x: 0.5, y: 0.5 };
    // Stage the reverse overture for the next screen mount, then cover here.
    useExpansionStore.getState().setExitStage({ origin: exitOrigin, accent: theme.accent });
    setLeaving(true);
    Animated.timing(exitGrow, { toValue: 1, duration: 340, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        router.push("/");
      }
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.void }}>
      {/* 2D animated stage */}
      <AnimatedBackground theme={theme} blobCount={calm ? 4 : 8} />
      <ScreenCat />

      {/* Content layer stays hit-testable; the stage and cat pass clicks through */}
      <View className="flex-1" pointerEvents="box-none">
        {children}

        {/* Domain-expansion / collapse overlay (hidden once fully entered) */}
        {!entered && (
          <View pointerEvents="none" className="absolute inset-0">
            {overtureDisc}
          </View>
        )}

        {/* Return portal */}
        {returnPortal && (
          <View pointerEvents="box-none" className="absolute bottom-5 self-center md:bottom-8">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Collapse domain and return home"
              onPress={collapseHome}
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
