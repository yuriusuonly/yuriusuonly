import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useExpansionStore } from "../../stores/expansion-store.js";
import { COLORS } from "../../shared/tokens.js";
import AnimatedBackground from "../background/animated-background.js";

/**
 * Domain shell: the full-screen frame for one "dimension".
 *
 * Layers the 2D animated background (`animated-background`) and the domain
 * content. Tiles entering expand the domain from their click point; the
 * return portal plays the same animation in reverse — the domain's accent
 * disc grows to cover the screen, the previous screen mounts still covered,
 * and the disc shrinks back into the portal point while fading (the collapse).
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
 * @property {"uncover"|"collapse"|"none"} mode Which overture to play on mount.
 * @property {string} accent Disc color (the pressed tile's accent on entry; the leaving dimension's on collapse).
 * @property {Animated.Value} grow Disc scale driver.
 * @property {Animated.Value} fade Disc opacity driver (set only while covered on collapse).
 */

/**
 * Themed dimension shell with pointer-originated expansion, reverse collapse
 * on return, and portal exit.
 *
 * @param {DomainShellProps} props - Component props.
 * @returns {JSX.Element} Full-screen themed stage + content layer.
 */
export default function DomainShell({ theme, children, returnPortal = false, calm = false }) {
  const router = useRouter();

  const [overture] = useState(/** @type {OvertureState} */ (() => {
    // Snapshot-read the staged covers (never consume in render: React
    // double-invokes initializers, and a consuming read would hand the second
    // call a cleared store, dropping the pointer origin). Clearing happens in
    // the mount effect via clearStages once this state is stamped.
    const { exit, entry } = useExpansionStore.getState();
    if (exit) {
      return { origin: exit.origin, accent: exit.accent, mode: "collapse", grow: new Animated.Value(1), fade: new Animated.Value(0) };
    }
    if (entry) {
      return { origin: entry.origin, accent: entry.accent, mode: "uncover", grow: new Animated.Value(1), fade: new Animated.Value(0) };
    }
    // Cold load / browser back: no pointer origin known — no overture.
    return { origin: { x: 0.5, y: 0.5 }, accent: theme.accent, mode: "none", grow: new Animated.Value(0), fade: new Animated.Value(1) };
  }));
  const { origin, mode, accent, grow, fade } = overture;
  const [entered, setEntered] = useState(mode === "none");
  /** @type {{ current: boolean }} */
  const leavingRef = useRef(/** @type {boolean} */ (false));

  // Mount overture: dissolve the staged cover, or play the collapse in reverse.
  useEffect(() => {
    useExpansionStore.getState().clearStages();
    if (
      mode === "none" ||
      (typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      setEntered(true);
      return undefined;
    }
    if (mode === "uncover") {
      // Expansion end: arrive still covered by the pressed tile's accent
      // disc, then dissolve the cover into the new environment.
      Animated.timing(fade, { toValue: 1, duration: 850, useNativeDriver: true }).start(() => setEntered(true));
      return undefined;
    }
    // Collapse: return plays the open animation in reverse — home mounts covered
    // and the disc shrinks back into the "Collapse domain" press point.
    Animated.parallel([
      Animated.timing(grow, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true, delay: 220 })
    ]).start(() => setEntered(true));
    return undefined;
  }, [mode, grow, fade, origin]);

  /** Mount-time cover disc (uncover or reverse-collapse). */
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
        {
          transform: [{ scale: grow.interpolate({ inputRange: [0, 1], outputRange: [0.05, 32] }) }],
          opacity: fade.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] })
        }
      ]}
    />
  );

  /**
   * Return portal press: stage the reverse animation at the pointer and go home.
   * Home mounts covered and plays the open animation in reverse, ending at this
   * press point (single animation, no intermediate grow on this screen).
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
    // Stage the reverse overture for home at this press point, then navigate.
    useExpansionStore.getState().setExitStage({ origin: exitOrigin, accent: theme.accent });
    router.push("/");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.void }}>
      {/* 2D animated stage */}
      <AnimatedBackground theme={theme} blobCount={calm ? 4 : 8} />

      {/* Content layer stays hit-testable; the stage passes clicks through */}
      <View className="flex-1" pointerEvents="box-none">
        {children}

        {/* Domain-expansion / collapse overlay */}
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
