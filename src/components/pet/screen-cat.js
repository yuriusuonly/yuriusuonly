import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { useCatStore } from "../../shared/cat-store.js";
import { COLORS } from "../../shared/tokens.js";

/**
 * Shimeji-style screen pet: a 2D chibi cat roaming the page.
 *
 * Built entirely from React Native Web views (no WebGL, no sprites). Moves
 * independently — it drops in from above when a dimension opens, then
 * wanders along the bottom edge on its own; every click respawns it at the
 * clicked point (pop-in), and a small speech bubble announces where it is on
 * screen (e.g. "top-left", "center"). It can also be grabbed and dragged to
 * any location — release it anywhere and it falls with gravity, squashes,
 * and resumes wandering.
 * @module components/pet/screen-cat
 */

/** Cat sprite footprint in CSS pixels. */
const CAT_W = 64;
const CAT_H = 76;

/** Wander speed (px/s), gravity (px/s²), and fall-in speed (px/s). */
const WANDER_SPEED = 90;
const GRAVITY = 2200;
const ENTER_FALL_SPEED = 420;

/** Size of the hop arc (px) while moving. */
const HOP = 7;

/** Duration of the respawn pop animation (ms). */
const SPAWN_MS = 280;

/**
 * Internal pet simulation state.
 *
 * @typedef {object} PetState
 * @property {{ x: number, y: number }} pos Current top-left position (px).
 * @property {"drop"|"locating"|"idle"|"wander"|"drag"|"rest"|"fall"} mode Current behavior.
 * @property {number} phase Accumulator driving hop bobbing (radians).
 * @property {number} idleUntil Timestamp (ms) when idling may end.
 * @property {number} spawnUntil Timestamp (ms) while the respawn pop plays.
 * @property {number} vy Vertical speed while falling (px/s).
 * @property {boolean} facingRight Whether the sprite faces right.
 * @property {number} squashUntil Timestamp (ms) until landing squash is applied.
 * @property {{ x: number, y: number }|null} grab Offset between pointer and sprite top-left while dragged.
 */

/**
 * Describe where the pet currently is on the screen ("top-left", "center"…).
 *
 * @param {{ x: number, y: number }} pos Sprite top-left position (px).
 * @returns {string} Human-readable screen region.
 */
function regionOf(pos) {
  if (typeof window === "undefined") {
    return "center";
  }
  const cx = pos.x + CAT_W / 2;
  const cy = pos.y + CAT_H / 2;
  const vertical = cy < window.innerHeight / 3 ? "top" : cy > (window.innerHeight * 2) / 3 ? "bottom" : "";
  const horizontal = cx < window.innerWidth / 3 ? "left" : cx > (window.innerWidth * 2) / 3 ? "right" : "";
  const combined = `${vertical}${vertical && horizontal ? "-" : ""}${horizontal}`;
  return combined || "center";
}

/**
 * The roaming, draggable 2D chibi cat overlaying the whole screen.
 *
 * @param {{ accentColor?: string }} [props] Optional accent override (defaults: secondary red).
 * @returns {JSX.Element} A pass-through full-screen layer hosting the draggable cat.
 */
export default function ScreenCat({ accentColor = COLORS.secondary }) {
  /** @type {import("react").MutableRefObject<any>} */
  const frame = useRef(null);
  const xAnim = useRef(new Animated.Value(0)).current;
  const yAnim = useRef(new Animated.Value(0)).current;
  const squashAnim = useRef(new Animated.Value(1)).current;
  const spawnAnim = useRef(new Animated.Value(1)).current;
  const facingAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const tailAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  const [bubble, setBubble] = useState("");
  const bubbleTimer = useRef(0);

  /** @type {import("react").MutableRefObject<PetState>} */
  const pet = useRef(/** @type {PetState} */ ({
    pos: { x: 0, y: 0 },
    mode: "idle",
    phase: 0,
    idleUntil: 0,
    spawnUntil: 0,
    vy: 0,
    facingRight: true,
    squashUntil: 0,
    grab: null
  }));

  // Tail sway: gentle endless swing.
  useEffect(() => {
    const swing = Animated.loop(
      Animated.sequence([
        Animated.timing(tailAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(tailAnim, { toValue: 0, duration: 900, useNativeDriver: true })
      ])
    );
    swing.start();
    return () => swing.stop();
  }, [tailAnim]);

  // Blink: quick eye close every few seconds.
  useEffect(() => {
    let timer;
    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.12, duration: 90, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 110, useNativeDriver: true })
      ]).start();
      timer = setTimeout(blink, 2400 + Math.random() * 2600);
    };
    timer = setTimeout(blink, 1600);
    return () => clearTimeout(timer);
  }, [blinkAnim]);

  // Simulation loop: clicks respawn the cat, drags relocate it.
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const s = pet.current;
    const node = frame.current?.getNode?.() ?? frame.current;
    const groundY = () => window.innerHeight - CAT_H * 0.88;
    const clampX = (x) => Math.max(-CAT_W / 2, Math.min(window.innerWidth - CAT_W / 2, x));

    /** Announce the current screen region in the speech bubble. */
    const announce = () => {
      setBubble(regionOf(s.pos));
      Animated.sequence([
        Animated.timing(bubbleAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(bubbleAnim, { toValue: 0, duration: 300, useNativeDriver: true, delay: 1500 })
      ]).start();
      clearTimeout(bubbleTimer.current);
    };

    // Home position before any interaction.
    s.pos = { x: clampX(window.innerWidth * 0.62), y: groundY() };

    /** Handle published targets: clicks respawn the pet at that point. */
    const respawnFromStore = () => {
      const target = useCatStore.getState().target;
      if (!target || s.mode === "drag") {
        return;
      }
      if (target.teleport) {
        // Dimension arrival: drop in from above, Shimeji-style.
        s.pos = { x: clampX(target.x * window.innerWidth - CAT_W / 2), y: -CAT_H };
        s.mode = "drop";
        s.vy = ENTER_FALL_SPEED;
        s.facingRight = target.x >= 0.5;
      } else {
        // Respawn: pop in at the exact clicked point, rest, then find the ground.
        s.pos = {
          x: clampX(target.x * window.innerWidth - CAT_W / 2),
          y: Math.min(Math.max(target.y * window.innerHeight - CAT_H / 2, -CAT_H), groundY())
        };
        s.mode = "locating";
        s.spawnUntil = performance.now() + SPAWN_MS;
        s.vy = 0;
      }
    };
    respawnFromStore();
    const unsubscribe = useCatStore.subscribe((next, prev) => {
      if (next.target !== prev.target) {
        respawnFromStore();
      }
    });

    const onResize = () => {
      s.pos.y = Math.min(s.pos.y, groundY());
      s.pos.x = clampX(s.pos.x);
    };
    window.addEventListener("resize", onResize);

    // Drag: grab the cat anywhere, move it freely, release to let it fall.
    /** @param {PointerEvent} event */
    const onGrab = (event) => {
      event.stopPropagation();
      node?.setPointerCapture?.(event.pointerId);
      s.grab = { x: event.clientX - s.pos.x, y: event.clientY - s.pos.y };
      s.mode = "drag";
      s.vy = 0;
    };
    /** @type {Record<string, (event: PointerEvent) => void>} */
    const dragListeners = {
      pointermove: (event) => {
        if (s.mode !== "drag" || !s.grab) {
          return;
        }
        const nextX = event.clientX - s.grab.x;
        s.facingRight = nextX >= s.pos.x;
        s.pos.x = clampX(nextX);
        s.pos.y = Math.max(-CAT_H, Math.min(event.clientY - s.grab.y, window.innerHeight - CAT_H * 0.5));
      },
      pointerup: () => {
        if (s.mode !== "drag") {
          return;
        }
        s.grab = null;
        // Dropped: fall from the release point, then announce its location.
        s.mode = "fall";
        s.vy = 0;
        try {
          node?.releasePointerCapture?.(0);
        } catch {
          // Pointer capture already released — nothing to do.
        }
      },
      pointercancel: () => {
        if (s.mode === "drag") {
          s.grab = null;
          s.mode = "fall";
          s.vy = 0;
        }
      }
    };

    if (node && typeof node.addEventListener === "function") {
      node.addEventListener("pointerdown", onGrab);
      for (const [name, listener] of Object.entries(dragListeners)) {
        node.addEventListener(name, listener);
      }
    }

    let raf = 0;
    let prevNow = performance.now();
    const step = (now) => {
      const dt = Math.min((now - prevNow) / 1000, 0.05);
      prevNow = now;
      const g = groundY();

      if (s.mode === "drop") {
        s.vy += GRAVITY * dt * 0.5;
        s.pos.y += s.vy * dt;
        if (s.pos.y >= g) {
          s.pos.y = g;
          s.mode = "idle";
          s.vy = 0;
          s.idleUntil = now + 1400;
          s.squashUntil = now + 160;
          announce();
        }
      } else if (s.mode === "locating") {
        if (now >= s.spawnUntil) {
          s.mode = "rest";
          s.idleUntil = now + 1300;
        }
      } else if (s.mode === "idle") {
        if (now > s.idleUntil) {
          // Wander on its own: a random stroll along the bottom edge.
          s.mode = "wander";
          s.phase = 0;
          s.pos = { ...s.pos, y: g };
        }
      } else if (s.mode === "wander") {
        const targetX = Math.sin((s.phase / 520) * Math.PI) * (window.innerWidth - CAT_W) + (window.innerWidth - CAT_W) / 2;
        const dx = targetX - s.pos.x;
        if (Math.abs(dx) > 4) {
          const stepLen = Math.min(WANDER_SPEED * dt, Math.abs(dx));
          s.pos.x = clampX(s.pos.x + Math.sign(dx) * stepLen);
          s.facingRight = dx >= 0;
          s.phase += dt * 3.4;
        } else {
          s.mode = "idle";
          s.idleUntil = now + 1200 + Math.random() * 2400;
        }
      } else if (s.mode === "rest") {
        if (now > s.idleUntil) {
          // Respawned somewhere off the ground (or clicked up high): fall home.
          s.mode = "fall";
          s.vy = 0;
        }
      } else if (s.mode === "fall") {
        s.vy += GRAVITY * dt;
        s.pos.y += s.vy * dt;
        if (s.pos.y >= g) {
          s.pos.y = g;
          s.mode = "idle";
          s.vy = 0;
          s.idleUntil = now + 1400;
          s.squashUntil = now + 160;
          announce();
        }
      }
      // mode "drag": position is driven directly by the pointer handlers.

      if (node) {
        const hopping = s.mode === "wander";
        const bob = hopping ? -Math.abs(Math.sin(s.phase * Math.PI)) * HOP : Math.sin(now / 420) * 1.6;
        const spawning = now < s.spawnUntil;
        const popK = spawning ? (s.spawnUntil - now) / SPAWN_MS : 0;
        xAnim.setValue(s.pos.x);
        yAnim.setValue(s.pos.y + bob);
        squashAnim.setValue(now < s.squashUntil ? 0.82 : 1);
        spawnAnim.setValue(spawning ? 1 - popK * popK * 0.8 : 1);
        facingAnim.setValue(s.facingRight ? 1 : -1);
      }
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(bubbleTimer.current);
      if (node && typeof node.removeEventListener === "function") {
        node.removeEventListener("pointerdown", onGrab);
        for (const [name, listener] of Object.entries(dragListeners)) {
          node.removeEventListener(name, listener);
        }
      }
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tailDeg = tailAnim.interpolate({ inputRange: [0, 1], outputRange: [-14, 16] });

  return (
    <View pointerEvents="box-none" className="absolute inset-0 z-50">
      {/* Sprite: the only interactive element (grab to drag; clicks elsewhere respawn it) */}
      <Animated.View
        ref={frame}
        className="cursor-grab active:cursor-grabbing"
        style={{ position: "absolute", left: xAnim, top: yAnim, width: CAT_W, height: CAT_H }}
      >
        {/* Speech bubble: announces the pet's screen region */}
        <View style={{ position: "absolute", top: -34, left: -CAT_W, right: -CAT_W, alignItems: "center" }}>
          <Animated.View
            className="rounded-full border border-[#161823]/10 bg-white px-2.5 py-1"
            style={{ opacity: bubbleAnim, transform: [{ scale: bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}
          >
            <Text className="font-outfit text-[10px] leading-tight text-[#161823]">{bubble}</Text>
          </Animated.View>
        </View>

        {/* Squash & stretch + respawn pop + facing flip */}
        <Animated.View
          style={{
            width: CAT_W,
            height: CAT_H,
            transform: [{ scaleX: facingAnim }, { scaleY: squashAnim }, { scale: spawnAnim }]
          }}
        >
          {/* Tail */}
          <Animated.View
            className="absolute right-1 top-[30px] h-2 w-8 rounded-full"
            style={{ backgroundColor: COLORS.surface, transform: [{ rotate: tailDeg }] }}
          />
          {/* Body */}
          <View className="absolute left-2 top-[38px] h-8 w-11 rounded-full" style={{ backgroundColor: COLORS.surface }} />
          {/* Feet */}
          <View className="absolute left-4 top-[62px] h-2.5 w-4 rounded-full" style={{ backgroundColor: COLORS.surface }} />
          <View className="absolute left-8 top-[62px] h-2.5 w-4 rounded-full" style={{ backgroundColor: COLORS.surface }} />
          {/* Head */}
          <View className="absolute left-1.5 top-0 h-[52px] w-[52px] rounded-full border border-[#E4E6EE]" style={{ backgroundColor: COLORS.surface }}>
            {/* Ears with accent tips */}
            <View className="absolute -top-2 left-[4px] h-4 w-3 rotate-[18deg] rounded-t-full" style={{ backgroundColor: COLORS.surface }} />
            <View className="absolute -top-2 right-[4px] h-4 w-3 -rotate-[18deg] rounded-t-full" style={{ backgroundColor: COLORS.surface }} />
            <View className="absolute -top-1 left-[6px] h-2 w-1.5 rotate-[18deg] rounded-t-full" style={{ backgroundColor: accentColor }} />
            <View className="absolute -top-1 right-[6px] h-2 w-1.5 -rotate-[18deg] rounded-t-full" style={{ backgroundColor: accentColor }} />
            {/* Eyes (blink squashes vertically) */}
            <Animated.View style={{ transform: [{ scaleY: blinkAnim }] }} className="absolute left-[18px] top-[16px] flex-row gap-[10px]">
              <View className="h-3 w-1.5 rounded-full bg-[#161823]" />
              <View className="h-3 w-1.5 rounded-full bg-[#161823]" />
            </Animated.View>
            {/* Nose */}
            <View className="absolute left-1/2 top-[30px] h-1.5 w-2 -translate-x-1/2 rounded-full" style={{ backgroundColor: accentColor }} />
          </View>
          {/* Collar */}
          <View className="absolute left-[10px] top-[42px] h-1.5 w-10 rounded-full" style={{ backgroundColor: COLORS.primary }} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
