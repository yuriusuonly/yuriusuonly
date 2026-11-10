import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber";
import ChibiCat from "./chibi-cat.js";

/**
 * Themed WebGL backdrop shared by every screen: a calm void filled with slowly
 * floating brand-colored shapes under fog, plus the chibi cat hopping on the
 * ground plane. Canvas mounts client-side only, so static prerendering
 * (`expo export`) is unaffected.
 * @module components/three/dimension-scene
 */

/**
 * Props for {@link DimensionScene}.
 *
 * @typedef {object} DimensionSceneProps
 * @property {import("../../shared/tokens.js").DimensionTheme} theme Theme tokens (void color, shape palette, lights) for this dimension.
 * @property {boolean} [floatShapes] Whether floating geometry is shown (default true; off for the lighter 404 treatment).
 * @property {number} [shapeDensity] How many floating shapes to render (default 10).
 */

/**
 * One floating, slowly tumbling shape.
 *
 * @param {{ position: [number, number, number], color: string, kind: number }} props Deterministic position/palette derived in the parent.
 * @returns {JSX.Element} An animated mesh.
 */
function FloatShape({ position, color, kind }) {
  const mesh = /** @type {import("react").MutableRefObject<any>} */ (useRef(null));
  const seed = (position[0] + position[1] + position[2]) * 7;
  useFrame(({ clock }, delta) => {
    if (!mesh.current) {
      return;
    }
    const t = clock.elapsedTime;
    mesh.current.rotation.x += delta * (0.15 + (seed % 0.2));
    mesh.current.rotation.y += delta * 0.1;
    mesh.current.position.y = position[1] + Math.sin(t * 0.7 + seed) * 0.25;
  });
  const geometry =
    kind % 3 === 0 ? <icosahedronGeometry args={[0.5, 0]} /> : kind % 3 === 1 ? <torusGeometry args={[0.4, 0.14, 8, 22]} /> : <boxGeometry args={[0.6, 0.6, 0.6]} />;
  return (
    <mesh ref={mesh} position={position}>
      {geometry}
      <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} transparent opacity={0.85} />
    </mesh>
  );
}

/**
 * Ground disc the cat walks on, tinted slightly darker than the void.
 *
 * @param {{ color: string }} props Disc color.
 * @returns {JSX.Element} A large flat circle mesh.
 */
function Ground({ color }) {
  return (
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[9, 48]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
    </mesh>
  );
}

/**
 * Parallax rig: nudges the whole stage with pointer movement.
 *
 * @param {{ children: import("react").ReactNode }} props Scene children to translate.
 * @returns {JSX.Element} The parallax group.
 */
function Parallax({ children }) {
  const group = /** @type {import("react").MutableRefObject<any>} */ (useRef(null));
  useFrame(({ pointer, camera }) => {
    if (!group.current) {
      return;
    }
    group.current.position.x += (pointer.x * 0.35 - group.current.position.x) * 0.04;
    group.current.position.y += (pointer.y * 0.2 - group.current.position.y) * 0.04;
    camera.lookAt(0, 0.6, 0);
  });
  return <group ref={group}>{children}</group>;
}

/**
 * Themed dimension scene (chibi cat + floating shapes + fog + lights).
 *
 * @param {DimensionSceneProps} props - Component props.
 * @returns {JSX.Element} An absolutely positioned full-size canvas layer.
 */
export default function DimensionScene({ theme, shapeDensity = 10, floatShapes = true }) {
  // Client-only mount so `expo export` prerendering never touches WebGL.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const shapes = useMemo(() => {
    if (!floatShapes) {
      return [];
    }
    /** @type {Array<{ position: [number, number, number], color: string, kind: number }>} */
    const list = [];
    for (let i = 0; i < shapeDensity; i += 1) {
      const slot = i / shapeDensity;
      // Deterministic pseudo-random placement (no Math.random: stable across renders).
      const px = Math.sin(i * 12.9898) * 2.6;
      const pz = -3.5 + (Math.cos(i * 4.1414) * 0.5 + 0.5) * 4.2;
      list.push({
        position: [px, 1.2 + slot * 2.6, pz < 0 ? pz : -pz],
        color: theme.shapes[i % theme.shapes.length],
        kind: i
      });
    }
    return list;
  }, [theme, floatShapes, shapeDensity]);

  if (!mounted) {
    return null;
  }

  return (
    <View pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
      <Canvas
        camera={{ position: [0, 2.4, 7.2], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.75]}
      >
        <color attach="background" args={[theme.void]} />
        <fog attach="fog" args={[theme.void, 8, 24]} />
        <Parallax>
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 4]} intensity={1.1} color={theme.lightColor} />
          <directionalLight position={[-5, 3, -6]} intensity={0.8} color={theme.rimColor} />
          <Ground color={theme.ground} />
          {shapes.map((shape, i) => (
            <FloatShape key={`shape-${i}`} position={shape.position} color={shape.color} kind={shape.kind} />
          ))}
          <ChibiCat />
        </Parallax>
      </Canvas>
    </View>
  );
}
