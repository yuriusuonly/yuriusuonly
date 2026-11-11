import { useEffect, useState } from "react";
import { Animated, View } from "react-native";
import { useExpansionStore } from "../stores/expansion-store.js";
import AnimatedBackground from "./animated-background.js";

/**
 * Domain shell: the full-screen frame for one "dimension".
 *
 * Layers the 2D animated background (`animated-background`) and the domain
 * content. Tiles entering expand the domain from their click point: the
 * destination mounts already covered by the pressed tile's accent disc, which
 * then dissolves into the new environment (the uncover overture). Returning
 * home is a plain navigation — browser back mounts with no overture.
 * @module components/domain-shell
 */

/**
 * Props for {@link DomainShell}.
 *
 * @typedef {object} DomainShellProps
 * @property {import("../shared/theme.js").DimensionTheme} theme Theme of the dimension being expanded into.
 * @property {import("react").ReactNode} [children] Dimension content layered above the scene.
 * @property {boolean} [calm] Calm variant with fewer background blobs (404 treatment).
 */

/**
 * Internal overture state: values for the mount (uncover) animation.
 *
 * @typedef {object} OvertureState
 * @property {import("../stores/expansion-store.js").ExpansionOrigin} origin Pointer origin of this expansion.
 * @property {"uncover"|"none"} mode Which overture to play on mount.
 * @property {string} accent Disc color (the pressed tile's accent on entry).
 * @property {Animated.Value} grow Disc scale driver.
 * @property {Animated.Value} fade Disc opacity driver.
 */

/**
 * Themed dimension shell with pointer-originated expansion.
 *
 * @param {DomainShellProps} props - Component props.
 * @returns {JSX.Element} Full-screen themed stage + content layer.
 */
export default function DomainShell({ theme, children, calm = false }) {
  const [overture] = useState(/** @type {OvertureState} */ (() => {
    // Snapshot-read the staged cover (never consume in render: React
    // double-invokes initializers, and a consuming read would hand the second
    // call a cleared store, dropping the pointer origin). Clearing happens in
    // the mount effect via clearStages once this state is stamped.
    const { entry } = useExpansionStore.getState();
    if (entry) {
      return { origin: entry.origin, accent: entry.accent, mode: "uncover", grow: new Animated.Value(1), fade: new Animated.Value(0) };
    }
    // Cold load / browser back: no pointer origin known — no overture.
    return { origin: { x: 0.5, y: 0.5 }, accent: theme.accent, mode: "none", grow: new Animated.Value(0), fade: new Animated.Value(1) };
  }));
  const { origin, mode, accent, grow, fade } = overture;
  const [entered, setEntered] = useState(mode === "none");

  // Mount overture: dissolve the staged cover into the new environment.
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
    // Uncover: arrive still covered by the pressed tile's accent disc, then
    // dissolve the cover into the new environment.
    Animated.timing(fade, { toValue: 1, duration: 850, useNativeDriver: false }).start(() => setEntered(true));
    return undefined;
  }, [mode, fade]);

  /** Mount-time cover disc (uncover). */
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

  return (
    <View className="flex-1" style={{ backgroundColor: theme.void }}>
      {/* 2D animated stage */}
      <AnimatedBackground theme={theme} blobCount={calm ? 4 : 8} />

      {/* Content layer stays hit-testable; the stage passes clicks through */}
      <View className="flex-1" pointerEvents="box-none">
        {children}

        {/* Domain-expansion overlay */}
        {!entered && (
          <View pointerEvents="none" className="absolute inset-0">
            {overtureDisc}
          </View>
        )}
      </View>
    </View>
  );
}
