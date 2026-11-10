import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { useCatStore } from "../../shared/cat-store.js";
import { COLORS } from "../../shared/tokens.js";

/**
 * Shimeji-style screen pet: a 2D chibi cat roaming the page.
 *
 * Built entirely from React Native Web views (no WebGL, no sprites). Moves
 * independently — it drops in from above when a dimension opens, wanders
 * along the bottom edge on its own, blinks and sways its tail — chases clicks
 * published to {@link module:shared/cat-store}, and can be grabbed and
 * dragged to any location: release it anywhere and it falls with gravity,
 * squashes on landing, and resumes its own wandering afterward.
 * @module components/pet/screen-cat
 */

/** Cat sprite footprint in CSS pixels. */
const CAT_W = 64;
const CAT_H = 76;

/** Walk speed (px/s), chase speed, gravity (px/s²), fall-in speed (px/s). */
const WALK_SPEED = 90;
const CHASE_SPEED = 260;
const GRAVITY = 2200;
const ENTER_FALL_SPEED = 420;

/** Size of the hop arc (px) while moving. */
const HOP = 7;

/**
 * Internal pet simulation state.
 *
 * @typedef {object} PetState
 * @property {{ x: number, y: number }} pos Current top-left position (px).
 * @property {{ x: number, y: number }|null} goal Pixel point to walk toward.
 * @property {"enter"|"idle"|"walk"|"chase"|"drag"|"rest"|"fall"} mode Current behavior.
 * @property {number} phase Accumulator driving hop bobbing (radians).
 * @property {number} idleUntil Timestamp (ms) when idling may end.
 * @property {number} restUntil Timestamp (ms) when resting ends (then falls).
 * @property {number} vy Vertical speed while falling (px/s).
 * @property {boolean} facingRight Whether the sprite faces right.
 * @property {number} squashUntil Timestamp (ms) until landing squash is applied.
 * @property {{ x: number, y: number }|null} grab Offset between pointer and sprite top-left while dragged.
 */

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
  const facingAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const tailAnim = useRef(new Animated.Value(0)).current;

  /** @type {import("react").MutableRefObject<PetState>} */
  const pet = useRef(/** @type {PetState} */ ({
    pos: { x: 0, y: 0 },
    goal: null,
    mode: "idle",
    phase: 0,
    idleUntil: 0,
    restUntil: 0,
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

  // Simulation loop, click targets, and drag handling.
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const s = pet.current;
    const node = frame.current?.getNode?.() ?? frame.current;
    const groundY = () => window.innerHeight - CAT_H * 0.88;
    const clampX = (x) => Math.max(-CAT_W / 2, Math.min(window.innerWidth - CAT_W / 2, x));

    // Home position before any interaction.
    s.pos = { x: clampX(window.innerWidth * 0.62), y: groundY() };

    const chaseTargetFromStore = () => {
      const target = useCatStore.getState().target;
      if (!target || s.mode === "drag") {
        return;
      }
      if (target.teleport) {
        // Dimension arrival: drop in from above, Shimeji-style.
        s.pos = { x: clampX(target.x * window.innerWidth - CAT_W / 2), y: -CAT_H };
        s.mode = "enter";
        s.vy = ENTER_FALL_SPEED;
        s.goal = null;
        s.facingRight = target.x >= 0.5;
      } else {
        s.goal = {
          x: clampX(target.x * window.innerWidth),
          y: Math.min(Math.max(target.y * window.innerHeight, 0), window.innerHeight - CAT_H * 0.5)
        };
        s.mode = "chase";
        s.restUntil = 0;
      }
    };
    chaseTargetFromStore();
    const unsubscribe = useCatStore.subscribe((next, prev) => {
      if (next.target !== prev.target) {
        chaseTargetFromStore();
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
      s.goal = null;
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
        // Dropped: fall from the release point, no target.
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

      if (s.mode === "enter") {
        s.vy += GRAVITY * dt * 0.5;
        s.pos.y += s.vy * dt;
        if (s.pos.y >= g) {
          s.pos.y = g;
          s.mode = "idle";
          s.idleUntil = now + 1400;
          s.squashUntil = now + 160;
        }
      } else if (s.mode === "idle") {
        if (s.goal) {
          s.mode = "chase";
        } else if (now > s.idleUntil) {
          // Wander on its own: a random stroll along the bottom edge.
          s.goal = { x: Math.random() * (window.innerWidth - CAT_W), y: g };
          s.mode = "walk";
        }
      } else if (s.mode === "walk" || s.mode === "chase") {
        const tx = s.goal?.x - (s.mode === "chase" ? CAT_W / 2 : 0);
        const ty = s.goal?.y ?? g;
        const dx = tx - s.pos.x;
        const dy = ty - s.pos.y;
        const dist = Math.hypot(dx, dy);
        const speed = s.mode === "chase" ? CHASE_SPEED : WALK_SPEED;
        if (dist > 6) {
          const stepLen = Math.min(speed * dt, dist);
          s.pos.x = clampX(s.pos.x + (dx / dist) * stepLen);
          s.facingRight = dx >= 0;
          // Hop toward the point: bounce along, drifting vertically with it.
          s.phase += dt * (s.mode === "chase" ? 16 : 9);
          s.pos.y += (dy / dist) * stepLen * 0.6;
        } else {
          s.goal = null;
          if (s.mode === "chase") {
            // Arrived at the click: rest there briefly, then fall home.
            s.mode = "rest";
            s.restUntil = now + 2300;
          } else {
            s.mode = "idle";
            s.idleUntil = now + 1200 + Math.random() * 2400;
          }
        }
      } else if (s.mode === "rest") {
        if (now > s.restUntil) {
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
        }
      }
      // mode "drag": position is driven directly by the pointer handlers.

      if (node) {
        const hopping = s.mode === "walk" || s.mode === "chase";
        const bob = hopping ? -Math.abs(Math.sin(s.phase)) * HOP : Math.sin(now / 420) * 1.6;
        xAnim.setValue(s.pos.x);
        yAnim.setValue(s.pos.y + bob);
        squashAnim.setValue(now < s.squashUntil ? 0.82 : 1);
        facingAnim.setValue(s.facingRight ? 1 : -1);
      }
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (node && typeof node.removeEventListener === "function") {
        node.removeEventListener("pointerdown", onGrab);
        for (const [name, listener] of Object.entries(dragListeners)) {
          node.removeEventListener(name, listener);
        }
      }
      unsubscribe();
    };
  }, []);

  const tailDeg = tailAnim.interpolate({ inputRange: [0, 1], outputRange: [-14, 16] });

  return (
    <View pointerEvents="box-none" className="absolute inset-0 z-50">
      {/* Sprite: the only interactive element (grab to drag; clicks elsewhere pass through) */}
      <Animated.View
        ref={frame}
        className="cursor-grab active:cursor-grabbing"
        style={{ position: "absolute", left: xAnim, top: yAnim, width: CAT_W, height: CAT_H }}
      >
        {/* Squash & stretch + facing flip */}
        <Animated.View
          style={{
            width: CAT_W,
            height: CAT_H,
            transform: [{ scaleX: facingAnim }, { scaleY: squashAnim }]
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
