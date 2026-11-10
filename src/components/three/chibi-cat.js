import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useCatStore } from "../../shared/cat-store.js";
import { COLORS } from "../../shared/tokens.js";

/**
 * Procedural chibi cat for the WebGL dimension scenes.
 *
 * A big-headed, small-bodied cat built from primitives (no model files). It
 * hops toward the viewport targets published to {@link module:shared/cat-store}
 * (screen clicks forwarded by `domain-shell`), idles with a bob / tail sway /
 * blink, and pops in with a fleck burst on a `teleport` target.
 * @module components/three/chibi-cat
 */

/** Ground-plane extent the normalized viewport maps onto. */
const WALK = { xMin: -4.2, xMax: 4.2, zMin: -0.6, zMax: 2.1 };

/**
 * Idle blink timer state, kept in a ref for `useFrame` access.
 *
 * @typedef {object} CatState
 * @property {import("three").Vector3} pos Current world position.
 * @property {import("three").Vector3|null} goal Hop target in world space.
 * @property {number} hopPhase Progress accumulator driving the hop bounce.
 * @property {number} facing Current yaw (radians) toward motion direction.
 * @property {number} blinkAt Seconds until the next blink.
 * @property {boolean} blinking Whether an eye-close is in progress.
 * @property {number} popEnd Timestamp (ms) when a teleport pop finishes.
 */

/**
 * The chibi cat that follows clicks across every dimension.
 *
 * @param {{ bodyColor?: string, accentColor?: string }} [props] Optional palette overrides (defaults: surface body, secondary accents).
 * @returns {JSX.Element} The cat group (mounted inside a `<Canvas>`).
 */
export default function ChibiCat({ bodyColor = COLORS.surface, accentColor = COLORS.secondary }) {
  const group = /** @type {import("react").MutableRefObject<any>} */ (useRef(null));
  const headRef = /** @type {import("react").MutableRefObject<any>} */ (useRef(null));
  const tailRef = /** @type {import("react").MutableRefObject<any>} */ (useRef(null));
  const eyesRef = /** @type {import("react").MutableRefObject<any>} */ (useRef(null));
  const flecksRef = /** @type {import("react").MutableRefObject<any>} */ (useRef(null));

  /** @type {import("react").MutableRefObject<CatState>} */
  const state = useRef(/** @type {CatState} */ ({
    pos: { x: 0, y: 0, z: 0.9 },
    goal: null,
    hopPhase: 0,
    facing: 0,
    blinkAt: 2,
    blinking: false,
    popEnd: 0
  }));

  // Subscribe to the store; sync instantly with any pre-published target.
  useEffect(() => {
    const syncTarget = (target) => {
      if (!target) {
        return;
      }
      const s = state.current;
      const nx = Math.min(Math.max(target.x, 0), 1);
      const ny = Math.min(Math.max(target.y, 0), 1);
      s.goal = {
        x: WALK.xMin + nx * (WALK.xMax - WALK.xMin),
        z: WALK.zMin + ny * (WALK.zMax - WALK.zMin)
      };
      if (target.teleport) {
        s.popEnd = performance.now() + 900;
      }
    };
    syncTarget(useCatStore.getState().target);
    return useCatStore.subscribe((next, prev) => {
      if (next.target !== prev.target) {
        syncTarget(next.target);
      }
    });
  }, []);

  const bodyMaterial = useMemo(() => ({ color: bodyColor }), [bodyColor]);
  const accentMaterial = useMemo(() => ({ color: accentColor }), [accentColor]);

  useFrame((frameProps, delta) => {
    const s = state.current;
    const g = group.current;
    if (!g) {
      return;
    }
    const t = frameProps.clock.elapsedTime;

    // Hop-walk: advance toward the goal on the ground with a sine bounce.
    if (s.goal) {
      const dx = s.goal.x - s.pos.x;
      const dz = s.goal.z - s.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.05) {
        const speed = 2.6;
        const step = Math.min(speed * delta, dist);
        s.pos.x += (dx / dist) * step;
        s.pos.z += (dz / dist) * step;
        s.hopPhase += delta * 11;
        s.facing = Math.atan2(dx, dz);
      } else {
        s.goal = null;
        s.hopPhase = 0;
      }
    }
    const hopping = s.hopPhase > 0.04;
    const bounce = hopping ? Math.abs(Math.sin(s.hopPhase)) * 0.5 : Math.sin(t * 2.4) * 0.06;

    g.position.set(s.pos.x, bounce, s.pos.z);
    g.rotation.y += (s.facing - g.rotation.y) * Math.min(1, delta * 8);

    // Squash & stretch while hopping; teleport pop adds a brief overshoot pop.
    const popNow = performance.now();
    const popK = popNow < s.popEnd ? Math.min(1, (s.popEnd - popNow) / 450) : 0;
    const squash = (hopping ? 1 + Math.sin(s.hopPhase) * 0.12 : 1) * (0.72 + popK * 0.34);
    g.scale.set(2 - squash, squash, 2 - squash);

    // Idle head bob.
    if (headRef.current) {
      headRef.current.position.y = 0.02 + Math.sin(t * 2.4) * 0.02;
    }
    // Tail sway.
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 2.6) * 0.35 - 0.15;
      tailRef.current.rotation.y = Math.sin(t * 1.7) * 0.25;
    }
    // Blink cycle: brief vertical eye squash every few seconds.
    if (eyesRef.current) {
      if (!s.blinking && t > s.blinkAt) {
        s.blinking = true;
        s.blinkAt = t + 2.4 + Math.random() * 2.6;
      }
      if (s.blinking) {
        const blinkT = (t - (s.blinkAt - 0.18)) / 0.18;
        const scaleY = blinkT < 1 ? Math.max(0.08, 1 - Math.sin(blinkT * Math.PI) * 0.92) : 1;
        if (blinkT >= 1) {
          s.blinking = false;
        }
        eyesRef.current.scale.y = scaleY;
      }
    }
    // Teleport pop: quick overshoot scale while flecks fly outward.
    if (flecksRef.current) {
      const popActive = performance.now() < s.popEnd;
      const k = popActive ? Math.min(1, (s.popEnd - performance.now()) / 900) : 0;
      flecksRef.current.visible = popActive;
      flecksRef.current.scale.setScalar(1 + (1 - k) * 3.2);
      flecksRef.current.children.forEach((fleck, i) => {
        // @ts-ignore three Object3D
        fleck.material.opacity = k;
        // @ts-ignore three Object3D
        fleck.material.color = k > 0.5 ? accentColor : COLORS.primary;
        fleck.position.y = (i % 3) * 0.12 + (1 - k) * 0.9;
      });
    }
  });

  return (
    <group ref={group} position={[0, 0, 0.9]}>
      {/* Body: small round torsoshape */}
      <mesh position={[0, 0.32, 0]} scale={[0.42, 0.36, 0.4]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>
      {/* Belly patch */}
      <mesh position={[0, 0.28, 0.3]} scale={[0.26, 0.24, 0.14]}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* Head: oversized chibi sphere */}
      <group ref={headRef}>
        <mesh position={[0, 0.95, 0]} scale={[0.48, 0.44, 0.45]}>
          <sphereGeometry args={[1, 28, 28]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        {/* Ears: cones with accent tips */}
        {[-0.28, 0.28].map((earX) => (
          <group key={`ear-${earX}`} position={[earX, 1.32, 0]} rotation={[0, 0, -earX * 1.4]}>
            <mesh rotation={[0, 0, 0]}>
              <coneGeometry args={[0.16, 0.3, 10]} />
              <meshStandardMaterial {...bodyMaterial} />
            </mesh>
          </group>
        ))}
        {/* Face: eyes + snout */}
        <group ref={eyesRef}>
          {[-0.17, 0.17].map((eyeX) => (
            <mesh key={`eye-${eyeX}`} position={[eyeX, 1.0, 0.4]} scale={[0.05, 0.075, 0.04]}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial color={COLORS.ink} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 0.88, 0.44]} scale={[0.07, 0.05, 0.04]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>

      {/* Collar */}
      <mesh position={[0, 0.62, 0.12]} rotation={[Math.PI / 2, 0, 0]} scale={[0.4, 0.4, 0.06]}>
        <torusGeometry args={[0.45, 0.07, 8, 20]} />
        <meshStandardMaterial color={COLORS.primary} />
      </mesh>

      {/* Tail: arced mini-cone wagging via ref */}
      <group ref={tailRef} position={[0, 0.3, -0.32]}>
        <mesh position={[0, 0.18, -0.1]} rotation={[0.9, 0, -0.4]}>
          <coneGeometry args={[0.07, 0.55, 8]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
      </group>

      {/* Feet */}
      {[-0.2, 0.2].map((footX) => (
        <mesh key={`foot-${footX}`} position={[footX, 0.06, 0.1]} scale={[0.1, 0.07, 0.12]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
      ))}

      {/* Teleport flecks */}
      <group ref={flecksRef} visible={false}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={`fleck-${i}`}
            position={[Math.cos((i / 6) * Math.PI * 2) * 0.5, 0.3, Math.sin((i / 6) * Math.PI * 2) * 0.5]}
          >
            <octahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial transparent opacity={0} color={accentColor} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
