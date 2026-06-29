import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, GitBranch, Network, Shield, Globe, TrendingUp,
  MapPin, Mail, ArrowRight, CheckCircle, Building2,
  Cpu, Menu, X, Send, Loader2, Battery, Paperclip,
} from "lucide-react";
import { DIVISIONS } from "./data/divisions.js";
import { ARTICLES } from "./data/articles.js";
import { LIGHTNING_PATHS } from "./data/lightningPaths.js";
import CircuitSystem from "./components/CircuitSystem.jsx";
import { usePageMeta, toSlug } from "./utils/seo.js";
import { Link } from "react-router-dom";

const ICON_MAP = { Zap, GitBranch, Network, Battery };
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const HEADING = "'Space Grotesk', sans-serif";
const BRAND = "#E8631A";
const BRAND_DARK = "#CC5816";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p
      className="text-xs font-semibold mb-4"
      style={{ color: BRAND, letterSpacing: "0.22em", fontFamily: MONO }}
    >
      {children}
    </p>
  );
}

function OrangeLine() {
  return (
    <div className="relative w-full" style={{ height: 1 }}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(232,99,26,0.65), transparent)",
          boxShadow: "0 0 14px rgba(232,99,26,0.55), 0 0 2px rgba(232,99,26,0.8)",
        }}
      />
    </div>
  );
}

// No scroll-gating of any kind: this wraps cards, info boxes, and section
// headers alike, and every one of them must render at opacity:1/visible at
// all times regardless of scroll position. Plain div, no observer, no
// JS-driven hidden state — params kept so call sites don't need touching.
function FadeIn({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function Counter({ end, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const d = 1800;
    const t = setInterval(() => {
      const p = Math.min((Date.now() - start) / d, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p === 1) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [end]);
  return <span>{count}{suffix}</span>;
}

function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}

// ─── Scroll-triggered counter ─────────────────────────────────────────────────
function ScrollCounter({ end, suffix = "", prefix = "" }) {
  const [count,     setCount]     = useState(0);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered) return;
    const t0 = Date.now();
    const dur = 2000;
    const id = setInterval(() => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [triggered, end]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

// ─── Magnetic CTA button ──────────────────────────────────────────────────────
function MagneticCTA({ href, children }) {
  const ref  = useRef(null);
  const [xy,  setXY]  = useState({ x: 0, y: 0 });
  const [hot, setHot] = useState(false);

  const onMove = (e) => {
    const r  = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
    const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
    setXY({ x: dx, y: dy });
    setHot(true);
  };
  const onLeave = () => { setXY({ x: 0, y: 0 }); setHot(false); };

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 32px",
        background: hot ? BRAND_DARK : BRAND,
        color: "#fff",
        fontFamily: HEADING,
        fontWeight: 800,
        fontSize: "0.82rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        textDecoration: "none",
        clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
        transform: `translate(${xy.x}px, ${xy.y}px)`,
        transition: "transform 0.15s ease-out, background 0.15s ease, box-shadow 0.2s ease",
        boxShadow: hot ? "0 0 36px rgba(232,99,26,0.6), 0 0 10px rgba(232,99,26,0.85)" : "none",
        willChange: "transform",
      }}
    >
      {children}
      <ArrowRight size={14} />
    </a>
  );
}

// ─── Trusted-by / Certifications row ─────────────────────────────────────────
const TRUST_LOGOS = [
  { src: "/logos/ul.svg",                alt: "UL Solutions",       w: 44 },
  { src: "/logos/ce-mark.svg",           alt: "CE Mark",            w: 60 },
  { src: "/logos/iso-9001.svg",          alt: "ISO 9001",           w: 68 },
  { src: "/logos/ieee.svg",              alt: "IEEE",               w: 68 },
  { src: "/logos/schneiderelectric.svg", alt: "Schneider Electric", w: 76 },
  { src: "/logos/siemens.svg",           alt: "Siemens",            w: 76 },
  { src: "/logos/abb.svg",               alt: "ABB",                w: 44 },
  { src: "/logos/sgs.svg",              alt: "SGS",                w: 44 },
];

function TrustedRow() {
  const logos = [...TRUST_LOGOS, ...TRUST_LOGOS];
  return (
    <div style={{
      position: "relative",
      zIndex: 2,
      background: "rgba(10,12,18,0.98)",
      borderBottom: "1px solid rgba(44,82,130,0.15)",
      padding: "20px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{
          fontFamily: MONO,
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.28em",
          color: "rgba(232,99,26,0.6)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          flexShrink: 0,
          padding: "0 28px",
        }}>
          Trusted By
        </span>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <motion.div
            style={{ display: "flex", alignItems: "center", gap: 48, width: "max-content" }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          >
            {logos.map((logo, i) => (
              <img
                key={i}
                src={logo.src}
                alt={logo.alt}
                draggable={false}
                style={{
                  height: 28,
                  width: "auto",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                  opacity: 0.85,
                  display: "block",
                  userSelect: "none",
                  flexShrink: 0,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Lightning Strike (geometry-aware: traces each scene's real structure) ────
// Exact hex of "POWER" in the navbar/hero wordmark — see Navbar()/Hero() below.
const BOLT_COLOR = "#E8631A";
const BOLT_CORE = "rgba(255,255,255,0.25)";

// Same hue as BOLT_COLOR, alpha-only variants — used for the layered glow
// (tight/mid/wide drop-shadows), the ambient radial glow, and micro-arcs.
// Derived rather than hand-picked so every orange on screen traces back to
// the one real wordmark color.
function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
const BOLT_GLOW_TIGHT = BOLT_COLOR; // full-strength inner glow
const BOLT_GLOW_MID = hexToRgba(BOLT_COLOR, 0.8); // mid-radius glow, slightly softened
const BOLT_GLOW_WIDE = hexToRgba(BOLT_COLOR, 0.45); // wide bloom, mostly faded
const BOLT_AMBIENT = hexToRgba(BOLT_COLOR, 0.06); // idle radial glow between strikes

// Midpoint-displacement fractal: each pass bisects every segment and kicks the
// new point sideways by a shrinking random amount. This is what gives real
// lightning its self-similar look — big bends with fine jagged texture riding
// on top of them — instead of a single smooth zigzag.
function fractalPath(x1, y1, x2, y2, depth, roughness) {
  let pts = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
  for (let level = 0; level < depth; level++) {
    const next = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const offset = (Math.random() - 0.5) * len * roughness;
      next.push({ x: (a.x + b.x) / 2 + nx * offset, y: (a.y + b.y) / 2 + ny * offset }, b);
    }
    pts = next;
    roughness *= 0.62;
  }
  return pts;
}

const pathD = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

// ±amount jitter per re-strike, in image-percent space, so the bolt never
// retraces the exact same line twice but stays anchored to the real structure.
function jitterPoints(points, amount) {
  return points.map((p) => ({
    ...p,
    x: Math.min(100, Math.max(0, p.x + (Math.random() - 0.5) * 2 * amount)),
    y: Math.min(100, Math.max(0, p.y + (Math.random() - 0.5) * 2 * amount)),
  }));
}

function nearestPathIndex(path, point) {
  let best = 0, bestDist = Infinity;
  path.forEach((p, i) => {
    const d = Math.hypot(p.x - point.x, p.y - point.y);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}

// "center", "top"/"left", "bottom"/"right", "NN%" -> 0-1 fraction, matching
// CSS object-position semantics.
function parseObjectPosition(pos) {
  const [xTok, yTok = "center"] = pos.split(" ");
  const frac = (tok) => {
    if (tok === "center") return 0.5;
    if (tok === "top" || tok === "left") return 0;
    if (tok === "bottom" || tok === "right") return 1;
    if (tok.endsWith("%")) return parseFloat(tok) / 100;
    return 0.5;
  };
  return { posX: frac(xTok), posY: frac(yTok) };
}

// Mirrors CSS `object-fit: cover` + `object-position`: maps a point given as a
// percentage of the *source image's* own pixel dimensions to a percentage of
// the rendered viewport box. Without this, a coordinate traced from the raw
// photo (e.g. "the tower spine is at x=46%") drifts off the real structure
// the moment the viewport's aspect ratio differs from the image's, which on a
// cover-fit hero background is most of the time.
function mapCoverPoint(xPct, yPct, naturalW, naturalH, boxW, boxH, posX, posY) {
  const scale = Math.max(boxW / naturalW, boxH / naturalH);
  const renderedW = naturalW * scale;
  const renderedH = naturalH * scale;
  const offsetX = (boxW - renderedW) * posX;
  const offsetY = (boxH - renderedH) * posY;
  return {
    x: ((offsetX + (xPct / 100) * renderedW) / boxW) * 100,
    y: ((offsetY + (yPct / 100) * renderedH) / boxH) * 100,
  };
}

function useViewportSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

// Cumulative arc length at each point of a polyline, plus a lookup that maps
// a length-fraction (0-1) back to a {point, tangent} on that polyline. Used to
// place secondary bolts and micro-arcs by *position along the bolt* rather
// than by raw path-point index, so "40% of the way down" means the same thing
// regardless of how many points fractalPath() happened to generate.
function buildArcLengthTable(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  return { pts, cum, total: cum[cum.length - 1] || 1 };
}

function pointAtFraction(table, t) {
  const target = t * table.total;
  let i = 1;
  while (i < table.cum.length - 1 && table.cum[i] < target) i++;
  const a = table.pts[i - 1], b = table.pts[i];
  const segLen = table.cum[i] - table.cum[i - 1] || 1;
  const segT = (target - table.cum[i - 1]) / segLen;
  const x = a.x + (b.x - a.x) * segT, y = a.y + (b.y - a.y) * segT;
  const dx = (b.x - a.x) / segLen, dy = (b.y - a.y) / segLen;
  return { x, y, dx, dy };
}

// One short, randomly-aimed jagged spark anchored at a point on the bolt —
// the "corona discharge" micro-arcs. Full 360° freedom since these are loose
// sparks in the air around the bolt, not structural branches.
function buildMicroArc(anchor) {
  const angle = Math.random() * Math.PI * 2;
  const len = 1.5 + Math.random() * 3;
  const ex = anchor.x + Math.cos(angle) * len;
  const ey = anchor.y + Math.sin(angle) * len;
  return pathD(fractalPath(anchor.x, anchor.y, ex, ey, 2, 0.5));
}

// Builds one strike for `scene`: maps its (already-jittered) structural path
// into on-screen percent space, runs a light fractal pass over each segment
// for jagged texture, then layers on 2 secondary bolts (anchored at the
// scene's real branch junctions nearest 40%/70% along the primary) and a
// handful of random micro-arc sparks. `mobile` drops secondaries entirely and
// caps micro-arcs at 2, per the perf budget for small screens.
function buildStrike(scene, jitteredPath, jitteredBranches, viewport, mobile) {
  const { posX, posY } = parseObjectPosition(scene.pos);
  const toScreen = (p) => mapCoverPoint(p.x, p.y, scene.naturalW, scene.naturalH, viewport.w, viewport.h, posX, posY);
  const screenPts = jitteredPath.map(toScreen);

  let mainPts = [screenPts[0]];
  for (let i = 0; i < screenPts.length - 1; i++) {
    const seg = fractalPath(screenPts[i].x, screenPts[i].y, screenPts[i + 1].x, screenPts[i + 1].y, 3, 0.22);
    mainPts.push(...seg.slice(1));
  }
  const arcTable = buildArcLengthTable(mainPts);

  // Pick the 2 real branch junctions whose position along the path is
  // closest to 40% and 70% of its length — secondary bolts stay anchored to
  // actual photographed structure, same as everything else here.
  const branchFractions = jitteredBranches.map((branch, i) => {
    const idx = nearestPathIndex(scene.path, scene.branches[i]);
    const cumIdx = Math.min(idx, arcTable.cum.length - 1);
    return { branch, fraction: arcTable.cum[cumIdx] / arcTable.total };
  });
  const pickClosest = (target, exclude) =>
    branchFractions
      .filter((b) => b !== exclude)
      .reduce((best, b) => (Math.abs(b.fraction - target) < Math.abs(best.fraction - target) ? b : best), branchFractions[0]);
  const anchor40 = pickClosest(0.4, null);
  const anchor70 = pickClosest(0.7, anchor40);

  const secondaries = mobile
    ? []
    : [anchor40, anchor70].map(({ branch, fraction }) => {
        const at = pointAtFraction(arcTable, fraction);
        const tLen = Math.hypot(at.dx, at.dy) || 1;
        const dx = at.dx / tLen, dy = at.dy / tLen;
        const sign = branch.direction === "left" ? -1 : 1;
        const angle = sign * (30 + Math.random() * 20) * (Math.PI / 180);
        const cos = Math.cos(angle), sin = Math.sin(angle);
        const ndx = dx * cos - dy * sin, ndy = dx * sin + dy * cos;
        const travel = arcTable.total * (0.3 + Math.random() * 0.1); // 30-40% of primary length
        const forkPts = fractalPath(at.x, at.y, at.x + ndx * travel, at.y + ndy * travel, 3, 0.3);
        return pathD(forkPts);
      });

  const microArcCount = mobile ? 2 : 4 + Math.floor(Math.random() * 3); // desktop: 4-6
  const microArcs = Array.from({ length: microArcCount }, () =>
    buildMicroArc(pointAtFraction(arcTable, 0.05 + Math.random() * 0.9))
  );

  return { main: pathD(mainPts), secondaries, microArcs };
}

// Measures the freshly-mounted path's real length and bakes it into a CSS
// custom property + matching dasharray so the `bolt-draw-dash` keyframe (see
// index.css) can animate stroke-dashoffset from "fully hidden" to "fully
// drawn" over an exact 80ms, regardless of how long this particular bolt is.
function applyDashLength(el) {
  if (!el) return;
  const len = el.getTotalLength();
  el.style.setProperty("--bolt-len", String(len));
  el.style.strokeDasharray = String(len);
}

// Renders the active scene's full multi-bolt strike (primary + 2 secondaries
// + 4-6 micro-arcs) and re-strikes every 3-6s with fresh jitter. Remounted
// (via `key`) by SceneBackdrop whenever the active scene changes, so each
// scene always starts its own clean strike cycle.
function LightningStrike({ scene }) {
  const viewport = useViewportSize();
  const mobile = viewport.w < 768;
  const [strikeId, setStrikeId] = useState(0);
  const [basePath, setBasePath] = useState(() => jitterPoints(scene.path, 2));
  const [baseBranches, setBaseBranches] = useState(() => jitterPoints(scene.branches, 2));

  useEffect(() => {
    const timers = [];
    const fire = () => {
      setBasePath(jitterPoints(scene.path, 2));
      setBaseBranches(jitterPoints(scene.branches, 2));
      setStrikeId((id) => id + 1);
      timers.push(setTimeout(fire, 3000 + Math.random() * 3000));
    };
    timers.push(setTimeout(fire, 500 + Math.random() * 800));
    return () => timers.forEach(clearTimeout);
  }, [scene]);

  const bolt = useMemo(
    () => buildStrike(scene, basePath, baseBranches, viewport, mobile),
    [scene, basePath, baseBranches, viewport.w, viewport.h, mobile]
  );

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          "--bolt-glow-tight": BOLT_GLOW_TIGHT, "--bolt-glow-mid": BOLT_GLOW_MID, "--bolt-glow-wide": BOLT_GLOW_WIDE,
        }}
      >
        {bolt.microArcs.map((d, i) => (
          <path
            key={`micro-${strikeId}-${i}`}
            d={d}
            fill="none"
            stroke={BOLT_COLOR}
            strokeOpacity={0.85}
            strokeWidth={0.4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="bolt-micro"
            style={{ animationDelay: `${100 + Math.random() * 100}ms` }}
          />
        ))}
        {bolt.secondaries.map((d, i) => (
          <path
            key={`secondary-${strikeId}-${i}`}
            ref={applyDashLength}
            d={d}
            fill="none"
            stroke={BOLT_COLOR}
            strokeOpacity={0.8}
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="bolt-secondary"
          />
        ))}
        <path
          key={`main-${strikeId}`}
          ref={applyDashLength}
          d={bolt.main}
          fill="none"
          stroke={BOLT_COLOR}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="bolt-glow"
        />
        <path
          key={`core-${strikeId}`}
          ref={applyDashLength}
          d={bolt.main}
          fill="none"
          stroke={BOLT_CORE}
          strokeWidth={0.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="bolt-core"
        />
      </svg>
      <div key={`flash-${strikeId}`} className="bolt-screen-flash" />
      <div key={`brightpulse-${strikeId}`} className="bolt-brightness-pulse" />
    </div>
  );
}

// Idle electrical atmosphere between full strikes, so the hero is never
// "dead": a barely-visible continuous hum along the real structural path, an
// occasional lone spark (1-2/sec), and a slow radial glow pulsing at the
// bolt's origin point. Runs on its own independent timer, unrelated to
// LightningStrike's 3-6s strike cycle.
function AmbientAtmosphere({ scene }) {
  const viewport = useViewportSize();
  const { posX, posY } = parseObjectPosition(scene.pos);
  const toScreen = (p) => mapCoverPoint(p.x, p.y, scene.naturalW, scene.naturalH, viewport.w, viewport.h, posX, posY);

  const screenPts = useMemo(() => scene.path.map(toScreen), [scene, viewport.w, viewport.h]);
  const arcTable = useMemo(() => buildArcLengthTable(screenPts), [screenPts]);
  const origin = screenPts[0];

  const [sparks, setSparks] = useState([]);
  useEffect(() => {
    let nextId = 0;
    const timers = [];
    const spawn = () => {
      const id = nextId++;
      setSparks((s) => [...s, { id, d: buildMicroArc(pointAtFraction(arcTable, 0.1 + Math.random() * 0.8)) }]);
      timers.push(setTimeout(() => setSparks((s) => s.filter((sp) => sp.id !== id)), 120));
      timers.push(setTimeout(spawn, 500 + Math.random() * 500)); // 1-2 sparks/sec
    };
    timers.push(setTimeout(spawn, 300 + Math.random() * 700));
    return () => timers.forEach(clearTimeout);
  }, [scene, arcTable]);

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
      <div
        className="bolt-ambient-glow"
        style={{
          position: "absolute", left: `${origin.x}%`, top: `${origin.y}%`, width: 220, height: 220,
          marginLeft: -110, marginTop: -110,
          background: `radial-gradient(circle, ${BOLT_AMBIENT} 0%, rgba(232,99,26,0) 70%)`,
        }}
      />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path
          d={pathD(screenPts)}
          fill="none"
          stroke={BOLT_COLOR}
          strokeWidth={0.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="bolt-ambient-hum"
        />
        {sparks.map((s) => (
          <path
            key={s.id}
            d={s.d}
            fill="none"
            stroke={BOLT_COLOR}
            strokeOpacity={0.6}
            strokeWidth={0.3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="bolt-ambient-spark"
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Scene Backdrop ─────────────────────────────────────────────────────────────
// Only the hero scene (scene0) is managed here — it carries the geometry-aware
// lightning system. All other sections own their background images directly on
// their container element (set via backgroundImage + dark gradient overlay),
// so no IntersectionObserver or global scene-switching is needed.
const HERO_SCENE = { id: "scene0-hero", src: "/scene0-hero.jpg", naturalW: 841, naturalH: 1870, scrim: "linear-gradient(180deg, rgba(5,8,15,0.15) 0%, rgba(5,8,15,0.72) 100%)", pos: "center center" };
const HERO_SCENE_DATA = { ...HERO_SCENE, ...LIGHTNING_PATHS["scene0-hero"] };

// Mirror bolt: left-side tower face, reflected ~7% left of center spine.
const MIRROR_BOLT_PATH = [
  { x: 43, y: 2 }, { x: 43, y: 10 }, { x: 43, y: 18 },
  { x: 43, y: 24 }, { x: 43, y: 28 }, { x: 43, y: 33 }, { x: 43, y: 40 },
  { x: 43, y: 46 }, { x: 43, y: 53 }, { x: 43, y: 60 }, { x: 44, y: 68 },
  { x: 43, y: 78 }, { x: 43, y: 90 }, { x: 43, y: 98 },
];
const MIRROR_BOLT_BRANCHES = [
  { x: 43, y: 28, direction: "left" },
  { x: 43, y: 40, direction: "right" },
  { x: 43, y: 53, direction: "left" },
];
// Edge micro-bolt paths: outer structural legs of the tower, full height.
const EDGE_LEFT_PATH = [
  { x: 41, y: 2 }, { x: 41, y: 20 }, { x: 41, y: 40 }, { x: 41, y: 60 }, { x: 41, y: 80 }, { x: 41, y: 98 },
];
const EDGE_RIGHT_PATH = [
  { x: 59, y: 2 }, { x: 59, y: 20 }, { x: 59, y: 40 }, { x: 59, y: 60 }, { x: 59, y: 80 }, { x: 59, y: 98 },
];

// Second bolt on the left face of the tower — same glow treatment as the
// primary, fires independently on its own 3–6s timer.
function MirrorBolt({ scene }) {
  const viewport = useViewportSize();
  const mobile = viewport.w < 768;
  const [strikeId, setStrikeId] = useState(0);
  const [basePath, setBasePath] = useState(() => jitterPoints(MIRROR_BOLT_PATH, 2));
  const [baseBranches, setBaseBranches] = useState(() => jitterPoints(MIRROR_BOLT_BRANCHES, 2));

  useEffect(() => {
    const timers = [];
    const fire = () => {
      setBasePath(jitterPoints(MIRROR_BOLT_PATH, 2));
      setBaseBranches(jitterPoints(MIRROR_BOLT_BRANCHES, 2));
      setStrikeId((id) => id + 1);
      timers.push(setTimeout(fire, 3000 + Math.random() * 3000));
    };
    timers.push(setTimeout(fire, 1500 + Math.random() * 2000));
    return () => timers.forEach(clearTimeout);
  }, []);

  const mirrorScene = useMemo(
    () => ({ ...scene, path: MIRROR_BOLT_PATH, branches: MIRROR_BOLT_BRANCHES }),
    [scene]
  );
  const bolt = useMemo(
    () => buildStrike(mirrorScene, basePath, baseBranches, viewport, mobile),
    [mirrorScene, basePath, baseBranches, viewport.w, viewport.h, mobile]
  );

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", "--bolt-glow-tight": BOLT_GLOW_TIGHT, "--bolt-glow-mid": BOLT_GLOW_MID, "--bolt-glow-wide": BOLT_GLOW_WIDE }}>
        {bolt.microArcs.map((d, i) => (
          <path key={`mb-micro-${strikeId}-${i}`} d={d} fill="none" stroke={BOLT_COLOR} strokeOpacity={0.85}
            strokeWidth={0.4} strokeLinecap="round" vectorEffect="non-scaling-stroke" className="bolt-micro"
            style={{ animationDelay: `${100 + Math.random() * 100}ms` }} />
        ))}
        {bolt.secondaries.map((d, i) => (
          <path key={`mb-sec-${strikeId}-${i}`} ref={applyDashLength} d={d} fill="none" stroke={BOLT_COLOR}
            strokeOpacity={0.8} strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round"
            vectorEffect="non-scaling-stroke" className="bolt-secondary" />
        ))}
        <path key={`mb-main-${strikeId}`} ref={applyDashLength} d={bolt.main} fill="none"
          stroke={BOLT_COLOR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
          vectorEffect="non-scaling-stroke" className="bolt-glow" />
        <path key={`mb-core-${strikeId}`} ref={applyDashLength} d={bolt.main} fill="none"
          stroke={BOLT_CORE} strokeWidth={0.4} strokeLinecap="round" strokeLinejoin="round"
          vectorEffect="non-scaling-stroke" className="bolt-core" />
      </svg>
    </div>
  );
}

// Single vertical micro-bolt along one structural edge, 0.8px stroke, fires every 2–4s.
function EdgeMicrobolt({ rawPath, intervalMin, intervalMax }) {
  const viewport = useViewportSize();
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const [strikeId, setStrikeId] = useState(null);
  const [screenPath, setScreenPath] = useState(null);

  useEffect(() => {
    const { posX, posY } = parseObjectPosition(HERO_SCENE_DATA.pos);
    const timers = [];
    const fire = () => {
      const vp = viewportRef.current;
      const jittered = jitterPoints(rawPath, 1.2);
      let mainPts = [];
      for (let i = 0; i < jittered.length - 1; i++) {
        const a = mapCoverPoint(jittered[i].x, jittered[i].y, HERO_SCENE_DATA.naturalW, HERO_SCENE_DATA.naturalH, vp.w, vp.h, posX, posY);
        const b = mapCoverPoint(jittered[i + 1].x, jittered[i + 1].y, HERO_SCENE_DATA.naturalW, HERO_SCENE_DATA.naturalH, vp.w, vp.h, posX, posY);
        const seg = fractalPath(a.x, a.y, b.x, b.y, 3, 0.16);
        if (i === 0) mainPts.push(...seg); else mainPts.push(...seg.slice(1));
      }
      setScreenPath(pathD(mainPts));
      setStrikeId((id) => (id ?? 0) + 1);
      timers.push(setTimeout(fire, intervalMin + Math.random() * (intervalMax - intervalMin)));
    };
    timers.push(setTimeout(fire, Math.random() * 3000));
    return () => timers.forEach(clearTimeout);
  }, [rawPath, intervalMin, intervalMax]);

  if (strikeId === null || !screenPath) return null;
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", "--bolt-glow-tight": BOLT_GLOW_TIGHT, "--bolt-glow-mid": BOLT_GLOW_MID, "--bolt-glow-wide": BOLT_GLOW_WIDE }}>
        <path key={`edge-${strikeId}`} ref={applyDashLength} d={screenPath} fill="none"
          stroke={BOLT_COLOR} strokeOpacity={0.7} strokeWidth={0.8} strokeLinecap="round"
          strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="bolt-edge-micro" />
      </svg>
    </div>
  );
}

// Horizontal arc simulating current discharge along the overhead cable run,
// 0.6px stroke, fires every 7–12s left-to-right across the upper third.
function HorizontalArc() {
  const [strikeId, setStrikeId] = useState(null);
  const [arcPath, setArcPath] = useState(null);

  useEffect(() => {
    const timers = [];
    const fire = () => {
      const y = 25 + Math.random() * 4;
      const pts = fractalPath(0, y, 100, y + (Math.random() - 0.5) * 2, 4, 0.1);
      setArcPath(pathD(pts));
      setStrikeId((id) => (id ?? 0) + 1);
      timers.push(setTimeout(fire, 7000 + Math.random() * 5000));
    };
    timers.push(setTimeout(fire, 3000 + Math.random() * 6000));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (strikeId === null || !arcPath) return null;
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", "--bolt-glow-tight": BOLT_GLOW_TIGHT, "--bolt-glow-mid": BOLT_GLOW_MID, "--bolt-glow-wide": BOLT_GLOW_WIDE }}>
        <path key={`harc-${strikeId}`} ref={applyDashLength} d={arcPath} fill="none"
          stroke={BOLT_COLOR} strokeOpacity={0.65} strokeWidth={0.6} strokeLinecap="round"
          strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="bolt-horiz-arc" />
      </svg>
    </div>
  );
}

function SceneBackdrop() {
  return (
    <>
      <div className="scene-layer scene-active" aria-hidden="true">
        <img
          src={HERO_SCENE_DATA.src}
          alt=""
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: HERO_SCENE_DATA.pos,
          }}
          loading="eager"
        />
      </div>
      <div className="scene-scrim" style={{ background: HERO_SCENE_DATA.scrim }} />
      <AmbientAtmosphere scene={HERO_SCENE_DATA} />
      <LightningStrike scene={HERO_SCENE_DATA} />
      <MirrorBolt scene={HERO_SCENE_DATA} />
      <EdgeMicrobolt rawPath={EDGE_LEFT_PATH} intervalMin={2000} intervalMax={4000} />
      <EdgeMicrobolt rawPath={EDGE_RIGHT_PATH} intervalMin={2000} intervalMax={4000} />
      <HorizontalArc />
    </>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "About", href: "#about" },
    { label: "Divisions", href: "#divisions" },
    { label: "Products", href: "#products" },
    { label: "Solutions", href: "/solutions", isRoute: true },
    { label: "Resources", href: "/blog", isRoute: true },
    { label: "Catalogue", href: "/catalogue/", isRoute: false },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Contact", href: "#rfq" },
  ];

  return (
    <>
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(8,14,22,0.94)" : "rgba(8,14,22,0.32)",
        backdropFilter: scrolled ? "blur(20px)" : "blur(10px)",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "blur(10px)",
        borderBottom: scrolled ? "1px solid rgba(44,82,130,0.2)" : "1px solid rgba(44,82,130,0.08)",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "14px" }}>
          <img src="/durbolt-d-mark.png" alt="Durbolt D" style={{ height: "26px", width: "auto", display: "block", flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "block", width: "18px", height: "1.5px", background: "#E8631A", flexShrink: 0 }} />
            <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.15rem", letterSpacing: "0.12em", lineHeight: 1, color: "#FFFFFF", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility" }}>
              DURBOLT <span style={{ color: "#E8631A" }}>POWER</span>
            </span>
            <span style={{ display: "block", width: "18px", height: "1.5px", background: "#E8631A", flexShrink: 0 }} />
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) =>
            l.isRoute ? (
              <Link
                key={l.href}
                to={l.href}
                className="text-xs font-semibold transition-colors duration-200 uppercase"
                style={{ color: "#E0E0E0", letterSpacing: "0.16em", textDecoration: "none" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-xs font-semibold transition-colors duration-200 uppercase"
                style={{ color: "#E0E0E0", letterSpacing: "0.16em" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
              >
                {l.label}
              </a>
            )
          )}
          <a
            href="#rfq"
            className="px-5 py-2 text-xs font-bold uppercase transition-all duration-200"
            style={{
              background: BRAND,
              color: "#fff",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              letterSpacing: "0.16em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
          >
            Request Quote
          </a>
        </div>

        <button className="md:hidden" style={{ color: "#fff" }} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

    </header>
    <AnimatePresence>
      {mobileOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "transparent" }}
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100dvh",
              width: "82%",
              maxWidth: 340,
              background: "rgba(8,14,22,0.98)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(232,99,26,0.2)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="px-6 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(232,99,26,0.15)" }}>
              <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "14px" }} onClick={() => setMobileOpen(false)}>
                <span style={{ display: "block", width: "18px", height: "1.5px", background: "#E8631A", flexShrink: 0 }} />
                <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.15rem", letterSpacing: "0.12em", lineHeight: 1, color: "#FFFFFF", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility" }}>
                  DURBOLT <span style={{ color: "#E8631A" }}>POWER</span>
                </span>
                <span style={{ display: "block", width: "18px", height: "1.5px", background: "#E8631A", flexShrink: 0 }} />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{ background: "none", border: "none", color: "#fff", fontSize: "24px", lineHeight: 1, padding: 0, cursor: "pointer", flexShrink: 0 }}
              >
                ×
              </button>
            </div>
            <div className="px-6 pt-8 flex flex-col gap-6 flex-1">
              {links.map((l) =>
                l.isRoute ? (
                  <Link
                    key={l.href}
                    to={l.href}
                    className="text-sm font-bold uppercase"
                    style={{ color: "#E0E0E0", letterSpacing: "0.16em", textDecoration: "none" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a key={l.href} href={l.href}
                    className="text-sm font-bold uppercase"
                    style={{ color: "#E0E0E0", letterSpacing: "0.16em" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </a>
                )
              )}
            </div>
            <div className="p-6">
              <a href="#rfq"
                className="block py-3 text-xs font-bold uppercase text-center"
                style={{ background: BRAND, color: "#fff", letterSpacing: "0.16em" }}
                onClick={() => setMobileOpen(false)}
              >
                Request a Quote
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}

// ─── Hero (Ken Burns redesign) ────────────────────────────────────────────────
function Hero() {
  return (
    <section
      id="hero"
      style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "flex-end", overflow: "hidden" }}
    >
      {/* Ken Burns background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <img
          src="/scene3-ground.jpg"
          alt=""
          className="hero-ken"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", transformOrigin: "center center", display: "block" }}
          loading="eager"
        />
      </div>

      {/* Gradient overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(108deg, rgba(5,8,15,0.90) 0%, rgba(5,8,15,0.72) 48%, rgba(5,8,15,0.38) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,8,15,0.1) 0%, transparent 38%, rgba(5,8,15,0.88) 100%)" }} />
      <div className="grain-overlay" aria-hidden="true" />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "0 24px 96px", width: "100%" }}>
        <div style={{ maxWidth: 680 }}>

          <p
            className="hero-enter-0"
            style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND, marginBottom: 20 }}
          >
            Critical Power Infrastructure
          </p>

          <h1
            className="hero-enter-1"
            style={{ fontFamily: HEADING, fontSize: "clamp(2.8rem,6vw,5.2rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.0, color: "#fff", marginBottom: 28, textShadow: "0 4px 32px rgba(0,0,0,0.65)" }}
          >
            Critical Power,<br />
            <span style={{ color: BRAND }}>Engineered to Spec.</span>
          </h1>

          <p
            className="hero-enter-2"
            style={{ fontSize: 16, lineHeight: 1.75, color: "#B8B8B8", maxWidth: 500, marginBottom: 44 }}
          >
            B2B critical power infrastructure — engineered, sourced, and delivered. Direct pricing. Global reach. 44 product lines.
          </p>

          <div className="hero-enter-3" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <MagneticCTA href="#rfq">Request a Quote</MagneticCTA>

            <a
              href="#products"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 28px", color: "#C8C8C8", border: "1px solid rgba(44,82,130,0.45)", fontFamily: HEADING, fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(232,99,26,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#C8C8C8"; e.currentTarget.style.borderColor = "rgba(44,82,130,0.45)"; }}
            >
              Browse Products
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── KPI / Stats strip (scroll-triggered count-up) ────────────────────────────
// 20+ confirmed (est. 2006). 500+/50+/$100M+ — verify before final launch.
const KPI_DATA = [
  { end: 20,  suffix: "+",  prefix: "",  label: "Years of Experience" },
  { end: 500, suffix: "+",  prefix: "",  label: "Projects Delivered" },
  { end: 50,  suffix: "+",  prefix: "",  label: "Countries Served"   },
  { end: 100, suffix: "M+", prefix: "$", label: "Sourced to Date"    },
];

function StatsBar() {
  return (
    <div
      id="stats"
      style={{
        position: "relative",
        zIndex: 2,
        background: "linear-gradient(rgba(10,10,10,0.88), rgba(10,10,10,0.88)), url('/scene1-aerial.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderTop: "1px solid rgba(232,99,26,0.2)",
        borderBottom: "1px solid rgba(232,99,26,0.18)",
        padding: "72px 24px",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="kpi-grid">
          {KPI_DATA.map((kpi, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "clamp(2.4rem,4.5vw,3.2rem)", color: "#fff", lineHeight: 1, marginBottom: 10, textShadow: "0 0 40px rgba(232,99,26,0.12)" }}>
                <ScrollCounter end={kpi.end} suffix={kpi.suffix} prefix={kpi.prefix} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: BRAND }}>
                {kpi.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stats Ticker ─────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "44 Product Lines",
  "4 Divisions",
  "50+ Countries Supplied",
  "24hr Quote Turnaround",
  "B2B Direct Pricing",
  "Engineered to Specification",
  "Private Label Ready",
  "Global Freight Management",
  "IEC / UL / ANSI Certified",
  "Tier-1 Manufacturer Network",
];

function StatsTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      className="overflow-hidden py-4"
      style={{
        position: "relative", zIndex: 2,
        background: "rgba(15,15,15,0.82)",
        borderTop: "1px solid rgba(232,99,26,0.25)",
        borderBottom: "1px solid rgba(232,99,26,0.25)",
      }}
    >
      <motion.div
        className="relative z-10 flex gap-0 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-8">
            <span
              className="text-xs font-semibold uppercase"
              style={{ color: "#E0E0E0", letterSpacing: "0.16em", fontFamily: MONO }}
            >
              {item}
            </span>
            <span style={{ color: "#E8631A", opacity: 0.9, fontSize: "6px" }}>◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  const cards = [
    {
      icon: Shield,
      title: "Engineered to Specification",
      body: "Every Durbolt Power product is manufactured to our own design standards. We control the spec, the quality, and the certification — products carry the Durbolt name because they're built to it.",
    },
    {
      icon: Globe,
      title: "Global Supply Chain",
      body: "Sourced from vetted tier-1 manufacturers across 12+ countries, coordinated from our U.S. operations. Full documentation, factory audits, and QC inspection on every order.",
    },
    {
      icon: Building2,
      title: "B2B Only",
      body: "We serve qualified business buyers exclusively — facility operators, electrical contractors, data center developers, and infrastructure integrators. Direct pricing, no distributor markup.",
    },
    {
      icon: Cpu,
      title: "Built to Our Specification",
      body: "Every Durbolt Power product is engineered and manufactured to our own design standards. We control the spec, the quality, and the certification — products carry the Durbolt name because they're built to it.",
    },
  ];

  return (
    <section id="about" className="py-28 px-6 overflow-hidden" style={{ position: "relative", zIndex: 2, background: "linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/scene1-aerial.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <OrangeLine />
      <div className="max-w-7xl mx-auto pt-16">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <FadeIn>
            <SectionLabel>ABOUT DURBOLT POWER</SectionLabel>
            <h2
              className="font-black leading-none mb-8"
              style={{ fontFamily: HEADING, fontSize: "clamp(2.4rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              Built for the demands of<br />
              <span style={{ color: "#E8631A" }}>critical infrastructure.</span>
            </h2>
            <p className="readable-text mb-4" style={{ color: "#C8C8C8" }}>
              Durbolt Power is a U.S.-based critical power and connectivity infrastructure brand. We engineer, source, and deliver the infrastructure modern facilities run on — from industrial generator sets and medium voltage switchgear to fiber optic cable and precision cooling.
            </p>
            <p className="readable-text mb-10" style={{ color: "#C8C8C8" }}>
              We operate on a direct-pricing model, working exclusively with qualified B2B buyers. No retail. No guesswork. Spec-grade equipment at scale, bearing the Durbolt name because it's built to Durbolt specification.
            </p>
            <a
              href="#rfq"
              className="inline-flex items-center gap-3 px-7 py-3.5 font-bold text-sm uppercase transition-all duration-200"
              style={{ background: "#E8631A", color: "#fff", clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)", letterSpacing: "0.16em" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#CC5816")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#E8631A")}
            >
              Get in Contact <ArrowRight size={14} />
            </a>
          </FadeIn>

          <div className="grid grid-cols-2 gap-4">
            {cards.map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.08}>
                <div
                  className="glow-card p-6 h-full"
                  style={{
                    background: "rgba(8,8,8,0.92)",
                    border: "1px solid rgba(232,99,26,0.25)",
                  }}
                >
                  <c.icon size={20} className="mb-4" style={{ color: "#E8631A" }} />
                  <h3 className="text-sm font-black mb-2" style={{ fontFamily: HEADING, fontWeight: 800 }}>
                    {c.title}
                  </h3>
                  <p className="readable-text" style={{ color: "#C8C8C8" }}>{c.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Supply Model (sourcing & fulfillment disclosure) ─────────────────────────
const SUPPLY_CARDS = [
  {
    label: "GLOBAL MANUFACTURING NETWORK",
    body: "Durbolt Power products are engineered to our exact specifications through a vetted network of certified production facilities spanning Asia and the Middle East. Depending on the product line and project requirements, orders may be fulfilled from our facilities in the region best positioned to meet your specifications, lead time, and certification requirements.",
    icon: GitBranch,
  },
  {
    label: "DIRECT TO SITE FULFILLMENT",
    body: "We operate on a factory-direct fulfillment model. Where inventory is available in our US or UAE warehouse facilities, orders ship domestically. For made-to-specification or high-volume orders, products are fulfilled directly from our certified production facilities via DDP (Delivered Duty Paid) — fully landed at your project site, duties and logistics managed by our global operations team. No middlemen. No markups.",
    icon: Globe,
  },
  {
    label: "EXPANDING GLOBAL INFRASTRUCTURE",
    body: "Durbolt Power maintains an active operational presence across North America, the Middle East, and Asia. We are continuously expanding our warehouse and distribution footprint in the United States to support faster domestic fulfillment. Our goal is simple: every order delivered at the highest quality standard, regardless of where it originates. Our clients don't manage supply chains — we do.",
    icon: MapPin,
  },
];

function SupplyModel() {
  return (
    <section
      id="supply-model"
      className="py-28 px-6"
      style={{
        position: "relative",
        zIndex: 2,
        background: "linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/scene1-aerial.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <OrangeLine />
      <div className="max-w-7xl mx-auto pt-16">
        <FadeIn className="mb-16">
          <SectionLabel>OUR SUPPLY MODEL</SectionLabel>
          <h2
            className="font-black leading-none"
            style={{
              fontFamily: HEADING,
              fontSize: "clamp(2.4rem,5vw,4rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Factory-direct, delivered<br />
            <span style={{ color: BRAND }}>to your site.</span>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {SUPPLY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <FadeIn key={card.label}>
                <div
                  className="glow-card flex flex-col gap-5 p-8 h-full"
                  style={{
                    background: "rgba(8,8,8,0.92)",
                    border: "1px solid rgba(232,99,26,0.25)",
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(232,99,26,0.08)",
                      border: "1px solid rgba(232,99,26,0.2)",
                    }}
                  >
                    <Icon size={18} style={{ color: BRAND }} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold uppercase mb-3"
                      style={{ color: BRAND, letterSpacing: "0.2em", fontFamily: MONO }}
                    >
                      {card.label}
                    </p>
                    <p className="readable-text" style={{ color: "#C8C8C8" }}>
                      {card.body}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Divisions ────────────────────────────────────────────────────────────────
function Divisions() {
  const [hoveredId, setHoveredId] = useState(null);
  return (
    <section id="divisions" className="py-28 px-6" style={{ position: "relative", zIndex: 2, background: "linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/scene2-tower-storm.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <OrangeLine />
      <div className="max-w-7xl mx-auto pt-16">
        <FadeIn className="mb-16">
          <SectionLabel>FOUR DIVISIONS</SectionLabel>
          <h2
            className="font-black leading-none"
            style={{ fontFamily: HEADING, fontSize: "clamp(2.4rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Every layer of your power<br />infrastructure.{" "}
            <span style={{ color: "#E8631A" }}>One brand.</span>
          </h2>
        </FadeIn>

        <div className="flex flex-col gap-6">
          {DIVISIONS.map((div, i) => {
            const Icon = ICON_MAP[div.iconName];
            const heroImage = div.products[0]?.imageUrl;
            const isHovered = hoveredId === div.id;
            return (
              <FadeIn key={div.id} delay={i * 0.1}>
                <div
                  className="glow-card relative overflow-hidden p-8 md:p-12"
                  style={{
                    background: "rgba(8,8,8,0.92)",
                    border: "1px solid rgba(232,99,26,0.25)",
                    borderLeft: `4px solid ${div.accentFrom}`,
                    boxShadow: `inset 8px 0 30px -14px ${div.accentFrom}`,
                  }}
                  onMouseEnter={() => setHoveredId(div.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Full-bleed background product photo */}
                  {heroImage && (
                    <img
                      src={heroImage}
                      alt=""
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Dark overlay — lightens slightly on hover */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: isHovered ? "rgba(8,14,22,0.60)" : "rgba(8,14,22,0.75)",
                      transition: "background 300ms ease",
                      zIndex: 1,
                    }}
                  />

                  {/* Background watermark number */}
                  <span
                    aria-hidden="true"
                    className="absolute -right-4 -bottom-12 font-black select-none pointer-events-none"
                    style={{
                      fontFamily: HEADING,
                      fontSize: "clamp(8rem, 18vw, 13rem)",
                      lineHeight: 1,
                      color: div.accentFrom,
                      opacity: 0.08,
                      zIndex: 2,
                    }}
                  >
                    {div.id.toString().padStart(2, "0")}
                  </span>

                  {/* Product count badge */}
                  <div
                    className="absolute top-5 right-5 px-3 py-1 text-xs font-semibold"
                    style={{
                      fontFamily: MONO,
                      background: "rgba(10,10,10,0.85)",
                      color: div.accentFrom,
                      border: `1px solid ${div.accentFrom}44`,
                      letterSpacing: "0.16em",
                      zIndex: 2,
                    }}
                  >
                    {div.products.length} PRODUCTS
                  </div>

                  <div className="relative max-w-2xl" style={{ zIndex: 2 }}>
                    <div className="text-xs font-semibold mb-6 flex items-center gap-3" style={{ color: div.accentFrom, fontFamily: MONO, letterSpacing: "0.2em" }}>
                      <Icon size={14} />
                      <span>DIV. {div.id.toString().padStart(2, "0")}</span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black mb-2" style={{ fontFamily: HEADING, fontWeight: 800, lineHeight: 1.15 }}>
                      {div.name}
                    </h3>
                    <p className="text-sm font-bold mb-5 italic" style={{ color: div.accentFrom, opacity: 1 }}>{div.tagline}</p>
                    <p className="readable-text mb-8" style={{ color: "#C8C8C8" }}>{div.description}</p>

                    <a
                      href={`#division-${div.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase"
                      style={{ color: div.accentFrom, letterSpacing: "0.16em" }}
                    >
                      VIEW PRODUCTS <ArrowRight size={11} />
                    </a>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Product Card (grid) ──────────────────────────────────────────────────────
function ProductCard({ product, division }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Link to={`/products/${toSlug(product.name)}`} style={{ textDecoration: "none", display: "block" }}>
    <div
      className="product-card glow-card flex flex-col"
      style={{ background: "rgba(8,8,8,0.92)", border: "1px solid rgba(232,99,26,0.25)", minHeight: 360 }}
    >
      {/* Image — fixed height, decoupled from total card height so wrapped
          titles below can grow the card instead of getting clipped */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: 216, background: product.contain ? "#0a0a0a" : "#080F1A" }}>
        {!loaded && !error && <div className="absolute inset-0 img-shimmer" />}
        {!error ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`product-card-img w-full h-full ${product.contain ? "object-contain" : "object-cover"}`}
            style={{ padding: product.contain ? "8px" : undefined }}
          />
        ) : (
          <div className="w-full h-full relative overflow-hidden" style={{
            background: "linear-gradient(135deg, #0D1520 0%, #111B2B 100%)",
          }}>
            {/* Orange grid texture */}
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(232,99,26,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(232,99,26,0.07) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div style={{ width: 32, height: 32, border: `1px solid ${division.accentFrom}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 10, height: 10, background: division.accentFrom, opacity: 0.4 }} />
              </div>
            </div>
          </div>
        )}
        {/* Division tag */}
        <div className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold uppercase"
          style={{ fontFamily: MONO, background: "rgba(10,10,10,0.85)", color: division.accentFrom, letterSpacing: "0.16em", border: `1px solid ${division.accentFrom}44` }}>
          DIV. {division.id.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="product-card-title text-sm font-black mb-0.5 leading-tight" style={{ fontFamily: HEADING, fontWeight: 800 }}>
          {product.name}
        </h4>
        {product.sku && (
          <p style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#444", letterSpacing: "0.14em", marginBottom: "4px" }}>
            {product.sku}
          </p>
        )}
        <p className="product-card-spec readable-text mb-2" style={{ color: "#C8C8C8" }}>{product.spec}</p>
        <p className="flex-1 mb-3" style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#555", fontStyle: "italic", letterSpacing: "0.03em", lineHeight: 1.45 }}>
          Unit configuration, color, and finish may vary depending on project requirements and specifications.
        </p>
        <a
          href="#rfq"
          className="inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase transition-all duration-200"
          style={{ border: `1px solid ${division.accentFrom}44`, color: division.accentFrom, letterSpacing: "0.16em" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = division.accentFrom; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = division.accentFrom; }}
        >
          Request Quote <ArrowRight size={11} />
        </a>
      </div>

      {/* Circuit trace border — pure CSS transitions, draws in from corners
          to midpoints on hover, holds, retracts on leave. No JS toggling. */}
      <div className="card-circuit-trace" aria-hidden="true">
        <span className="cct cct-top-left" />
        <span className="cct cct-top-right" />
        <span className="cct cct-right-top" />
        <span className="cct cct-right-bottom" />
        <span className="cct cct-bottom-right" />
        <span className="cct cct-bottom-left" />
        <span className="cct cct-left-bottom" />
        <span className="cct cct-left-top" />
      </div>
    </div>
    </Link>
  );
}

// ─── Products ─────────────────────────────────────────────────────────────────
function Products() {
  return (
    <section id="products" style={{ position: "relative", zIndex: 2, background: "linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/scene3-ground.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <div className="pt-28 px-6">
        <OrangeLine />
        <div className="max-w-7xl mx-auto pt-16 pb-4">
          <FadeIn>
            <SectionLabel>44 PRODUCT LINES</SectionLabel>
            <h2 className="font-black leading-none" style={{ fontFamily: HEADING, fontSize: "clamp(2.4rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              The full stack.<br />
              <span style={{ color: "#E8631A" }}>Spec to delivery.</span>
            </h2>
          </FadeIn>
        </div>
      </div>

      {DIVISIONS.map((div, divIdx) => {
        const Icon = ICON_MAP[div.iconName];
        return (
          <div key={div.id} id={`division-${div.id}`} className={divIdx > 0 ? "mt-16" : "mt-12"}>
            {/* Division header — optional per-division background image */}
            <div
              className="relative overflow-hidden py-10 px-6"
              style={{
                minHeight: 140,
                ...(div.headerBg ? {
                  backgroundImage: `url('${div.headerBg}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                } : {}),
              }}
            >
              <div className="absolute inset-0" style={{
                background: `linear-gradient(90deg, rgba(10,10,10,0.92) 30%, rgba(10,10,10,0.65) 70%, rgba(10,10,10,0.85) 100%)`,
              }} />
              <div className="absolute inset-y-0 left-0 w-1" style={{ background: div.accentFrom, boxShadow: `0 0 16px ${div.accentFrom}` }} />
              <FadeIn className="relative z-10 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={14} style={{ color: div.accentFrom }} />
                  <span className="text-xs font-semibold uppercase" style={{ color: div.accentFrom, letterSpacing: "0.2em", fontFamily: MONO }}>
                    Division {div.id.toString().padStart(2, "0")}
                  </span>
                </div>
                <Link to={`/divisions/${toSlug(div.name)}`} style={{ textDecoration: "none" }}>
                  <h3 className="text-2xl font-black mb-1" style={{ fontFamily: HEADING, fontWeight: 800, letterSpacing: "-0.01em" }}>
                    {div.name}
                  </h3>
                </Link>
                <p className="readable-text max-w-lg" style={{ color: "#C8C8C8" }}>{div.tagline} — {div.description.split("—")[0].trim()}</p>
              </FadeIn>
            </div>

            {/* Horizontal scroll */}
            <div
              className="overflow-x-auto pb-6 pt-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#1E3A5F #080F1A" }}
            >
              <div className="flex gap-4 px-6" style={{ width: "max-content", minWidth: "100%" }}>
                {div.products.map((product) => (
                  <div key={product.name} style={{ width: 260, flexShrink: 0 }}>
                    <ProductCard product={product} division={div} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mx-6"><OrangeLine /></div>
          </div>
        );
      })}
      <div className="pb-16" />
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "SPECIFY",
      icon: Cpu,
      body: "Submit your technical requirements — voltage class, capacity, site conditions, delivery timeline, and certification needs. Our team asks the right questions.",
    },
    {
      num: "02",
      title: "SOURCE",
      icon: Globe,
      body: "We engage our manufacturer network directly. No distributors, no markups. Factory-direct quotes return within 48 hours with full technical datasheets.",
    },
    {
      num: "03",
      title: "BRAND",
      icon: Shield,
      body: "Products are manufactured and certified to Durbolt Power specification. Your equipment is inspected, labeled, and documented before it leaves the factory.",
    },
    {
      num: "04",
      title: "DELIVER",
      icon: TrendingUp,
      body: "Shipped DDP, FOB, or CIF — your terms. Full freight management, customs documentation, port-to-site coordination, and real-time delivery tracking.",
    },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6" style={{ position: "relative", zIndex: 2, background: "linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/scene4-control.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <OrangeLine />
      <div className="max-w-7xl mx-auto pt-16">
        <FadeIn className="mb-20">
          <SectionLabel>HOW IT WORKS</SectionLabel>
          <h2 className="font-black leading-none" style={{ fontFamily: HEADING, fontSize: "clamp(2.4rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Four steps from<br />
            <span style={{ color: "#E8631A" }}>requirement to delivery.</span>
          </h2>
        </FadeIn>

        {/* Connecting line — animates once on mount, no scroll gating */}
        <div className="relative mb-10 hidden md:block" style={{ height: "2px" }}>
          <div className="absolute inset-0" style={{ background: "rgba(44,82,130,0.15)" }} />
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{ background: "linear-gradient(90deg, #E8631A, #CC5816)", boxShadow: "0 0 12px rgba(232,99,26,0.6)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="step-card glow-card p-7 h-full"
              style={{ background: "rgba(8,8,8,0.92)", border: "1px solid rgba(232,99,26,0.25)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <span
                  className="text-4xl"
                  style={{ fontFamily: MONO, color: "#E8631A", fontWeight: 600, lineHeight: 1 }}
                >
                  {step.num}
                </span>
                <step.icon size={18} style={{ color: "#E8631A" }} />
              </div>
              <h3
                className="text-base font-black mb-4"
                style={{ fontFamily: HEADING, fontWeight: 800, letterSpacing: "0.16em", color: "#E8631A" }}
              >
                {step.title}
              </h3>
              <p className="readable-text" style={{ color: "#C8C8C8" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why Durbolt (bento grid) ──────────────────────────────────────────────────
function WhyDurbolt() {
  const features = [
    { icon: TrendingUp, title: "DIRECT PRICING", body: "No markups. No layers. Durbolt pricing goes straight from manufacturing cost to your PO — that's how we deliver 20–35% below what the market charges.", big: true },
    { icon: MapPin, title: "AMERICAN STANDARD", body: "U.S. operations. U.S. business terms. Built to the specifications American buyers expect." },
    { icon: Shield, title: "ENGINEERED TO SPEC", body: "All 44 product lines manufactured to Durbolt Power specification. IEC, UL, and ANSI certification on every product line." },
    { icon: Globe, title: "GLOBAL REACH", body: "Products delivered to 50+ countries. We handle freight, customs documentation, and logistics — DDP, FOB, or CIF, your choice." },
  ];

  return (
    <section id="why" className="py-28 px-6" style={{ position: "relative", zIndex: 2, background: "linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/scene4-control.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <OrangeLine />
      <div className="max-w-7xl mx-auto pt-16">
        <FadeIn className="mb-16">
          <SectionLabel>WHY DURBOLT POWER</SectionLabel>
          <h2 className="font-black leading-none" style={{ fontFamily: HEADING, fontSize: "clamp(2.4rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            The infrastructure buyer's<br />
            <span style={{ color: "#E8631A" }}>unfair advantage.</span>
          </h2>
        </FadeIn>

        <div className="bento-grid">
          {features.map((feat, i) => (
            <FadeIn key={feat.title} delay={i * 0.08} className="h-full">
              <div
                className={`glow-card h-full flex flex-col ${feat.big ? "p-9 md:p-11 justify-center" : "p-7"}`}
                style={{ background: "rgba(8,8,8,0.92)", border: "1px solid rgba(232,99,26,0.25)" }}
              >
                <div className="flex items-center justify-center mb-6"
                  style={{ width: feat.big ? 52 : 40, height: feat.big ? 52 : 40, background: "rgba(232,99,26,0.08)", border: "1px solid rgba(232,99,26,0.2)" }}>
                  <feat.icon size={feat.big ? 26 : 18} style={{ color: "#E8631A" }} />
                </div>
                <h3 className={feat.big ? "text-2xl font-black mb-4" : "text-xs font-black mb-4"}
                  style={{ fontFamily: HEADING, fontWeight: 800, letterSpacing: feat.big ? "-0.01em" : "0.16em", color: "#fff" }}>
                  {feat.title}
                </h3>
                <p className={feat.big ? "readable-text max-w-md" : "readable-text"} style={{ color: "#C8C8C8" }}>{feat.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Blog Teaser ──────────────────────────────────────────────────────────────
function BlogTeaser() {
  const latest = ARTICLES.slice(0, 3);
  if (latest.length === 0) return null;
  return (
    <section className="py-24 px-6" style={{ position: "relative", zIndex: 2, background: "rgba(5,8,15,0.98)", borderTop: "1px solid rgba(232,99,26,0.1)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: BRAND, letterSpacing: "0.22em", fontFamily: MONO }}>
              FROM THE POWER INTELLIGENCE HUB
            </p>
            <h2 className="font-black leading-none" style={{ fontFamily: HEADING, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
              Technical Insights
            </h2>
          </div>
          <Link
            to="/blog"
            className="text-xs font-bold uppercase shrink-0"
            style={{ color: BRAND, letterSpacing: "0.18em", textDecoration: "none", fontFamily: MONO }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            ALL ARTICLES →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latest.map((article) => (
            <Link key={article.slug} to={`/blog/${article.slug}`} style={{ textDecoration: "none" }}>
              <div
                className="h-full flex flex-col"
                style={{ background: "rgba(8,8,8,0.92)", border: "1px solid rgba(232,99,26,0.2)", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(232,99,26,0.55)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(232,99,26,0.07)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(232,99,26,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ height: 72, background: "#0d0d0d", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(232,99,26,0.1)" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: "9px", fontWeight: 700, color: BRAND, letterSpacing: "0.35em", textTransform: "uppercase" }}>
                    {article.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span style={{ background: "rgba(232,99,26,0.12)", border: "1px solid rgba(232,99,26,0.35)", color: BRAND, fontFamily: MONO, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", padding: "2px 7px", textTransform: "uppercase", display: "inline-block", marginBottom: 10 }}>
                    {article.category}
                  </span>
                  <h3 className="font-black leading-tight flex-1" style={{ fontFamily: HEADING, fontSize: "0.95rem", color: "#fff", lineHeight: 1.35, marginBottom: 12 }}>
                    {article.title}
                  </h3>
                  <span style={{ color: BRAND, fontFamily: MONO, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em" }}>
                    READ {article.readTime} MIN →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Government Note ──────────────────────────────────────────────────────────
function GovNote() {
  return (
    <section className="px-6 pb-20" style={{ position: "relative", zIndex: 2, background: "linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/scene4-control.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="glow-border-wrap">
            <div
              className="glow-border-inner glow-card flex items-start gap-5 p-7"
              style={{ background: "rgba(8,8,8,0.92)", border: "1px solid rgba(232,99,26,0.25)" }}
            >
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(232,99,26,0.08)", border: "1px solid rgba(232,99,26,0.2)" }}>
                <Building2 size={18} style={{ color: "#E8631A" }} />
              </div>
              <div>
                <h4 className="text-sm font-black mb-2 tracking-wide" style={{ fontFamily: HEADING, fontWeight: 800, color: "#FFFFFF" }}>
                  Government & Public Sector Inquiries
                </h4>
                <p className="readable-text mb-4" style={{ color: "#FFFFFF", opacity: 1 }}>
                  Durbolt Power welcomes inquiries from government agencies, municipalities, and defense contractors. We are currently prioritizing private-sector B2B orders — government inquiries are accepted on a first-come, first-served basis and fulfilled as capacity allows. Submit your RFQ and our team will respond within 48 hours.
                </p>
                <a
                  href="#rfq"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase transition-colors duration-150"
                  style={{ color: "#E8631A", letterSpacing: "0.16em" }}
                >
                  Submit a Government RFQ <ArrowRight size={11} />
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Floating-label field ──────────────────────────────────────────────────────
function FloatingField({ name, label, type = "text", value, onChange, required, as = "input", rows }) {
  const Tag = as;
  return (
    <div className="float-field">
      <Tag
        name={name}
        type={as === "input" ? type : undefined}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        rows={as === "textarea" ? rows : undefined}
        style={as === "textarea" ? { resize: "vertical", lineHeight: 1.6 } : undefined}
      />
      <label>{label}</label>
    </div>
  );
}

// ─── RFQ Form ─────────────────────────────────────────────────────────────────
function RFQForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", sku: "", product: "", message: "" });
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onProductChange = (e) => {
    const selectedName = e.target.value;
    let sku = "";
    for (const div of DIVISIONS) {
      const p = div.products.find((prod) => prod.name === selectedName);
      if (p) { sku = p.sku || ""; break; }
    }
    setForm((prev) => ({ ...prev, product: selectedName, sku }));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pkg = params.get("package");
    const skuParam = params.get("sku");
    const productParam = params.get("product");
    if (pkg) setForm((f) => ({ ...f, message: `Requesting quote for package: ${pkg}` }));
    if (productParam) {
      let resolvedSku = skuParam || "";
      for (const div of DIVISIONS) {
        const p = div.products.find((prod) => prod.name === productParam);
        if (p) { resolvedSku = p.sku || resolvedSku; break; }
      }
      setForm((f) => ({ ...f, product: productParam, sku: resolvedSku }));
    } else if (skuParam) {
      setForm((f) => ({ ...f, sku: skuParam }));
    }
  }, []);

  const onAddFiles = (incoming) => {
    setFileError("");
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (f.size > 10 * 1024 * 1024) { setFileError(`"${f.name}" exceeds the 10MB limit`); continue; }
      if (next.length >= 5) { setFileError("Maximum 5 files allowed"); break; }
      if (!next.find((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    setFiles(next);
  };

  const readAsBase64 = (f) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve({ filename: f.name, content: r.result.split(",")[1], contentType: f.type || "application/octet-stream" });
    r.onerror = reject;
    r.readAsDataURL(f);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const attachments = files.length ? await Promise.all(files.map(readAsBase64)) : [];
      const r = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attachments }),
      });
      if (!r.ok) throw new Error("Server error");
      setSubmitted(true);
    } catch {
      alert("Submission failed — please email us directly at quotes@durbolt.com");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="rfq" className="py-28 px-6" style={{ position: "relative", zIndex: 2, background: "linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/scene5-citywide.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <OrangeLine />
      <div className="max-w-3xl mx-auto pt-16">
        <FadeIn className="mb-12">
          <SectionLabel>B2B INQUIRIES ONLY</SectionLabel>
          <h2 className="font-black leading-none mb-5" style={{ fontFamily: HEADING, fontSize: "clamp(2.4rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Request a Quote
          </h2>
          <p className="readable-text" style={{ color: "#C8C8C8" }}>
            Submit your requirements. Our team responds within 24 hours with pricing, lead times, and full technical documentation.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="glow-border-wrap">
            <div className="glow-border-inner glass-panel p-8 md:p-10" style={{ border: "1px solid rgba(232,99,26,0.25)" }}>
              {submitted ? (
                  <div className="text-center py-14">
                    <div className="w-14 h-14 flex items-center justify-center mx-auto mb-6"
                      style={{ background: "rgba(232,99,26,0.1)", border: "1px solid rgba(232,99,26,0.25)" }}>
                      <CheckCircle size={28} style={{ color: "#E8631A" }} />
                    </div>
                    <h3 className="text-2xl font-black mb-3" style={{ fontFamily: HEADING, fontWeight: 800 }}>Request Received</h3>
                    <p className="readable-text mb-8" style={{ color: "#C8C8C8" }}>
                      Our team will contact you within 24 hours with pricing and availability.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name:"",company:"",email:"",phone:"",sku:"",product:"",message:"" }); setFiles([]); setFileError(""); }}
                      className="text-xs font-bold uppercase px-5 py-2.5 transition-all duration-200"
                      style={{ border: "1px solid rgba(232,99,26,0.35)", color: "#E8631A", background: "transparent", cursor: "pointer", letterSpacing: "0.16em" }}
                    >
                      Submit Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <FloatingField name="name" label="Full Name *" required value={form.name} onChange={onChange} />
                      <FloatingField name="company" label="Company / Organization *" required value={form.company} onChange={onChange} />
                      <FloatingField name="email" label="Business Email *" type="email" required value={form.email} onChange={onChange} />
                      <FloatingField name="phone" label="Phone Number" type="tel" value={form.phone} onChange={onChange} />
                    </div>

                    <div className={`float-field mb-3 ${form.product ? "has-value" : ""}`}>
                      <select name="product" value={form.product} onChange={onProductChange} required style={{ appearance: "none" }}>
                        <option value="" disabled style={{ background: "#0D1520", color: "#444" }}></option>
                        {DIVISIONS.map((d) => (
                          <optgroup
                            key={d.id}
                            label={`DIV 0${d.id} — ${d.name.toUpperCase()}`}
                            style={{ background: "#0D1520", color: "#E8631A", fontWeight: 700 }}
                          >
                            {d.products.map((p) => (
                              <option key={p.name} value={p.name} style={{ background: "#0D1520", color: "#fff", fontWeight: 400 }}>
                                {p.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                        <option value="General Inquiry" style={{ background: "#0D1520", color: "#888" }}>General Inquiry</option>
                      </select>
                      <label>Product of Interest *</label>
                    </div>

                    <div className="float-field has-value mb-4" style={{ position: "relative" }}>
                      <input
                        name="sku"
                        type="text"
                        value={form.sku}
                        readOnly
                        placeholder="Auto-fills when product selected"
                        style={{
                          background: "rgba(232,99,26,0.04)",
                          cursor: "default",
                          paddingRight: "60px",
                          color: form.sku ? "#E8631A" : "#444",
                          fontFamily: MONO,
                          letterSpacing: form.sku ? "0.1em" : "normal",
                        }}
                      />
                      <label>Part No. / SKU</label>
                      <div style={{
                        position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                        fontSize: "0.55rem", fontFamily: MONO, letterSpacing: "0.14em",
                        color: form.sku ? "#E8631A" : "#333", fontWeight: 700,
                        border: `1px solid ${form.sku ? "rgba(232,99,26,0.3)" : "rgba(255,255,255,0.06)"}`,
                        padding: "2px 5px", background: "rgba(0,0,0,0.3)",
                      }}>AUTO</div>
                    </div>

                    <div className="mb-4">
                      <FloatingField as="textarea" name="message" label="Describe your requirements — quantities, specs, delivery timeline, project scope..." rows={5} value={form.message} onChange={onChange} />
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                      <p className="text-xs font-semibold uppercase mb-2" style={{ color: "#E0E0E0", letterSpacing: "0.16em", fontFamily: MONO }}>
                        Attach Documents <span style={{ color: "#555", fontWeight: 400 }}>— Optional</span>
                      </p>
                      <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); onAddFiles(e.dataTransfer.files); }}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: `1.5px dashed ${dragOver ? "#E8631A" : "rgba(232,99,26,0.35)"}`,
                          background: dragOver ? "rgba(232,99,26,0.06)" : "rgba(255,255,255,0.02)",
                          padding: "20px 16px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "border-color 0.15s, background 0.15s",
                          outline: "none",
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.doc,.docx"
                          style={{ display: "none" }}
                          onChange={(e) => { onAddFiles(e.target.files); e.target.value = ""; }}
                        />
                        <Paperclip size={18} style={{ color: "#E8631A", margin: "0 auto 8px", display: "block" }} />
                        <p className="text-xs font-semibold" style={{ color: "#E0E0E0", letterSpacing: "0.08em", margin: 0 }}>
                          {dragOver ? "Drop files here" : "Click or drag files to attach"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#555", margin: "4px 0 0", lineHeight: 1.5 }}>
                          Technical drawings, datasheets, specs — PDF, DWG, PNG, JPG up to 10MB each
                        </p>
                      </div>
                      {fileError && (
                        <p className="text-xs mt-2" style={{ color: "#E8631A" }}>{fileError}</p>
                      )}
                      {files.length > 0 && (
                        <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
                          {files.map((f, i) => (
                            <li key={i} className="flex items-center justify-between text-xs px-3 py-2 mt-1"
                              style={{ background: "rgba(232,99,26,0.06)", border: "1px solid rgba(232,99,26,0.2)" }}>
                              <span style={{ color: "#C8C8C8", fontFamily: MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "85%" }}>{f.name}</span>
                              <button
                                type="button"
                                aria-label={`Remove ${f.name}`}
                                onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((_, idx) => idx !== i)); setFileError(""); }}
                                style={{ color: "#888", background: "none", border: "none", cursor: "pointer", padding: "0 2px", flexShrink: 0 }}
                              >
                                <X size={12} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-3 py-4 font-black text-sm uppercase transition-all duration-200"
                      style={{ background: submitting ? "#A65A28" : "#E8631A", color: "#fff", border: "none", cursor: submitting ? "default" : "pointer", letterSpacing: "0.16em", fontFamily: HEADING, fontWeight: 800 }}
                      onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#CC5816"; }}
                      onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#E8631A"; }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={15} className="spin-loader" />
                          {files.length > 0 ? "Uploading & Submitting..." : "Submitting..."}
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Submit RFQ Request
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs mt-4" style={{ color: "#E0E0E0", letterSpacing: "0.16em" }}>
                      B2B INQUIRIES ONLY — 24HR RESPONSE ON BUSINESS DAYS
                    </p>
                  </form>
                )}
            </div>
          </div>
        </FadeIn>
        <p className="text-center text-xs mt-8" style={{ color: "#C8C8C8", letterSpacing: "0.04em" }}>
          Or email us directly at{" "}
          <a href="mailto:quotes@durbolt.com" style={{ color: "#E8631A", textDecoration: "none" }}>quotes@durbolt.com</a>
          {" "}— we respond within 24 hours
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-12 px-6" style={{ position: "relative", zIndex: 2, background: "#0A0A0A", borderTop: "1px solid rgba(44,82,130,0.15)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
              <span style={{ display: "block", width: "18px", height: "1.5px", background: "#E8631A", flexShrink: 0 }} />
              <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.15rem", letterSpacing: "0.12em", lineHeight: 1, color: "#FFFFFF", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility" }}>
                DURBOLT <span style={{ color: "#E8631A" }}>POWER</span>
              </span>
              <span style={{ display: "block", width: "18px", height: "1.5px", background: "#E8631A", flexShrink: 0 }} />
            </Link>
            <p className="text-xs max-w-xs" style={{ color: "#C8C8C8" }}>
              Critical power and connectivity infrastructure. U.S.-based. B2B only.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              ["About", "#about", false], ["Divisions", "#divisions", false], ["Products", "#products", false],
              ["Solutions", "/solutions", true], ["Resources", "/blog", true],
              ["How It Works", "#how-it-works", false], ["Request Quote", "#rfq", false],
            ].map(([label, href, isRoute]) =>
              isRoute ? (
                <Link
                  key={href}
                  to={href}
                  className="text-xs font-semibold uppercase transition-colors duration-150"
                  style={{ color: "#E0E0E0", letterSpacing: "0.16em", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.target.style.color = "#fff")}
                  onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
                >
                  {label}
                </Link>
              ) : (
                <a key={href} href={href}
                  className="text-xs font-semibold uppercase transition-colors duration-150"
                  style={{ color: "#E0E0E0", letterSpacing: "0.16em" }}
                  onMouseEnter={(e) => (e.target.style.color = "#fff")}
                  onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
                >
                  {label}
                </a>
              )
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(44,82,130,0.1)" }}>
          <p className="text-xs font-semibold" style={{ color: "#E0E0E0", letterSpacing: "0.16em", fontFamily: MONO }}>
            © 2026 DURBOLT POWER. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <Mail size={11} style={{ color: "#E0E0E0" }} />
            <a href="mailto:info@durbolt.com" className="text-xs font-semibold" style={{ color: "#E0E0E0", letterSpacing: "0.16em", fontFamily: MONO, textDecoration: "none" }}>info@durbolt.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  usePageMeta({
    title: "Durbolt Power | Critical Power Infrastructure — Generators, Switchgear, BESS, Cables",
    description: "B2B supplier of industrial generators, switchgear, UPS systems, BESS, fiber optic cable, and cooling infrastructure. Factory-direct pricing. Global fulfillment. 44 product lines across 4 divisions.",
    canonical: "https://durbolt.com/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Durbolt Power",
      "url": "https://durbolt.com",
      "logo": "https://durbolt.com/logo.png",
      "description": "B2B critical power infrastructure supplier",
      "areaServed": ["US", "AE", "SA", "EG"],
    },
  });
  return (
    <>
      <CircuitSystem />
      <GrainOverlay />
      <Navbar />
      <Hero />
      <StatsTicker />
      <TrustedRow />
      <StatsBar />
      <About />
      <SupplyModel />
      <Divisions />
      <Products />
      <HowItWorks />
      <WhyDurbolt />
      <BlogTeaser />
      <GovNote />
      <RFQForm />
      <Footer />
    </>
  );
}
