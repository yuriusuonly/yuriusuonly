import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, View } from "react-native";

/**
 * 2D animated dimension background.
 *
 * The themed void filled with slow, drifting brand-colored blobs — pure
 * React Native Web views + `Animated` loops (no WebGL; prerender-safe since
 * nothing renders client-side-only content during static export). Blob
 * palette/positions derive deterministically from the dimension theme.
 * @module components/background/animated-background
 */

/**
 * Props for {@link AnimatedBackground}.
 *
 * @typedef {object} AnimatedBackgroundProps
 * @property {import("../../shared/theme.js").DimensionTheme} theme Theme tokens (void background, blob palette).
 * @property {number} [blobCount] How many drifting blobs to render (default 8; use 4 for calmer screens).
 */

/**
 * One drifting, blurred blob.
 *
 * @param {{ left: string, top: string, size: number, color: string, driftMs: number }} props Deterministic placement/palette derived in the parent.
 * @returns {JSX.Element} An endlessly drifting blob.
 */
function Blob({ left, top, size, color, driftMs }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: driftMs, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: driftMs, useNativeDriver: true })
      ])
    );
    drift.start();
    return () => drift.stop();
  }, [anim, driftMs]);

  const y = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 34] });
  const x = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -46] });

  return (
    <Animated.View
      className="absolute rounded-full blur-3xl"
      style={{ left, top, width: size, height: size, backgroundColor: color, opacity: 0.5, transform: [{ translateX: x }, { translateY: y }] }}
    />
  );
}

/**
 * Themed 2D animated background layer (backdrop + drifting blobs).
 *
 * @param {AnimatedBackgroundProps} props - Component props.
 * @returns {JSX.Element} An absolutely positioned full-size background layer.
 */
export default function AnimatedBackground({ theme, blobCount = 8 }) {
  // Deterministic blob layout (stable across renders and prerenders).
  const blobs = useMemo(() => {
    /** @type {Array<{ left: string, top: string, size: number, color: string, driftMs: number }>} */
    const list = [];
    for (let i = 0; i < blobCount; i += 1) {
      const leftPct = (i * 61) % 90 + 3;
      const topPct = (((i * 37) % 70) + 6);
      list.push({
        left: `${leftPct}%`,
        top: `${topPct}%`,
        size: 180 + ((i * 97) % 5) * 70,
        color: theme.shapes[i % theme.shapes.length],
        driftMs: 5200 + (i % 4) * 1700
      });
    }
    return list;
  }, [theme, blobCount]);

  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden" style={{ backgroundColor: theme.void }}>
      {blobs.map((blob, i) => (
        <Blob key={`blob-${i}`} left={blob.left} top={blob.top} size={blob.size} color={blob.color} driftMs={blob.driftMs} />
      ))}
    </View>
  );
}
