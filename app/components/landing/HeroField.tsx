"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSafeReducedMotion } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  Kenngrößen des Feldes                                              */
/* ------------------------------------------------------------------ */

export type FieldState = "chaos" | "order";

const COUNT = 140;
/** Radius des räumlichen Bursts im geordneten Zustand. */
const R_BURST = 2.24;
/** Anteil der Punkte, die eine Speiche zur Nabe tragen. */
const SPOKE_SHARE = 0.78;

/*
 * Zyklus. 3.4s ungeordnet halten, 2.8s Uebergang, 6.4s geordnet halten,
 * 2.8s zurueck.
 *
 * Die beiden Haltezeiten waren einmal gleich lang. Der geordnete Zustand
 * ist aber die Aussage der Szene, und nur in ihm stehen die drei Werte am
 * Feldrand. Bei gleicher Dauer war die Haelfte der Zeit fuer den Zustand
 * reserviert, den wir gerade nicht meinen. Der geordnete Zustand steht
 * deshalb fast doppelt so lang.
 */
const HOLD_CHAOS = 3.4;
const HOLD_ORDER = 6.4;
const MORPH = 2.8;
/**
 * Vorlauf der Uhr. Ohne ihn stünde der ungeordnete Zustand die vollen 3.4s,
 * und wer nur kurz bleibt, sähe den Wechsel nie. Mit dem Vorlauf beginnt er
 * nach knapp einer Sekunde.
 */
const LEAD_IN = 2.6;
/** Individueller Versatz je Punkt, damit die Wolke nicht wie ein Block gleitet. */
const STAGGER = 0.4;
const CYCLE = HOLD_CHAOS + HOLD_ORDER + MORPH * 2;

const LINE_CHAOS = 0.1;
const LINE_ORDER = 0.16;

const PALETTE = ["#5b8cff", "#7c6aff", "#b9a5ff", "#f4f4f6"] as const;

/** Deterministische Zufallszahlen, damit das Feld bei jedem Aufbau gleich aussieht. */
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

/** power2.inOut, so gleitet jeder Punkt weich an und weich aus. */
function power2InOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* ------------------------------------------------------------------ */
/*  Feldaufbau                                                         */
/* ------------------------------------------------------------------ */

type Field = {
  /** Zustand A, verstreut mit ungleicher Dichte. */
  chaos: Float32Array;
  /** Zustand B, räumlicher Burst um die Nabe. */
  order: Float32Array;
  sizes: Float32Array;
  /** Farbzustand Chaos. Alle Punkte weiß mit leiser Helligkeitsstreuung. */
  colorsWhite: THREE.Color[];
  /** Farbzustand Ordnung. Die Rampe plus wenige weiße Akzente. */
  colorsOrder: THREE.Color[];
  delays: Float32Array;
  /** Je Punkt Amplitude, Frequenz und Phase des Zitterns. */
  shiver: Float32Array;
  /** Kurze Zufallslinien des Chaos. */
  chaosPairs: Uint16Array;
  /** Speichen von der Nabe zu den Burst-Punkten. */
  spokes: Uint16Array;
};

function buildField(): Field {
  const rand = mulberry32(20260825);

  const chaos = new Float32Array(COUNT * 3);
  const order = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const delays = new Float32Array(COUNT);
  const shiver = new Float32Array(COUNT * 3);
  const colorsWhite: THREE.Color[] = [];
  const colorsOrder: THREE.Color[] = [];

  // Normalverteilte Streuung um die Ballungen.
  const bell = () => {
    const u = Math.max(1e-6, rand());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };

  // Wenige Ballungen erzeugen die ungleiche Dichte des Chaos.
  const clusters = [
    { x: -1.18, y: 0.98, s: 0.6, w: 0.22 },
    { x: 0.82, y: 1.28, s: 0.48, w: 0.18 },
    { x: 1.42, y: -0.52, s: 0.7, w: 0.2 },
    { x: -0.78, y: -1.32, s: 0.56, w: 0.16 },
    { x: 0.2, y: 0.06, s: 0.9, w: 0.11 },
  ];
  const spread = clusters.reduce((sum, c) => sum + c.w, 0);

  for (let i = 0; i < COUNT; i += 1) {
    let x: number;
    let y: number;

    if (i === 0) {
      // Index 0 ist die Nabe. Sie startet bereits nahe der Mitte.
      const angle = rand() * Math.PI * 2;
      const radius = rand() * 0.42;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
    } else if (rand() < 0.78) {
      let pick = rand() * spread;
      let cluster = clusters[clusters.length - 1];
      for (const candidate of clusters) {
        pick -= candidate.w;
        if (pick <= 0) {
          cluster = candidate;
          break;
        }
      }
      x = cluster.x + bell() * cluster.s;
      y = cluster.y + bell() * cluster.s;
    } else {
      x = (rand() - 0.5) * 5.3;
      y = (rand() - 0.5) * 5.1;
    }

    chaos[i * 3] = Math.max(-2.72, Math.min(2.72, x));
    chaos[i * 3 + 1] = Math.max(-2.56, Math.min(2.56, y));
    // Auch das Chaos hat Tiefe, damit die Raumdrehung nie flach wirkt.
    chaos[i * 3 + 2] = (rand() - 0.5) * 1.1;

    // Wenige große Knoten, viele feine. Das erzeugt den ruhigen Rhythmus.
    const t = rand();
    sizes[i] = 0.013 + Math.pow(t, 3.5) * 0.185;

    // Ohne System bleibt alles weiß, nur die Helligkeit streut leise.
    const white = new THREE.Color(PALETTE[3]);
    white.multiplyScalar(0.62 + rand() * 0.38);
    colorsWhite.push(white);

    // Mit System kommt die Farbe. Rampe plus wenige weiße Akzente.
    const pick = rand();
    const hex =
      pick < 0.32
        ? PALETTE[0]
        : pick < 0.6
          ? PALETTE[1]
          : pick < 0.84
            ? PALETTE[2]
            : PALETTE[3];
    const color = new THREE.Color(hex);
    color.multiplyScalar(0.72 + rand() * 0.28);
    colorsOrder.push(color);

    delays[i] = rand() * STAGGER;
    shiver[i * 3] = 0.028 + rand() * 0.042;
    shiver[i * 3 + 1] = 0.55 + rand() * 0.95;
    shiver[i * 3 + 2] = rand() * Math.PI * 2;
  }

  // Die Nabe ist der hellere Kernpunkt, in beiden Zuständen weiß.
  sizes[0] = 0.108;
  colorsWhite[0] = new THREE.Color(PALETTE[3]);
  colorsOrder[0] = new THREE.Color(PALETTE[3]);
  delays[0] = 0;

  // Der geordnete Zustand ist EIN räumlicher Burst. Jeder Punkt bekommt
  // eine gleichverteilte Richtung auf der Kugel und eine gestreute Tiefe,
  // die meisten sitzen nahe der Schale, einige weiter innen.
  order[0] = 0;
  order[1] = 0;
  order[2] = 0;

  const spokes: number[] = [];
  for (let i = 1; i < COUNT; i += 1) {
    const zDir = rand() * 2 - 1;
    const angle = rand() * Math.PI * 2;
    const rxy = Math.sqrt(Math.max(0, 1 - zDir * zDir));
    const radius = R_BURST * (0.42 + 0.58 * Math.pow(rand(), 0.65));
    order[i * 3] = Math.cos(angle) * rxy * radius;
    order[i * 3 + 1] = Math.sin(angle) * rxy * radius;
    order[i * 3 + 2] = zDir * radius;
    if (rand() < SPOKE_SHARE) spokes.push(0, i);
  }

  // Wenige kurze Zufallslinien im Chaos.
  const pairs: number[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (pairs.length < 48 && guard < 4000) {
    guard += 1;
    const a = 1 + Math.floor(rand() * (COUNT - 1));
    const b = 1 + Math.floor(rand() * (COUNT - 1));
    if (a === b) continue;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) continue;
    const dx = chaos[a * 3] - chaos[b * 3];
    const dy = chaos[a * 3 + 1] - chaos[b * 3 + 1];
    if (Math.hypot(dx, dy) > 0.92) continue;
    seen.add(key);
    pairs.push(a, b);
  }

  return {
    chaos,
    order,
    sizes,
    colorsWhite,
    colorsOrder,
    delays,
    shiver,
    chaosPairs: new Uint16Array(pairs),
    spokes: new Uint16Array(spokes),
  };
}

/* ------------------------------------------------------------------ */
/*  Szene                                                              */
/* ------------------------------------------------------------------ */

function Constellation({
  still,
  onState,
}: Readonly<{ still: boolean; onState?: (state: FieldState) => void }>) {
  const field = useMemo(buildField, []);
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const chaosGeom = useRef<THREE.BufferGeometry>(null);
  const orderGeom = useRef<THREE.BufferGeometry>(null);
  const chaosMat = useRef<THREE.LineBasicMaterial>(null);
  const orderMat = useRef<THREE.LineBasicMaterial>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const live = useMemo(() => new Float32Array(COUNT * 3), []);
  const chaosLine = useMemo(
    () => new Float32Array(field.chaosPairs.length * 3),
    [field],
  );
  const orderLine = useMemo(
    () => new Float32Array(field.spokes.length * 3),
    [field],
  );

  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const clock = useRef(LEAD_IN);
  const spin = useRef(0);
  const state = useRef<FieldState>("chaos");
  const report = useRef(onState);
  report.current = onState;

  const { invalidate } = useThree();

  const scratch = useMemo(() => new THREE.Color(), []);
  const lastColorMix = useRef(-1);

  /** Setzt alle Instanzen und Linien aus `live`. */
  const paint = useMemo(() => {
    return (mix: number) => {
      const instanced = mesh.current;
      if (instanced) {
        for (let i = 0; i < COUNT; i += 1) {
          dummy.position.set(live[i * 3], live[i * 3 + 1], live[i * 3 + 2]);
          // Die Nabe wächst mit der Ordnung leicht an.
          const grow = i === 0 ? 1 + mix * 0.55 : 1;
          dummy.scale.setScalar(field.sizes[i] * grow);
          dummy.updateMatrix();
          instanced.setMatrixAt(i, dummy.matrix);
        }
        instanced.instanceMatrix.needsUpdate = true;

        // Ohne System weiß, mit System farbig. Die Farbe kommt mit der
        // Ordnung und geht mit ihr wieder.
        if (mix !== lastColorMix.current) {
          lastColorMix.current = mix;
          for (let i = 0; i < COUNT; i += 1) {
            scratch
              .copy(field.colorsWhite[i])
              .lerp(field.colorsOrder[i], mix);
            instanced.setColorAt(i, scratch);
          }
          if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
        }
      }

      for (let k = 0; k < field.chaosPairs.length; k += 1) {
        const p = field.chaosPairs[k] * 3;
        chaosLine[k * 3] = live[p];
        chaosLine[k * 3 + 1] = live[p + 1];
        chaosLine[k * 3 + 2] = live[p + 2];
      }
      for (let k = 0; k < field.spokes.length; k += 1) {
        const p = field.spokes[k] * 3;
        orderLine[k * 3] = live[p];
        orderLine[k * 3 + 1] = live[p + 1];
        orderLine[k * 3 + 2] = live[p + 2];
      }

      const ca = chaosGeom.current?.getAttribute("position");
      if (ca) ca.needsUpdate = true;
      const oa = orderGeom.current?.getAttribute("position");
      if (oa) oa.needsUpdate = true;

      if (chaosMat.current) chaosMat.current.opacity = LINE_CHAOS * (1 - mix);
      if (orderMat.current) orderMat.current.opacity = LINE_ORDER * mix;
    };
  }, [field, dummy, live, chaosLine, orderLine]);

  /** Positionen zum Zeitpunkt `time` des Zyklus berechnen. */
  const sample = useMemo(() => {
    return (time: number, shake: boolean) => {
      const phase = ((time % CYCLE) + CYCLE) % CYCLE;

      // Globaler Fortschritt für Linien und Unterschrift.
      let mix: number;
      let base: number;
      let forward: boolean;
      if (phase < HOLD_CHAOS) {
        mix = 0;
        base = 0;
        forward = true;
      } else if (phase < HOLD_CHAOS + MORPH) {
        base = phase - HOLD_CHAOS;
        forward = true;
        mix = power2InOut(clamp01(base / MORPH));
      } else if (phase < HOLD_CHAOS + MORPH + HOLD_ORDER) {
        mix = 1;
        base = 0;
        forward = false;
      } else {
        base = phase - (HOLD_CHAOS + MORPH + HOLD_ORDER);
        forward = false;
        mix = 1 - power2InOut(clamp01(base / MORPH));
      }

      const span = MORPH - STAGGER;

      for (let i = 0; i < COUNT; i += 1) {
        let local: number;
        if (base === 0) {
          local = mix > 0.5 ? 1 : 0;
        } else {
          const raw = clamp01((base - field.delays[i]) / span);
          local = forward ? power2InOut(raw) : 1 - power2InOut(raw);
        }

        const ax = field.chaos[i * 3];
        const ay = field.chaos[i * 3 + 1];
        const az = field.chaos[i * 3 + 2];
        const bx = field.order[i * 3];
        const by = field.order[i * 3 + 1];
        const bz = field.order[i * 3 + 2];

        let x = ax + (bx - ax) * local;
        let y = ay + (by - ay) * local;
        const z = az + (bz - az) * local;

        // Nur das Chaos zittert, die Ordnung steht ruhig.
        if (shake && local < 1) {
          const amp = field.shiver[i * 3] * (1 - local);
          const freq = field.shiver[i * 3 + 1];
          const ph = field.shiver[i * 3 + 2];
          x += Math.sin(time * freq + ph) * amp;
          y += Math.cos(time * freq * 0.86 + ph * 1.31) * amp;
        }

        live[i * 3] = x;
        live[i * 3 + 1] = y;
        live[i * 3 + 2] = z;
      }

      return mix;
    };
  }, [field, live]);

  // Startzustand der Farben. Weiß, bis die erste Ordnung kommt.
  useEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    for (let i = 0; i < COUNT; i += 1)
      instanced.setColorAt(i, field.colorsWhite[i]);
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
  }, [field]);

  // Standbild bei ruhendem Feld. Es zeigt die farbige Ordnung in Raumlage.
  useEffect(() => {
    if (!still) return;
    const g = group.current;
    if (g) g.rotation.set(-0.16, 0.4, 0);
    paint(sample(HOLD_CHAOS + MORPH + 0.5, false));
    state.current = "order";
    report.current?.("order");
    invalidate();
  }, [still, paint, sample, invalidate]);

  useEffect(() => {
    if (still) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((_, delta) => {
    if (still) return;
    const step = Math.min(delta, 0.05);
    clock.current += step;

    const g = group.current;
    if (!g) return;

    // Der Burst dreht als Körper im Raum. Die Y-Drehung macht die Tiefe
    // sichtbar, dazu eine kaum merkliche Drehung in der Bildebene.
    spin.current += 0.05 * step;
    g.rotation.z += 0.008 * step;

    // Gedämpfter Maus-Parallax auf Lage und Neigung.
    const damp = 1 - Math.exp(-3.2 * step);
    pointer.current.x += (pointer.current.tx - pointer.current.x) * damp;
    pointer.current.y += (pointer.current.ty - pointer.current.y) * damp;
    g.position.x = pointer.current.x * 0.26;
    g.position.y = -pointer.current.y * 0.2;
    g.rotation.x = -0.16 - pointer.current.y * 0.05;
    g.rotation.y = spin.current + pointer.current.x * 0.06;

    const mix = sample(clock.current, true);
    paint(mix);

    const next: FieldState = mix > 0.5 ? "order" : "chaos";
    if (next !== state.current) {
      state.current = next;
      report.current?.(next);
    }
  });

  return (
    <group ref={group}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={chaosGeom}>
          <bufferAttribute attach="attributes-position" args={[chaosLine, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={chaosMat}
          color="#f4f4f6"
          transparent
          opacity={LINE_CHAOS}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={orderGeom}>
          <bufferAttribute attach="attributes-position" args={[orderLine, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={orderMat}
          color="#9db4ff"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        {/* Grobe Kugeln reichen. Die Punkte sind klein, die Ersparnis je Bild
            ist dagegen spürbar. */}
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Hülle                                                              */
/* ------------------------------------------------------------------ */

export default function HeroField({
  onState,
}: Readonly<{ onState?: (state: FieldState) => void }>) {
  const reduced = useSafeReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const still = reduced || !visible;

  return (
    <div ref={host} className="hero-field" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        frameloop={still ? "demand" : "always"}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 7.3], fov: 42 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Constellation still={still} onState={onState} />
      </Canvas>
    </div>
  );
}
