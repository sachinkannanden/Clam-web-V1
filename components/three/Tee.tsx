"use client";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { knitNormalMap } from "./teeGeometry";

/**
 * Two known, harmless console messages, filtered at their source (three's own console hook) so
 * real warnings and every error still come through:
 * - "THREE.Clock … deprecated": created inside @react-three/fiber 9 (its `state.clock`), not by
 *   this code. three is pinned to 0.186.x by `^0.186.1`, so it cannot disappear under us; remove
 *   this filter when fiber moves to THREE.Timer.
 * - Windows/ANGLE "warning X4122 … double precision": the D3D shader compiler's note on three's
 *   built-in shaders. Only an info log made of nothing but these lines is dropped.
 */
if (typeof window !== "undefined") {
  THREE.setConsoleFunction((type: string, message: string, ...params: unknown[]) => {
    if (type === "warn" && typeof message === "string") {
      if (message.includes("Clock: This module has been deprecated")) return;
      if (message.includes("Program Info Log")) {
        const log = String(params[0] ?? "").trim();
        if (log && log.split("\n").every((l) => !l.trim() || /warning X4122/.test(l))) return;
      }
    }
    const fn = (console as unknown as Record<string, (...a: unknown[]) => void>)[type] ?? console.log;
    fn(message, ...params);
  });
}

/** The tee is modelled and cloth-simulated in Blender (blender/clam-tee.blend) and exported as GLB. */
export const TEE_MODEL = "/models/clam-tee.glb";

export type TeeHandle = { poke: () => void; turn: (dir: number) => void };

type Props = {
  colour: string;
  interactive?: boolean;
  onStretch?: () => void;
  onPull?: (amount: number) => void;
  /** external commands: keyboard poke / turn */
  command?: { kind: "poke" | "turn"; dir?: number; n: number } | null;
  still?: boolean; // render a still pose (for product renders)
  /** called once if the device can't keep a smooth frame rate; the parent swaps in a still */
  onSlow?: () => void;
  shadow?: boolean;
  className?: string;
  /** camera distance; larger = smaller tee in the frame */
  distance?: number;
};

const shaderPatch = (shader: THREE.WebGLProgramParametersWithUniforms, u: Record<string, THREE.IUniform>) => {
  Object.assign(shader.uniforms, u);
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
      uniform float uTime; uniform vec3 uGrab; uniform vec3 uPull; uniform float uRadius; uniform float uBreath;`
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      // how far a point sits from the side seams (0 at the seam, 1 on the chest)
      float aEdge = smoothstep(0.0, 0.14, abs(position.z));
      // breathing: a slow inhale and exhale of the cloth
      float br = sin(uTime * 0.85) * uBreath;
      transformed.z *= 1.0 + 0.07 * br;
      transformed.xy *= 1.0 + 0.006 * br;
      // drape sway: the hem moves more than the shoulders
      float sway = (1.4 - position.y) * 0.5;
      transformed.x += sin(uTime * 0.6 + position.y * 1.8) * 0.012 * sway * uBreath;
      transformed.z += sin(uTime * 0.9 + position.x * 2.4 + position.y * 1.3) * 0.012 * sway * aEdge * uBreath;
      // stretch: pull the fabric around the grab point, with a few soft ripples
      vec2 dd = position.xy - uGrab.xy;
      float dist = length(dd);
      float w = exp(-(dist * dist) / (uRadius * uRadius));
      float pl = length(uPull);
      transformed += uPull * w;
      transformed.z += sin(dist * 34.0 - uTime * 2.0) * 0.012 * pl * w * aEdge;
      `
    );
  // the inside of the tee (seen through the neck, cuffs and hem) sits in soft shadow
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <color_fragment>",
    `#include <color_fragment>
    if (!gl_FrontFacing) diffuseColor.rgb *= 0.55;`
  );
};

function TeeMesh({ colour, interactive, onStretch, onPull, command, still, onSlow }: Props) {
  const perf = useRef({ frames: 0, start: 0, last: 0, done: false });
  // reduced motion: the tee holds still unless the visitor moves it
  const calm = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(TEE_MODEL);
  const geo = useMemo(() => {
    let g: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!g && m.isMesh) g = m.geometry as THREE.BufferGeometry;
    });
    return g as unknown as THREE.BufferGeometry;
  }, [gltf]);
  const normal = useMemo(() => knitNormalMap(), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGrab: { value: new THREE.Vector3(0, 0, 0) },
      uPull: { value: new THREE.Vector3(0, 0, 0) },
      uRadius: { value: 0.62 },
      uBreath: { value: still || calm ? 0 : 1 },
    }),
    [still, calm]
  );

  const target = useMemo(() => new THREE.Color(colour), [colour]);
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colour),
      roughness: 0.92,
      metalness: 0,
      sheen: 1,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color("#ffffff"),
      normalMap: normal,
      normalScale: new THREE.Vector2(0.16, 0.16),
      side: THREE.DoubleSide,
    });
    m.onBeforeCompile = (s) => shaderPatch(s, uniforms);
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normal, uniforms]);
  // spring state
  const drag = useRef<{ active: boolean; start: THREE.Vector3; pid: number; max: number }>({ active: false, start: new THREE.Vector3(), pid: -1, max: 0 });
  const pull = useRef(new THREE.Vector3());
  const vel = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const rot = useRef({ y: 0, vy: 0, target: 0, x: 0, tx: 0 });
  const { camera, size, gl } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const pointer = useRef({ x: 0, y: 0, over: false });

  // external commands (keyboard)
  useEffect(() => {
    if (!command) return;
    if (command.kind === "poke") {
      uniforms.uGrab.value.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.9, 0.17);
      vel.current.set((Math.random() - 0.5) * 3, 1.6, 2.2);
      onStretch?.();
    } else if (command.kind === "turn") {
      rot.current.target += (command.dir ?? 1) * 0.6;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);

  const worldOnPlane = (cx: number, cy: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    ray.ray.intersectPlane(plane, tmp);
    return tmp.clone();
  };

  useEffect(() => {
    if (!interactive) return;
    const el = gl.domElement;
    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (drag.current.active && e.pointerId === drag.current.pid && group.current) {
        const p = worldOnPlane(e.clientX, e.clientY);
        group.current.worldToLocal(p);
        const d = p.sub(drag.current.start);
        // friction: the further you pull, the less it gives
        const len = d.length();
        drag.current.max = Math.max(drag.current.max, len);
        const give = (len * 1.25) / (1 + len * 1.1);
        d.setLength(give);
        desired.current.set(d.x, d.y, Math.min(0.45, len * 0.45));
        onPull?.(Math.min(1, len / 0.9));
      }
    };
    const up = (e: PointerEvent) => {
      if (drag.current.active && e.pointerId === drag.current.pid) {
        drag.current.active = false;
        // only a real pull counts; a scroll that began on the tee (pointercancel) or a bare tap does not
        if (e.type === "pointerup" && drag.current.max > 0.08) onStretch?.();
        desired.current.set(0, 0, 0);
        onPull?.(0);
        el.style.cursor = "grab";
      }
    };
    const enter = () => (pointer.current.over = true);
    const leave = () => (pointer.current.over = false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, gl, camera, size]);

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive || !group.current) return;
    e.stopPropagation();
    const local = group.current.worldToLocal(e.point.clone());
    uniforms.uGrab.value.set(local.x, local.y, local.z);
    drag.current = { active: true, start: new THREE.Vector3(local.x, local.y, 0), pid: e.pointerId, max: 0 };
    pull.current.set(0, 0, 0);
    vel.current.set(0, 0, 0);
    gl.domElement.style.cursor = "grabbing";
  };

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    // measure the first ~2 seconds; hand over to a still image on very slow devices
    const pf = perf.current;
    if (!pf.done && onSlow) {
      const now = performance.now();
      // a long gap means rendering was paused (off screen, hidden tab): start the measurement again
      if (!pf.start || now - (pf.last || now) > 250) {
        pf.start = now;
        pf.frames = 0;
      }
      pf.last = now;
      pf.frames++;
      if (now - pf.start > 2000) {
        pf.done = true;
        if ((pf.frames * 1000) / (now - pf.start) < 20) onSlow();
      }
    }
    uniforms.uTime.value = t;
    const step = Math.min(dt, 1 / 30);
    // spring the pull toward the desired offset (soft, slightly underdamped on release)
    const k = drag.current.active ? 120 : 70;
    const c = drag.current.active ? 18 : 7.5;
    const f = desired.current.clone().sub(pull.current).multiplyScalar(k).sub(vel.current.clone().multiplyScalar(c));
    vel.current.addScaledVector(f, step);
    pull.current.addScaledVector(vel.current, step);
    uniforms.uPull.value.copy(pull.current);

    // colour eases toward the chosen tee colour
    mat.color.lerp(target, 0.08);

    if (!group.current) return;
    const r = rot.current;
    if (!still) {
      const follow = interactive && pointer.current.over && !drag.current.active;
      const tgt = r.target + (follow ? pointer.current.x * 0.35 : calm ? 0 : Math.sin(t * 0.25) * 0.18);
      r.vy += ((tgt - r.y) * 18 - r.vy * 6) * step;
      r.y += r.vy * step;
      r.tx += (((follow ? -pointer.current.y * 0.12 : 0) - r.tx) * 4) * step;
      group.current.rotation.y = r.y;
      group.current.rotation.x = r.tx;
      group.current.position.y = calm ? 0 : Math.sin(t * 0.85) * 0.04;
    }
  });

  return (
    <group ref={group} onPointerDown={onDown}>
      <mesh geometry={geo} material={mat} castShadow />
    </group>
  );
}

export default function Tee(props: Props) {
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  // stop rendering the moment the tee leaves the screen (battery, heat, other sections' smoothness)
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    // lighter on small or low-power devices
    const small = window.matchMedia("(max-width: 760px)").matches;
    const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 4;
    if (small || cores <= 4) setDpr([1, 1.5]);
  }, []);
  return (
    <Canvas
      ref={canvas}
      className={props.className}
      dpr={dpr}
      camera={{ position: [0, 0.05, props.distance ?? 7.4], fov: 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.05, preserveDrawingBuffer: !!props.still, powerPreference: "high-performance" }}
      style={{ touchAction: props.interactive ? "pan-y" : "auto", cursor: props.interactive ? "grab" : "default" }}
      frameloop={onScreen ? "always" : "never"}
      // shader error checking is a synchronous GPU round-trip per program: keep it while developing only
      onCreated={({ gl }) => void (gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production")}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[2.5, 4, 5]} intensity={2.1} color="#fff3e4" />
      <directionalLight position={[-4, 1, 2]} intensity={0.5} color="#dfe8ff" />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={1.4} position={[0, 4, 3]} scale={[8, 3, 1]} color="#fff4e6" />
        <Lightformer intensity={0.7} position={[-5, 0, 2]} scale={[3, 6, 1]} color="#e9eef4" />
        <Lightformer intensity={0.5} position={[5, -1, 2]} scale={[3, 6, 1]} color="#f6e6dc" />
      </Environment>
      <Suspense fallback={null}>
        <TeeMesh {...props} />
      </Suspense>
      {props.shadow !== false && ( // taste-skill-ignore: a real contact shadow under a floating 3D object
        <ContactShadows frames={1} position={[0, -1.45, 0]} opacity={0.28} scale={6} blur={2.8} far={2.4} resolution={256} color="#3a3128" />
      )}
    </Canvas>
  );
}

useGLTF.preload(TEE_MODEL);
