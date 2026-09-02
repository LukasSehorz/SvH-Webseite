"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Leuchtende Partikel-Kugeln                                         */
/*                                                                     */
/*  Vorbild ist die Kugel von dnacapital.com. Viele weiche, kantenlose  */
/*  Baelle sehr unterschiedlicher Groesse, additiv gemischt. Vordere    */
/*  Punkte sind groesser und heller als hintere, daraus entsteht die    */
/*  Tiefe. Neben jeder Kugel steht eine kleinere, dichtere Begleiterin. */
/*                                                                     */
/*  Ein einziges Canvas traegt alle Kugeln. Die Lage kommt aus dem DOM  */
/*  (normalisierte Mitte und Radius je Zone), damit Kugel und           */
/*  Beschriftung auf jeder Breite exakt uebereinander liegen.           */
/* ------------------------------------------------------------------ */

export type OrbLayout = {
  /** Mitte der Zone, 0 bis 1 bezogen auf die Canvas-Flaeche. */
  x: number;
  y: number;
  /** Radius als Anteil der Canvas-Hoehe. */
  r: number;
  /** Begleitkugel, Versatz und Radius als Vielfaches des Kugelradius. */
  moon: { x: number; y: number; z: number; r: number };
};

/* Orthografische Kamera mit Zoom 1. Eine Welteinheit entspricht genau
   einem CSS-Pixel, dadurch bleiben die Kugeln am Rand verzerrungsfrei. */
const CAMERA_Z = 1400;

/** Punktzahl der grossen Kugel. Die Landing-Kugeln bleiben sparsam, die
    Einzelkugel der Buehne uebersteuert den Wert ueber die Prop `mainCount`. */
const MAIN_COUNT = 1150;
const MOON_COUNT = 520;
const HOVER_SCALE = 1.06;
const HOVER_POINT = 1.3;

/** Voller Atemzyklus der Dichte in Sekunden, aus dna-kugel-atmen gelesen. */
const BREATH_PERIOD = 10;

/** Punktgroesse als Anteil des Kugeldurchmessers, kleinster und groesster
    Ball. Der Standard traegt die sparsamen Landing-Kugeln. Die dichte
    Buehnenkugel auf /marketing setzt einen feineren Bereich, damit die
    Koernung `dna-ourdna\01_y850.png` trifft. */
export type SizeRange = readonly [min: number, max: number];
const SIZE_RANGE: SizeRange = [0.012, 0.093];

/** Die Begleiterin misst nur einen Bruchteil der Hauptkugel. Ihre Punkte
    werden gegenueber deren Koernung angehoben, sonst zerfaellt sie. */
const MOON_GRAIN = 3.4;

/** Je Kugel eine fuehrende und eine begleitende Farbe aus der Rampe. */
const PALETTES: readonly {
  lead: readonly number[];
  second: readonly number[];
  mix: number;
}[] = [
  { lead: [0x4b7dff, 0x2f5cf5, 0x6a97ff], second: [0x7358ff, 0x8b74ff], mix: 0.32 },
  { lead: [0x7358ff, 0x5b45f0, 0x8b74ff], second: [0x4b7dff, 0xb9a5ff], mix: 0.34 },
  { lead: [0x9d7dff, 0x8462ff, 0xb49bff], second: [0x6a52f5, 0x7a97ff], mix: 0.32 },
  // Volle Rampe. Fuer die Einzelkugel der Buehne, die keine Nachbarin hat
  // und deshalb Blau, Violett und Lavendel selbst tragen muss.
  {
    lead: [0x4b7dff, 0x7358ff, 0xb9a5ff, 0x6a97ff],
    second: [0x2f5cf5, 0x9d7dff, 0x8b74ff],
    mix: 0.4,
  },
];

/** Index der vollen Rampe in PALETTES. */
export const PALETTE_FULL = 3;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/*  Punktwolke                                                         */
/* ------------------------------------------------------------------ */

type CloudOptions = {
  count: number;
  seed: number;
  palette: (typeof PALETTES)[number];
  /** Punktgroesse als Anteil des Kugeldurchmessers. */
  sizeMin: number;
  sizeMax: number;
  /** Verteilung in die Tiefe. 1 bedeutet reine Schale. */
  shell: number;
  gain: number;
};

function buildCloud(options: CloudOptions): THREE.BufferGeometry {
  const rand = mulberry32(options.seed);
  const { count } = options;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const color = new THREE.Color();
  const helper = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * golden + rand() * 0.4;
    let radius = options.shell + (1 - options.shell) * Math.sqrt(rand());
    // Wenige Punkte stehen etwas ueber die Schale hinaus, dadurch wird der
    // Umriss lebendig statt gestanzt.
    if (rand() > 0.9) radius *= 1 + rand() * 0.13;

    positions[i * 3] = Math.cos(phi) * ring * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(phi) * ring * radius;

    // Viele kleine, deutlich weniger grosse Baelle.
    const roll = rand();
    const spread = Math.pow(roll, 2.2);
    sizes[i] = options.sizeMin + spread * (options.sizeMax - options.sizeMin);

    const set = rand() < options.palette.mix ? options.palette.second : options.palette.lead;
    // Ohne Farbmanagement gesetzt, der Shader gibt die Werte unveraendert aus.
    color.setHex(set[Math.floor(rand() * set.length)], THREE.LinearSRGBColorSpace);

    // Grosse Baelle leuchten kraeftiger, kleine bleiben zurueckhaltend.
    // Der Weissanteil bleibt klein, damit die Farbe nicht ausbleicht.
    const body = 0.62 + spread * 0.5;
    if (rand() > 0.94) {
      helper.setHex(0xffffff, THREE.LinearSRGBColorSpace);
      color.lerp(helper, 0.12);
      color.multiplyScalar(options.gain * body * (1.05 + rand() * 0.3));
    } else {
      color.multiplyScalar(options.gain * body * (0.5 + rand() * 0.45));
    }

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    seeds[i] = rand();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return geometry;
}

/* ------------------------------------------------------------------ */
/*  Material                                                           */
/* ------------------------------------------------------------------ */

const VERTEX = /* glsl */ `
attribute vec3 aColor;
attribute float aSize;
attribute float aSeed;

uniform float uTime;
uniform float uDiameter;
uniform float uScale;
uniform float uDpr;
uniform float uFlicker;
uniform float uBloom;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec4 mv = modelViewMatrix * vec4( position, 1.0 );
  vec3 centre = ( modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ) ).xyz;
  vec3 rel = mv.xyz - centre;
  float len = max( length( rel ), 0.0001 );

  // -1 hinten, +1 vorne. Traegt Groesse und Helligkeit.
  float front = rel.z / len * 0.5 + 0.5;

  float flick = 1.0 + uFlicker * sin( uTime * ( 0.5 + aSeed * 2.1 ) + aSeed * 34.0 );

  // Dichte-Atmen. Jeder Punkt traegt eine eigene Schwelle. Faellt die
  // Bluete unter diese Schwelle, blendet der Punkt aus. Punkte an der
  // Silhouette halten laenger durch, dadurch bleibt im duennen Zustand
  // ein Ring stehen, genau wie in der Referenz.
  float rim = 1.0 - abs( front * 2.0 - 1.0 );
  float keep = aSeed * 0.82 - rim * 0.34;
  float bloom = smoothstep( keep - 0.16, keep + 0.16, uBloom );

  gl_Position = projectionMatrix * mv;
  gl_PointSize =
    aSize * uDiameter * uScale * uDpr * mix( 0.58, 1.34, front ) * flick
    * mix( 0.35, 1.0, bloom );

  vColor = aColor * mix( 0.18, 1.0, front ) * flick;
  vAlpha = mix( 0.3, 1.0, front ) * bloom;
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;

varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length( gl_PointCoord - vec2( 0.5 ) ) * 2.0;
  if ( d > 1.0 ) discard;
  float edge = 1.0 - d;
  // Ruhiger Kern mit weichem Saum und schmalem Hof. Kein harter Rand.
  float disc = smoothstep( 1.0, 0.68, d );
  float halo = pow( edge, 2.6 ) * 0.2;
  float alpha = ( disc * 0.94 + halo ) * vAlpha;
  gl_FragColor = vec4( vColor, clamp( alpha, 0.0, 1.0 ) );
}
`;

function makeMaterial(flicker: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDiameter: { value: 240 },
      uScale: { value: 1 },
      uDpr: { value: 1 },
      uFlicker: { value: flicker },
      uBloom: { value: 1 },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

/* ------------------------------------------------------------------ */
/*  Eine Kugel samt Begleiterin                                        */
/* ------------------------------------------------------------------ */

function Orb({
  index,
  layout,
  hovered,
  still,
  mainCount,
  paletteIndex,
  sizeRange,
}: Readonly<{
  index: number;
  layout: OrbLayout;
  hovered: boolean;
  still: boolean;
  mainCount: number;
  paletteIndex: number;
  sizeRange: SizeRange;
}>) {
  const palette = PALETTES[paletteIndex % PALETTES.length];
  const moon = layout.moon;
  const [sizeMin, sizeMax] = sizeRange;

  const geometry = useMemo(
    () => ({
      main: buildCloud({
        count: mainCount,
        seed: 1301 + index * 977,
        palette,
        sizeMin,
        sizeMax,
        shell: 0.86,
        gain: 1,
      }),
      moon: buildCloud({
        count: MOON_COUNT,
        seed: 5099 + index * 613,
        palette,
        // Die Begleiterin ist klein. Ihre Punkte bleiben relativ zu ihrem
        // eigenen Durchmesser groeber, sonst verschwindet sie zu Staub.
        sizeMin: sizeMin * MOON_GRAIN,
        sizeMax: sizeMax * MOON_GRAIN,
        shell: 0.6,
        gain: 0.86,
      }),
    }),
    [index, mainCount, palette, sizeMin, sizeMax],
  );

  const materials = useMemo(
    () => ({ main: makeMaterial(0.16), moon: makeMaterial(0.2) }),
    [],
  );

  const shell = useRef<THREE.Group>(null);
  const spinMain = useRef<THREE.Group>(null);
  const spinMoon = useRef<THREE.Group>(null);
  const eased = useRef({ scale: 1, point: 1 });
  const { viewport, gl } = useThree();

  useEffect(
    () => () => {
      geometry.main.dispose();
      geometry.moon.dispose();
      materials.main.dispose();
      materials.moon.dispose();
    },
    [geometry, materials],
  );

  useFrame((state, delta) => {
    const group = shell.current;
    if (!group) return;

    const step = Math.min(delta, 0.05);
    const damp = 1 - Math.exp(-7 * step);
    const time = state.clock.elapsedTime;

    // Lage und Groesse folgen der gemessenen DOM-Zone.
    group.position.x = (layout.x - 0.5) * viewport.width;
    group.position.y = (0.5 - layout.y) * viewport.height;

    const targetScale = hovered ? HOVER_SCALE : 1;
    eased.current.scale += (targetScale - eased.current.scale) * damp;

    const breathe = still ? 1 : 1 + Math.sin(time * 0.55 + index * 2.1) * 0.02;
    const radius = layout.r * viewport.height;
    group.scale.setScalar(radius * eased.current.scale * breathe);

    if (!still) {
      if (spinMain.current) spinMain.current.rotation.y += 0.05 * step;
      if (spinMoon.current) spinMoon.current.rotation.y += 0.07 * step;
    }

    const targetPoint = hovered ? HOVER_POINT : 1;
    eased.current.point += (targetPoint - eased.current.point) * damp;

    const dpr = gl.getPixelRatio();
    const diameter = radius * 2 * eased.current.scale * breathe;

    // Dichte-Atmen. Eine sehr langsame Uhr laesst die Kugel zwischen
    // duenner Schale und voller Bluete wechseln. Der Zyklus ist aus der
    // Referenzserie abgelesen und dauert rund zehn Sekunden.
    const bloom = still
      ? 1
      : 0.52 + 0.62 * (0.5 + 0.5 * Math.sin((time / BREATH_PERIOD) * Math.PI * 2 - Math.PI / 2));

    for (const material of [materials.main, materials.moon]) {
      material.uniforms.uTime.value = still ? 0 : time;
      material.uniforms.uScale.value = eased.current.point;
      material.uniforms.uDpr.value = dpr;
      material.uniforms.uBloom.value = bloom;
    }
    materials.main.uniforms.uDiameter.value = diameter;
    materials.moon.uniforms.uDiameter.value = diameter * moon.r;
  });

  return (
    <group ref={shell}>
      {/* Die Neigung gilt nur der grossen Kugel. Laege die Begleiterin
          mit darin, wuerde ihre Lage um denselben Winkel wegdrehen und
          die aus dem DOM gemessene Position verfehlen. */}
      <group rotation={[-0.16, 0, 0.26]}>
        <group ref={spinMain}>
          <points
            geometry={geometry.main}
            material={materials.main}
            frustumCulled={false}
          />
        </group>
      </group>

      {/* Auf sehr engen Spalten entfaellt die Begleiterin. */}
      {moon.r > 0 ? (
        <group position={[moon.x, moon.y, moon.z]} scale={moon.r}>
          <group rotation={[-0.2, 0, 0.34]}>
            <group ref={spinMoon}>
              <points
                geometry={geometry.moon}
                material={materials.moon}
                frustumCulled={false}
              />
            </group>
          </group>
        </group>
      ) : null}
    </group>
  );
}

/* ------------------------------------------------------------------ */

function Scene({
  layout,
  hovered,
  still,
  mainCount,
  palette,
  sizeRange,
}: Readonly<{
  layout: readonly OrbLayout[];
  hovered: number | null;
  still: boolean;
  mainCount: number;
  palette?: number;
  sizeRange: SizeRange;
}>) {
  const drift = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    if (still) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((_state, delta) => {
    const group = drift.current;
    if (!group) return;
    if (still) {
      group.position.set(0, 0, 0);
      return;
    }
    const step = Math.min(delta, 0.05);
    const damp = 1 - Math.exp(-2.6 * step);
    pointer.current.x += (pointer.current.tx - pointer.current.x) * damp;
    pointer.current.y += (pointer.current.ty - pointer.current.y) * damp;
    // Welteinheiten entsprechen Pixeln, der Versatz bleibt dezent.
    group.position.x = pointer.current.x * 18;
    group.position.y = -pointer.current.y * 12;
  });

  return (
    <group ref={drift}>
      {layout.map((entry, index) => (
        <Orb
          key={index}
          index={index}
          layout={entry}
          hovered={hovered === index}
          still={still}
          mainCount={mainCount}
          paletteIndex={palette ?? index}
          sizeRange={sizeRange}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */

export default function OrbsCanvas({
  layout,
  hovered,
  still,
  mainCount = MAIN_COUNT,
  palette,
  sizeRange = SIZE_RANGE,
}: Readonly<{
  layout: readonly OrbLayout[];
  hovered: number | null;
  still: boolean;
  /** Punkte der grossen Kugel. Ohne Angabe bleibt es beim sparsamen Wert. */
  mainCount?: number;
  /** Feste Palette fuer alle Kugeln. Ohne Angabe traegt jede ihre eigene. */
  palette?: number;
  /** Koernung. Kleinster und groesster Ball als Anteil des Durchmessers. */
  sizeRange?: SizeRange;
}>) {
  if (layout.length === 0) return null;

  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      frameloop={still ? "demand" : "always"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, CAMERA_Z], zoom: 1, near: 1, far: CAMERA_Z * 3 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene
        layout={layout}
        hovered={hovered}
        still={still}
        mainCount={mainCount}
        palette={palette}
        sizeRange={sizeRange}
      />
    </Canvas>
  );
}
