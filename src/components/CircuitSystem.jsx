import { useEffect, useRef, useState } from "react";

const SECTION_IDS = ["stats", "about", "divisions", "products", "how-it-works", "why", "rfq"];

function useViewportSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

// Closed rectangle, inset from the viewport edge, starting top-left and
// running clockwise (TL -> TR -> BR -> BL) — the direction the power-up draw
// and the ambient current pulse both travel in.
function buildBorderPath(w, h, inset) {
  const x1 = inset, y1 = inset, x2 = w - inset, y2 = h - inset;
  return `M${x1},${y1} L${x2},${y1} L${x2},${y2} L${x1},${y2} Z`;
}

// 4 corners + 4 edge midpoints = 8 nodes, same rectangle as the border path.
function buildNodes(w, h, inset) {
  const x1 = inset, y1 = inset, x2 = w - inset, y2 = h - inset;
  const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
  return [
    { id: "top-left", x: x1, y: y1 },
    { id: "top-mid", x: midX, y: y1 },
    { id: "top-right", x: x2, y: y1 },
    { id: "right-mid", x: x2, y: midY },
    { id: "bottom-right", x: x2, y: y2 },
    { id: "bottom-mid", x: midX, y: y2 },
    { id: "bottom-left", x: x1, y: y2 },
    { id: "left-mid", x: x1, y: midY },
  ];
}

// ─── Circuit Border ─────────────────────────────────────────────────────────
// Persistent fixed overlay: a low-opacity rectangular trace plus a brighter
// segment that travels clockwise around it forever. Reacts to three events
// dispatched elsewhere in this file: circuit:surge (full loop, on section
// enter), circuit:flash (80ms brightness blip, on mobile touch), and
// circuit:node-pulse (scale the node nearest the action).
function CircuitBorder() {
  const { w, h } = useViewportSize();
  const inset = 8;
  const [phase, setPhase] = useState("draw"); // draw -> settle -> ambient
  const [surging, setSurging] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [pulsingNode, setPulsingNode] = useState(null);
  const [bursts, setBursts] = useState([]);

  const drawRef = useRef(null);
  const pulseRef = useRef(null);
  const nodePulseTimer = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("settle"), 1200);
    const t2 = setTimeout(() => setPhase("ambient"), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Re-measure path length whenever viewport size or phase changes — the
  // <path> elements persist across resizes, so a one-time ref-callback
  // measurement would go stale the moment the window resizes.
  useEffect(() => {
    if (drawRef.current) {
      const len = drawRef.current.getTotalLength();
      drawRef.current.style.setProperty("--circuit-draw-len", String(len));
      drawRef.current.style.strokeDasharray = String(len);
    }
  }, [w, h, phase]);

  useEffect(() => {
    if (pulseRef.current) {
      const len = pulseRef.current.getTotalLength();
      const seg = len * 0.12;
      pulseRef.current.style.setProperty("--circuit-len", String(len));
      pulseRef.current.style.strokeDasharray = `${seg} ${len - seg}`;
    }
  }, [w, h, phase]);

  useEffect(() => {
    const onSurge = () => {
      setSurging(true);
      setTimeout(() => setSurging(false), 600);
    };
    const onFlash = () => {
      setFlashing(true);
      setTimeout(() => setFlashing(false), 80);
    };
    const onNodePulse = (e) => {
      const nodeId = e.detail?.nodeId;
      clearTimeout(nodePulseTimer.current);
      setPulsingNode(null);
      requestAnimationFrame(() => setPulsingNode(nodeId));
      nodePulseTimer.current = setTimeout(() => setPulsingNode(null), 500);
    };
    const onBurst = (e) => {
      const edge = e.detail?.edge || "bottom";
      const groupId = `${Date.now()}-${Math.random()}`;
      const lefts = [20, 50, 80].map((base) => Math.min(92, Math.max(4, base + (Math.random() * 12 - 6))));
      setBursts((b) => [...b, ...lefts.map((left, i) => ({ id: `${groupId}-${i}`, groupId, edge, left }))]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.groupId !== groupId)), 340);
    };
    window.addEventListener("circuit:surge", onSurge);
    window.addEventListener("circuit:flash", onFlash);
    window.addEventListener("circuit:node-pulse", onNodePulse);
    window.addEventListener("circuit:burst", onBurst);
    return () => {
      window.removeEventListener("circuit:surge", onSurge);
      window.removeEventListener("circuit:flash", onFlash);
      window.removeEventListener("circuit:node-pulse", onNodePulse);
      window.removeEventListener("circuit:burst", onBurst);
      clearTimeout(nodePulseTimer.current);
    };
  }, []);

  const d = buildBorderPath(w, h, inset);
  const nodes = buildNodes(w, h, inset);

  return (
    <>
      <svg
        aria-hidden="true"
        className={`circuit-border-svg ${surging ? "is-surging" : ""} ${flashing ? "is-flashing" : ""}`}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        {phase !== "ambient" && (
          <path ref={drawRef} d={d} className={`circuit-trace-draw ${phase === "settle" ? "is-settling" : ""}`} />
        )}
        {phase !== "draw" && (
          <>
            <path d={d} className="circuit-trace-base" />
            <path ref={pulseRef} d={d} className="circuit-trace-pulse" />
          </>
        )}
      </svg>

      <div
        className="circuit-nodes-layer"
        aria-hidden="true"
        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 9999 }}
      >
        {nodes.map((n) => (
          <div key={n.id} className="circuit-node" style={{ left: n.x, top: n.y }}>
            <div className={`circuit-node-pulse ${pulsingNode === n.id ? "is-pulsing" : ""}`}>
              <div className="circuit-node-spin" />
            </div>
          </div>
        ))}
      </div>

      {bursts.map((b) => (
        <div key={b.id} className={`circuit-burst ${b.edge}`} style={{ left: `${b.left}%` }} aria-hidden="true" />
      ))}
    </>
  );
}

// ─── Touch/Click Shock ──────────────────────────────────────────────────────
// Every pointerdown (mouse click or touch) spawns an expanding ring + a
// handful of micro-arcs at the exact coordinate. Each shock is independent so
// rapid taps stack freely; pointerdown (not separate click/touchstart
// listeners) avoids double-firing on touch devices that emit both. Touch also
// flashes the border, the "haptic-style" visual cue.
function ShockLayer() {
  const { w, h } = useViewportSize();
  const [shocks, setShocks] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onPointerDown = (e) => {
      const isTouch = e.pointerType === "touch";
      const id = idRef.current++;
      const arcCount = isTouch ? 3 : 4 + Math.floor(Math.random() * 3); // desktop 4-6, mobile 3
      const arcs = Array.from({ length: arcCount }, () => ({
        angle: Math.random() * Math.PI * 2,
        len: 15 + Math.random() * 15,
        delay: Math.random() * 60,
      }));
      setShocks((s) => [...s, { id, x: e.clientX, y: e.clientY, arcs }]);
      if (isTouch) window.dispatchEvent(new CustomEvent("circuit:flash"));
      setTimeout(() => setShocks((s) => s.filter((sh) => sh.id !== id)), 420);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <svg
      aria-hidden="true"
      className="shock-layer"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 9998 }}
    >
      {shocks.map((s) => (
        <g key={s.id} transform={`translate(${s.x} ${s.y})`}>
          <circle className="shock-ring" cx={0} cy={0} r={0} />
          {s.arcs.map((a, i) => (
            <line
              key={i}
              className="shock-micro"
              x1={0}
              y1={0}
              x2={Math.cos(a.angle) * a.len}
              y2={Math.sin(a.angle) * a.len}
              style={{ animationDelay: `${a.delay}ms` }}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

// ─── Scroll Energy Bursts ───────────────────────────────────────────────────
// Watches every section after the hero; on entry, tells the border to surge,
// pulses the border node nearest the edge the section scrolled in from, fires
// an edge burst, and sweeps a scanline across the section that just entered.
// This never gates the visibility of any content — it only spawns ephemeral
// decorative overlays and reacts the (already-always-visible) border.
function SectionEnterEffects() {
  const scrollDirRef = useRef("down");
  const lastYRef = useRef(window.scrollY);
  const [scanlines, setScanlines] = useState([]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      scrollDirRef.current = y >= lastYRef.current ? "down" : "up";
      lastYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers = SECTION_IDS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          const edge = scrollDirRef.current === "up" ? "top" : "bottom";
          const nodeId = edge === "top" ? "top-mid" : "bottom-mid";

          window.dispatchEvent(new CustomEvent("circuit:surge"));
          window.dispatchEvent(new CustomEvent("circuit:node-pulse", { detail: { nodeId } }));
          window.dispatchEvent(new CustomEvent("circuit:burst", { detail: { edge } }));

          const rect = entry.boundingClientRect;
          const sid = `${id}-${Date.now()}`;
          setScanlines((s) => [
            ...s,
            { id: sid, left: rect.left, top: rect.top, width: rect.width, height: rect.height },
          ]);
          setTimeout(() => setScanlines((s) => s.filter((x) => x.id !== sid)), 450);
        },
        { threshold: 0, rootMargin: "0px 0px -40% 0px" }
      );

      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  return (
    <>
      {scanlines.map((s) => (
        <div
          key={s.id}
          className="circuit-scanline-area"
          style={{ left: s.left, top: s.top, width: s.width, height: s.height }}
          aria-hidden="true"
        >
          <div className="circuit-scanline-bar" />
        </div>
      ))}
    </>
  );
}

export default function CircuitSystem() {
  return (
    <>
      <CircuitBorder />
      <ShockLayer />
      <SectionEnterEffects />
    </>
  );
}
