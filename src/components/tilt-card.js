import { useEffect, useRef } from "react";
import { Animated } from "react-native";

/**
 * Pointer-tilt wrapper for bento tiles and cards.
 *
 * The wrapped children tilt in 3D toward the pointer while hovered and spring
 * back on leave. Implemented over react-native-web DOM events (guarded so
 * native and non-DOM environments simply do nothing) with reduced-motion
 * respected: when `prefers-reduced-motion: reduce` is set the card is static.
 * @module components/tilt-card
 */

/**
 * Props for {@link TiltCard}.
 *
 * @typedef {object} TiltCardProps
 * @property {import("react").ReactNode} children Tile content.
 * @property {number} [maxTilt] Maximum tilt in degrees toward the pointer (default 8).
 * @property {import("react").StyleProp<import("react-native").ViewStyle>} [style] Extra style for the animated wrapper.
 * @property {string} [className] NativeWind classes for the animated wrapper.
 */

/**
 * Card that tilts toward the pointer and springs back home.
 *
 * @param {TiltCardProps} props - Component props.
 * @returns {JSX.Element} An animated view wrapping the children.
 */
export default function TiltCard({ children, maxTilt = 8, style, className }) {
  /** @type {import("react").MutableRefObject<any>} */
  const nodeRef = useRef(null);
  const tiltX = /** @type {import("react").MutableRefObject<Animated.Value>} */ (useRef(new Animated.Value(0)).current);
  const tiltY = /** @type {import("react").MutableRefObject<Animated.Value>} */ (useRef(new Animated.Value(0)).current);

  useEffect(() => {
    const node = nodeRef.current;
    if (typeof window === "undefined" || !node || typeof node.addEventListener !== "function") {
      return undefined;
    }
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    /** @param {PointerEvent} event */
    const onMove = (event) => {
      const rect = node.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      tiltY.setValue(nx * maxTilt);
      tiltX.setValue(-ny * maxTilt);
    };
    const onLeave = () => {
      Animated.spring(tiltX, { toValue: 0, bounciness: 6, useNativeDriver: false }).start();
      Animated.spring(tiltY, { toValue: 0, bounciness: 6, useNativeDriver: false }).start();
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [tiltX, tiltY, maxTilt]);

  return (
    <Animated.View
      ref={nodeRef}
      className={className}
      style={[
        style,
        { transform: [{ perspective: 900 }, { rotateX: tiltX }, { rotateY: tiltY }] }
      ]}
    >
      {children}
    </Animated.View>
  );
}
