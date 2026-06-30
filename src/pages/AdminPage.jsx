import { useState, useEffect, useCallback, Fragment } from "react";

// ── Color palette (matches Atlas Financial Post) ──────────────────────────────
const C = {
  bg:         "#06080F",
  panel:      "rgba(18,22,32,0.95)",
  panelSolid: "#121620",
  border:     "#21262D",
  borderHi:   "#30363D",
  text:       "#E6EDF3",
  textMid:    "#8B949E",
  textDim:    "#484F58",
  cyan:       "#00D4FF",
  blue:       "#1a6fff",
  green:      "#00C896",
  red:        "#f87171",
  amber:      "#f59e0b",
  gold:       "#F0C040",
  violet:     "#a78bfa",
};

const STORAGE_KEY = "drblt_auth";
const MONO = "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace";

// ── Formatters ────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || isNaN(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(Math.round(n));
}
function fmtTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}
function fmtTimeShort(ts) {
  if (!ts) return "—";
  return new Date(ts).toISOString().replace("T", " ").slice(0, 16);
}
function fmtHour(h) {
  if (h === 0)  return "12 AM";
  if (h < 12)   return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}
function classifyReferrer(ref) {
  if (!ref) return "direct";
  try {
    const h = new URL(ref).hostname.replace(/^www\./, "");
    if (h.includes("google"))                        return "google";
    if (h.includes("linkedin"))                      return "linkedin";
    if (h.includes("facebook"))                      return "facebook";
    if (h.includes("twitter") || h.includes("t.co")) return "twitter";
    if (h.includes("bing"))                          return "bing";
    if (h.includes("durbolt"))                       return "internal";
    return h || "direct";
  } catch { return "direct"; }
}
function flagEmoji(code) {
  if (!code || code.length !== 2) return "🌐";
  try {
    return String.fromCodePoint(
      ...code.toUpperCase().split("").map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
    );
  } catch { return "🌐"; }
}
function sourceColor(idx) {
  return [C.cyan, C.green, C.violet, C.amber, C.red, C.blue, C.gold, "#06b6d4"][idx % 8];
}
function downloadCSV(visits) {
  const headers = ["timestamp","ip","country","city","org","device","os","browser","page","referrer","session","new_visitor"];
  const rows = visits.map(v => [
    fmtTime(v.timestamp), v.ip,
    v.geo?.country||"", v.geo?.city||"", v.geo?.org||"",
    v.device, v.os, v.browser, v.page,
    v.referrer||"", v.sessionId, v.isNew ? "1" : "0",
  ].map(c => `"${String(c).replace(/"/g,'""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `durbolt-visits-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Primitives ────────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: "hidden", ...style,
    }}>
      {children}
    </div>
  );
}

function PanelHeader({ title, right }) {
  return (
    <div style={{
      padding: "12px 18px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontSize: 10, fontWeight: 700, color: C.textMid,
      textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: MONO,
    }}>
      <span>{title}</span>
      {right}
    </div>
  );
}

function PulseDot({ color = C.green }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: "50%", background: color,
      boxShadow: `0 0 8px ${color}`, display: "inline-block",
      animation: "drblt-pulse 1.6s infinite",
    }} />
  );
}

function StatCard({ icon, label, value, sub, pulse, accent }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8,
      flex: "1 1 190px", minWidth: 0, position: "relative", overflow: "hidden",
    }}>
      {accent && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }} />
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, color: C.textMid,
        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: MONO,
      }}>
        <span style={{ color: accent || C.cyan }}>{icon}</span>
        {label}
        {pulse && <span style={{ marginLeft: "auto" }}><PulseDot /></span>}
      </div>
      <div style={{
        fontSize: 32, fontWeight: 800, color: C.text, lineHeight: 1.1,
        fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em",
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.textMid, fontFamily: MONO }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ pct, color }) {
  return (
    <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`,
        background: color, borderRadius: 2, transition: "width 0.5s",
      }} />
    </div>
  );
}

function Pill({ children, color = C.cyan }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.04em", textTransform: "uppercase",
      color, background: `${color}22`, border: `1px solid ${color}55`,
      whiteSpace: "nowrap", fontFamily: MONO,
    }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, color = C.cyan, size = "md" }) {
  const pad = size === "sm" ? "4px 10px" : "8px 14px";
  const fs  = size === "sm" ? 11 : 12;
  return (
    <button onClick={onClick} style={{
      padding: pad, borderRadius: 8, fontSize: fs, fontWeight: 600,
      background: `${color}22`, color, border: `1px solid ${color}66`,
      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
      transition: "background 0.15s", fontFamily: MONO,
    }}
    onMouseEnter={e => e.currentTarget.style.background = `${color}33`}
    onMouseLeave={e => e.currentTarget.style.background = `${color}22`}>
      {children}
    </button>
  );
}

// ── Charts ────────────────────────────────────────────────────────────────────
function niceCeil(max) {
  if (max <= 0) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const norm = max / pow;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * pow;
}

function TrendChart({ data }) {
  const [hover, setHover] = useState(null);
  const W = 1000, H = 320;
  const pad = { l: 46, r: 24, t: 28, b: 44 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const usable = data && data.length > 0 ? data : [];
  const rawMax = Math.max(...usable.map(d => d.visitors), 1);
  const yMax   = niceCeil(rawMax);
  const stepX  = usable.length > 1 ? cW / (usable.length - 1) : cW;

  const pts = usable.map((d, i) => ({
    x: pad.l + i * stepX,
    y: pad.t + cH * (1 - d.visitors / yMax),
    visitors: d.visitors,
    date: d.date,
  }));

  const path     = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const fillPath = pts.length > 0
    ? `${path} L ${pts[pts.length-1].x} ${pad.t+cH} L ${pts[0].x} ${pad.t+cH} Z`
    : "";

  const gridSteps  = [0, 0.25, 0.5, 0.75, 1];
  const labelCount = Math.min(5, pts.length);
  const labelSet   = new Set();
  for (let k = 0; k < labelCount; k++) {
    labelSet.add(Math.round((k / Math.max(1, labelCount - 1)) * (pts.length - 1)));
  }
  const today = pts.length > 0 ? pts[pts.length - 1] : null;

  function formatDate(iso) {
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso;
    return new Date(+m[1], +m[2]-1, +m[3]).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function pointerIdx(evt) {
    if (pts.length === 0) return null;
    const svg = evt.currentTarget;
    const r   = svg.getBoundingClientRect();
    const vx  = ((evt.clientX - r.left) / r.width) * W;
    if (vx < pad.l - 8 || vx > W - pad.r + 8) return null;
    let best = 0, bestD = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const d = Math.abs(pts[i].x - vx);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      onPointerMove={e => setHover(pointerIdx(e))}
      onPointerLeave={() => setHover(null)}>
      <defs>
        <linearGradient id="drblt-tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C.cyan} stopOpacity={0.42} />
          <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
        </linearGradient>
        <filter id="drblt-glow" x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {gridSteps.map((f, i) => {
        const y = pad.t + cH * (1 - f);
        return (
          <g key={i}>
            <line x1={pad.l} x2={W-pad.r} y1={y} y2={y}
              stroke={i === 0 ? C.borderHi : C.border}
              strokeWidth={i === 0 ? 1.2 : 1}
              strokeDasharray={i === 0 ? undefined : "3 5"}
              opacity={i === 0 ? 0.9 : 0.55} />
            <text x={pad.l-10} y={y+4} textAnchor="end" fontSize="11" fill={C.textDim} fontFamily="monospace">
              {fmt(yMax * f)}
            </text>
          </g>
        );
      })}

      {pts.length > 0 && <path d={fillPath} fill="url(#drblt-tg)" />}
      {pts.length > 0 && (
        <path d={path} fill="none" stroke={C.cyan} strokeWidth={2.2}
          strokeLinejoin="round" strokeLinecap="round" filter="url(#drblt-glow)" />
      )}

      {today && (
        <g>
          <circle cx={today.x} cy={today.y} r={7}   fill={C.cyan} opacity={0.22} />
          <circle cx={today.x} cy={today.y} r={4.5} fill={C.cyan} stroke={C.bg} strokeWidth={1.5} />
          <text x={Math.min(today.x, W-pad.r-4)} y={today.y-14}
            textAnchor={today.x > W-pad.r-40 ? "end" : "middle"}
            fontSize="11" fontWeight={700} fill={C.cyan} fontFamily="monospace">
            {fmt(today.visitors)}
          </text>
          <text x={Math.min(today.x, W-pad.r-4)} y={today.y-28}
            textAnchor={today.x > W-pad.r-40 ? "end" : "middle"}
            fontSize="9" fill={C.textMid} letterSpacing="0.12em" fontFamily="monospace">
            TODAY
          </text>
        </g>
      )}

      {pts.map((p, i) => {
        if (!labelSet.has(i)) return null;
        const anchor = i === 0 ? "start" : i === pts.length-1 ? "end" : "middle";
        return (
          <text key={i} x={p.x} y={H-14} textAnchor={anchor}
            fontSize="11" fill={C.textMid} fontFamily="monospace">
            {formatDate(p.date)}
          </text>
        );
      })}

      {hover !== null && pts[hover] && (() => {
        const p  = pts[hover];
        const cw = 134, ch = 40;
        let cx = p.x - cw/2;
        if (cx < pad.l) cx = pad.l;
        if (cx + cw > W - pad.r) cx = W - pad.r - cw;
        const cy = (p.y - ch - 14 < pad.t) ? p.y + 14 : p.y - ch - 14;
        return (
          <g pointerEvents="none">
            <line x1={p.x} x2={p.x} y1={pad.t} y2={pad.t+cH}
              stroke={C.cyan} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={p.x} cy={p.y} r={5} fill={C.cyan} stroke={C.bg} strokeWidth={2} />
            <rect x={cx} y={cy} width={cw} height={ch} rx={6}
              fill={C.panelSolid} stroke={C.borderHi} strokeWidth={1} />
            <text x={cx+10} y={cy+14} fontSize="9"  fill={C.textMid} fontFamily="monospace">
              {formatDate(p.date)}
            </text>
            <text x={cx+10} y={cy+30} fontSize="13" fontWeight={700} fill={C.cyan} fontFamily="monospace">
              {fmt(p.visitors)} visits
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

function HourlyBars({ data }) {
  const W = 800, H = 140;
  const pad = { l: 32, r: 14, t: 14, b: 28 };
  const cW  = W - pad.l - pad.r;
  const cH  = H - pad.t - pad.b;
  const max = Math.max(...data.map(d => d.views), 1);
  const curHour = new Date().getUTCHours();
  const bw  = (cW / 24) * 0.68;
  const gap = (cW / 24) * 0.32;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 180 }}>
      {[0.5, 1].map(f => (
        <line key={f} x1={pad.l} x2={W-pad.r}
          y1={pad.t+cH*(1-f)} y2={pad.t+cH*(1-f)}
          stroke={C.border} strokeWidth={1} strokeDasharray="2 4" />
      ))}
      {data.map((d, i) => {
        const h     = (d.views / max) * cH;
        const x     = pad.l + i * (bw + gap);
        const isNow = d.hour === curHour;
        return (
          <g key={i}>
            <rect x={x} y={pad.t+cH-h} width={bw} height={h}
              fill={isNow ? C.cyan : C.blue} rx={2} opacity={0.85} />
            {i % 3 === 0 && (
              <text x={x+bw/2} y={H-10} textAnchor="middle"
                fontSize="9" fill={C.textDim} fontFamily="monospace">
                {fmtHour(d.hour)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Donut({ items, size = 180 }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) {
    return (
      <div style={{ color: C.textDim, padding: 24, textAlign: "center", fontSize: 12, fontFamily: MONO }}>
        No data yet
      </div>
    );
  }
  const cx = size/2, cy = size/2;
  const r1 = size/2 - 6, r0 = r1 - 22;
  let acc = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", padding: 18 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {items.map((it, i) => {
          const start = (acc / total) * 2 * Math.PI - Math.PI/2;
          acc += it.value;
          const end   = (acc / total) * 2 * Math.PI - Math.PI/2;
          const large = (end - start) > Math.PI ? 1 : 0;
          const x1 = cx+r1*Math.cos(start), y1 = cy+r1*Math.sin(start);
          const x2 = cx+r1*Math.cos(end),   y2 = cy+r1*Math.sin(end);
          const x3 = cx+r0*Math.cos(end),   y3 = cy+r0*Math.sin(end);
          const x4 = cx+r0*Math.cos(start), y4 = cy+r0*Math.sin(start);
          const d = `M ${x1} ${y1} A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 ${large} 0 ${x4} ${y4} Z`;
          return <path key={i} d={d} fill={it.color} stroke={C.bg} strokeWidth={1.5} />;
        })}
        <text x={cx} y={cy-4}  textAnchor="middle" fontSize="22" fill={C.text} fontWeight={800} fontFamily="monospace">
          {fmt(total)}
        </text>
        <text x={cx} y={cy+14} textAnchor="middle" fontSize="9"  fill={C.textMid} letterSpacing="0.1em">
          TOTAL
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 130 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: it.color, flexShrink: 0 }} />
            <span style={{ color: C.text, flex: 1, fontFamily: MONO, fontSize: 12 }}>{it.label}</span>
            <span style={{ color: C.textMid, fontVariantNumeric: "tabular-nums", fontFamily: MONO, fontSize: 12 }}>
              {fmt(it.value)}
            </span>
            <span style={{ color: C.textDim, fontSize: 11, fontFamily: MONO }}>
              {Math.round((it.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw,      setPw]      = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await r.json();
      if (r.ok && data.token) { localStorage.setItem(STORAGE_KEY, data.token); onLogin(data.token); }
      else setError("Invalid credentials.");
    } catch { setError("Connection error."); }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO,
    }}>
      <div style={{
        width: 360, padding: 40,
        background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14,
        boxShadow: `0 0 60px rgba(0,212,255,0.04)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <PulseDot color={C.cyan} />
          <span style={{ fontSize: 10, fontWeight: 700, color: C.textMid, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            DURBOLT POWER — OPS
          </span>
        </div>
        <p style={{ color: C.text, fontSize: 20, fontWeight: 800, marginBottom: 28, letterSpacing: "-0.01em" }}>
          Analytics Access
        </p>
        <form onSubmit={submit}>
          <input
            type="password" value={pw} onChange={e => setPw(e.target.value)}
            placeholder="Access token" autoFocus
            style={{
              width: "100%", padding: "10px 14px", background: C.panelSolid,
              border: `1px solid ${error ? C.red : C.border}`, borderRadius: 8,
              color: C.text, fontFamily: MONO, fontSize: 13, outline: "none",
              marginBottom: 14, boxSizing: "border-box",
            }}
          />
          {error && <p style={{ color: C.red, fontSize: 11, marginBottom: 12 }}>{error}</p>}
          <button type="submit" disabled={loading || !pw} style={{
            width: "100%", padding: "10px 0", borderRadius: 8,
            background: pw && !loading ? C.cyan : C.panelSolid,
            color:      pw && !loading ? C.bg   : C.textDim,
            fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: "0.2em",
            border: "none", cursor: pw ? "pointer" : "default",
            textTransform: "uppercase", transition: "background 0.2s",
          }}>
            {loading ? "AUTHENTICATING…" : "AUTHENTICATE"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          flex: "1 1 190px", height: 96,
          background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14,
          opacity: 0.5, animation: "drblt-skel 1.4s ease-in-out infinite",
        }} />
      ))}
    </div>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────
function OverviewTab({ data }) {
  if (!data) return <Skeleton />;

  const {
    summary = {}, trend30d = [], hourlyToday = [],
    devices = {}, sources = [], countries = [],
    returningVsNew = {}, onlineNow = 0,
  } = data;

  const total30d = trend30d.reduce((s, d) => s + d.visitors, 0);

  const deviceItems = Object.entries(devices).map(([label, value], i) => ({
    label, value, color: [C.cyan, C.green, C.amber][i % 3],
  }));

  const rvnItems = [
    { label: "Returning", value: returningVsNew.returning || 0, color: C.violet },
    { label: "New",       value: returningVsNew.new       || 0, color: C.cyan   },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Stat row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <StatCard icon="⚡" label="Online Now"  value={fmt(onlineNow)}         sub="last 5 min"   pulse accent={C.green}  />
        <StatCard icon="👤" label="Today"        value={fmt(summary.today)}     sub="visits"       accent={C.cyan}   />
        <StatCard icon="📅" label="This Week"    value={fmt(summary.week)}      sub="7 days"       accent={C.blue}   />
        <StatCard icon="🌐" label="All Time"     value={fmt(summary.allTime)}   sub="total visits" accent={C.violet} />
        <StatCard icon="🔑" label="Unique IPs"   value={fmt(summary.uniqueIPs)} sub="all time"     accent={C.amber}  />
      </div>

      {/* 30d trend + new vs returning */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)",
        gap: 18,
      }} className="drblt-grid-2-1">
        <Card>
          <div style={{
            padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: MONO }}>
                30-Day Visits
              </div>
              <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, marginTop: 2 }}>
                Hover any point for detail
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.text, fontFamily: "monospace", lineHeight: 1, letterSpacing: "-0.01em" }}>
                {fmt(total30d)}
              </div>
              <div style={{ fontSize: 9, color: C.textMid, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "monospace", marginTop: 2 }}>
                Total
              </div>
            </div>
          </div>
          <div style={{ padding: "8px 0 4px" }}>
            <TrendChart data={trend30d} />
          </div>
        </Card>

        <Card>
          <PanelHeader title="New vs Returning" />
          <Donut items={rvnItems} />
        </Card>
      </div>

      {/* Hourly chart */}
      <Card>
        <PanelHeader title="Pageviews by Hour (UTC — today)" right={
          <span style={{ color: C.textDim, fontSize: 10, fontFamily: MONO }}>
            <span style={{ color: C.cyan }}>■</span> current hour
          </span>
        } />
        <div style={{ padding: 12 }}>
          <HourlyBars data={hourlyToday} />
        </div>
      </Card>

      {/* Sources / Countries / Devices */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",
        gap: 18,
      }} className="drblt-grid-3">
        <Card>
          <PanelHeader title="Top Sources" />
          <div style={{ padding: "10px 18px 16px" }}>
            {sources.length === 0 && (
              <div style={{ color: C.textDim, fontSize: 12, fontFamily: MONO }}>No data yet</div>
            )}
            {sources.map((s, i) => (
              <div key={s.source} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12, fontFamily: MONO }}>
                  <span style={{ color: C.text, textTransform: "capitalize" }}>{s.source}</span>
                  <span style={{ color: C.textMid, fontVariantNumeric: "tabular-nums" }}>{fmt(s.count)}</span>
                </div>
                <MiniBar pct={(s.count / (sources[0]?.count || 1)) * 100} color={sourceColor(i)} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <PanelHeader title="Top Countries" />
          <div style={{ padding: "10px 18px 16px" }}>
            {countries.slice(0, 8).map((c, i) => (
              <div key={c.country||i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "6px 0", borderBottom: i < 7 ? `1px dashed ${C.border}` : "none",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{flagEmoji(c.code || "")}</span>
                  <span style={{ color: C.text, fontFamily: MONO, fontSize: 12 }}>{c.country || "—"}</span>
                </span>
                <span style={{ color: C.textMid, fontVariantNumeric: "tabular-nums", fontFamily: MONO, fontSize: 12 }}>
                  {fmt(c.count)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <PanelHeader title="Devices" />
          <Donut items={deviceItems} size={150} />
        </Card>
      </div>
    </div>
  );
}

// ── Tab: Visitors ─────────────────────────────────────────────────────────────
function VisitorsTab({ visits, bots, onCSV }) {
  const [search,  setSearch]  = useState("");
  const [sortFld, setSortFld] = useState("timestamp");
  const [sortDir, setSortDir] = useState("desc");
  const [page,    setPage]    = useState(0);
  const PER = 50;

  const filtered = visits.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.ip?.includes(q) ||
      v.page?.toLowerCase().includes(q) ||
      v.geo?.country?.toLowerCase().includes(q) ||
      v.geo?.city?.toLowerCase().includes(q) ||
      v.browser?.toLowerCase().includes(q) ||
      v.geo?.org?.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortFld === "timestamp") return sortDir === "desc" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    const cmp = String(a[sortFld]||"").localeCompare(String(b[sortFld]||""));
    return sortDir === "desc" ? -cmp : cmp;
  });

  const totalPages = Math.ceil(sorted.length / PER);
  const rows = sorted.slice(page * PER, (page+1) * PER);

  function toggleSort(f) {
    if (sortFld === f) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortFld(f); setSortDir("desc"); }
    setPage(0);
  }

  function TH({ field, label }) {
    const active = sortFld === field;
    return (
      <th onClick={() => toggleSort(field)} style={{
        padding: "10px 12px", textAlign: "left",
        color: active ? C.cyan : C.textMid,
        fontSize: 10, fontFamily: MONO, letterSpacing: "0.1em",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
        borderBottom: `1px solid ${C.border}`, background: C.panelSolid,
        fontWeight: 700, textTransform: "uppercase",
      }}>
        {label}{active ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
      </th>
    );
  }

  const botIPs = new Set((bots || []).map(b => b.ip));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card>
        <div style={{ padding: 14, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: C.panelSolid, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "6px 10px", flex: "2 1 240px", minWidth: 200,
          }}>
            <span style={{ color: C.textMid }}>🔍</span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Filter by IP, page, country, ISP…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 13, fontFamily: MONO }}
            />
          </div>
          <span style={{ color: C.textMid, fontSize: 12, marginLeft: "auto", fontFamily: MONO }}>
            {fmt(filtered.length)} rows · {page+1}/{Math.max(1, totalPages)}
          </span>
          <Btn size="sm" onClick={() => setPage(p => Math.max(0, p-1))}>← Prev</Btn>
          <Btn size="sm" onClick={() => setPage(p => p+1 < totalPages ? p+1 : p)}>Next →</Btn>
          <Btn size="sm" color={C.green} onClick={() => onCSV(visits)}>↓ CSV</Btn>
        </div>
      </Card>

      {bots && bots.length > 0 && (
        <div style={{
          background: "rgba(245,158,11,0.07)", border: `1px solid rgba(245,158,11,0.35)`,
          borderRadius: 10, padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ color: C.amber, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", fontFamily: MONO }}>
            ⚠ HIGH-FREQUENCY IPs
          </span>
          {bots.slice(0, 6).map(b => (
            <Pill key={b.ip} color={C.amber}>{b.ip} · {b.count}×</Pill>
          ))}
        </div>
      )}

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 920 }}>
            <thead>
              <tr>
                <TH field="timestamp" label="Time" />
                <TH field="ip"        label="IP" />
                <TH field="city"      label="City" />
                <TH field="country"   label="Country" />
                <TH field="org"       label="ISP / Org" />
                <TH field="device"    label="Device" />
                <TH field="browser"   label="Browser" />
                <TH field="page"      label="Page" />
                <TH field="referrer"  label="Source" />
                <TH field="isNew"     label="New" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 32, textAlign: "center", color: C.textDim, fontFamily: MONO }}>
                    No visits match the filter
                  </td>
                </tr>
              )}
              {rows.map((v, i) => {
                const isBot = botIPs.has(v.ip);
                return (
                  <tr key={i} style={{
                    background: isBot ? "rgba(248,113,113,0.04)" : i%2===1 ? "rgba(255,255,255,0.012)" : "transparent",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,212,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = isBot ? "rgba(248,113,113,0.04)" : i%2===1 ? "rgba(255,255,255,0.012)" : "transparent"}
                  >
                    <td style={{ padding: "8px 12px", color: C.textDim, fontFamily: MONO, fontSize: 11, whiteSpace: "nowrap" }}>
                      {fmtTimeShort(v.timestamp)}
                    </td>
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: MONO, color: isBot ? C.red : C.cyan, fontSize: 12 }}>{v.ip}</span>
                        {isBot && <Pill color={C.red}>BOT</Pill>}
                        {v.isNew && <Pill color={C.green}>NEW</Pill>}
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px", color: C.text,    fontFamily: MONO, fontSize: 11 }}>{v.geo?.city    || "—"}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{flagEmoji(v.geo?.countryCode || "")}</span>
                        <span style={{ color: C.text, fontFamily: MONO, fontSize: 11 }}>{v.geo?.country || "—"}</span>
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", color: C.textDim, fontFamily: MONO, fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.geo?.org || "—"}
                    </td>
                    <td style={{ padding: "8px 12px", color: C.textMid, fontFamily: MONO, fontSize: 11 }}>{v.device}</td>
                    <td style={{ padding: "8px 12px", color: C.textMid, fontFamily: MONO, fontSize: 11 }}>{v.browser}</td>
                    <td style={{ padding: "8px 12px", color: C.text,    fontFamily: MONO, fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.page}
                    </td>
                    <td style={{ padding: "8px 12px", color: C.textDim, fontFamily: MONO, fontSize: 11, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {classifyReferrer(v.referrer)}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ color: v.isNew ? C.green : C.textDim, fontFamily: MONO, fontSize: 11 }}>
                        {v.isNew ? "NEW" : "·"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Tab: Pages ────────────────────────────────────────────────────────────────
function PagesTab({ topPages, pageBounce }) {
  const max = Math.max(...(topPages || []).map(p => p.count), 1);

  return (
    <Card>
      <PanelHeader title="All Pages" right={
        <span style={{ color: C.textDim, fontSize: 10, fontFamily: MONO }}>
          {topPages?.length || 0} pages tracked
        </span>
      } />
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 700 }}>
          <thead>
            <tr style={{ background: C.panelSolid, borderBottom: `1px solid ${C.border}` }}>
              {["Page", "Views", "Bounce Rate"].map((h, i) => (
                <th key={h} style={{
                  padding: "10px 14px", textAlign: i === 0 ? "left" : "right",
                  color: C.textMid, fontWeight: 700, fontSize: 10,
                  textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: MONO,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(topPages || []).map((p, i) => {
              const br = pageBounce?.[p.page];
              const bounceRate = br ? Math.round((br.bounces / br.views) * 100) : null;
              const bounceColor = bounceRate == null ? C.textDim
                : bounceRate > 70 ? C.red
                : bounceRate > 40 ? C.amber
                : C.green;
              return (
                <tr key={p.page} style={{
                  borderBottom: `1px solid ${C.border}`,
                  background: i%2===1 ? "rgba(255,255,255,0.012)" : "transparent",
                }}>
                  <td style={{ padding: "10px 14px", color: C.text, fontFamily: MONO, fontSize: 12, maxWidth: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.page || "/"}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                        <div style={{ width: `${(p.count / max) * 100}%`, height: "100%", background: C.cyan, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", color: C.text }}>{fmt(p.count)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: MONO, color: bounceColor, fontVariantNumeric: "tabular-nums" }}>
                    {bounceRate != null ? `${bounceRate}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── Tab: Traffic ──────────────────────────────────────────────────────────────
function TrafficTab({ sources, visits }) {
  const refCounts = {};
  (visits || []).forEach(v => {
    if (v.referrer) refCounts[v.referrer] = (refCounts[v.referrer] || 0) + 1;
  });
  const referrers = Object.entries(refCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([url, count]) => ({ url, count }));

  const sourceItems = (sources || []).slice(0, 8).map((s, i) => ({
    label: s.source, value: s.count, color: sourceColor(i),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card>
        <PanelHeader title="Traffic Sources" />
        <Donut items={sourceItems} size={200} />
      </Card>

      <Card>
        <PanelHeader title="Referrer URLs" right={
          <span style={{ color: C.textDim, fontSize: 10, fontFamily: MONO }}>
            {referrers.length} unique
          </span>
        } />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 500 }}>
            <thead>
              <tr style={{ background: C.panelSolid, borderBottom: `1px solid ${C.border}` }}>
                {["Referrer URL", "Visits"].map((h, i) => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: i === 0 ? "left" : "right",
                    color: C.textMid, fontWeight: 700, fontSize: 10,
                    textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: MONO,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {referrers.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ padding: 24, textAlign: "center", color: C.textDim, fontFamily: MONO }}>
                    No referrer data yet
                  </td>
                </tr>
              )}
              {referrers.map((r, i) => (
                <tr key={i} style={{
                  borderBottom: `1px solid ${C.border}`,
                  background: i%2===1 ? "rgba(255,255,255,0.012)" : "transparent",
                }}>
                  <td style={{ padding: "10px 14px", color: C.cyan, fontFamily: MONO, fontSize: 12, maxWidth: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.url.length > 90 ? r.url.slice(0, 90) + "…" : r.url}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: C.text, fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>
                    {fmt(r.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Tab: Inquiries ────────────────────────────────────────────────────────────
function InquiriesTab({ leads }) {
  const [expanded, setExpanded] = useState(null);

  function downloadCSV() {
    const headers = ["timestamp","name","company","email","phone","product","message","attachments","resend_id"];
    const rows = (leads || []).map(l => [
      fmtTime(l.timestamp), l.name, l.company, l.email, l.phone || "",
      l.product, l.message || "", l.attachments_count, l.resend_id || "",
    ].map(c => `"${String(c).replace(/"/g,'""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `durbolt-inquiries-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const cols = ["Date / Time", "Name", "Company", "Email", "Phone", "Product", "Message", "Files"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card>
        <div style={{
          padding: "12px 18px", display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: `1px solid ${C.border}`,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: MONO }}>
            {(leads || []).length} total inquir{(leads || []).length === 1 ? "y" : "ies"}
          </span>
          <Btn size="sm" color={C.green} onClick={downloadCSV}>↓ CSV</Btn>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 960 }}>
            <thead>
              <tr style={{ background: C.panelSolid, borderBottom: `1px solid ${C.border}` }}>
                {cols.map(h => (
                  <th key={h} style={{
                    padding: "10px 12px", textAlign: "left", color: C.textMid,
                    fontWeight: 700, fontSize: 10, textTransform: "uppercase",
                    letterSpacing: "0.06em", fontFamily: MONO, whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(!leads || leads.length === 0) && (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: "center", color: C.textDim, fontFamily: MONO }}>
                    No inquiries yet
                  </td>
                </tr>
              )}
              {(leads || []).map((l, i) => {
                const isOpen = expanded === i;
                const rowBg = isOpen ? "rgba(0,212,255,0.06)" : i % 2 === 1 ? "rgba(255,255,255,0.012)" : "transparent";
                return (
                  <Fragment key={i}>
                    <tr
                      onClick={() => setExpanded(isOpen ? null : i)}
                      style={{ borderBottom: isOpen ? "none" : `1px solid ${C.border}`, background: rowBg, cursor: "pointer" }}
                      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "rgba(0,212,255,0.04)"; }}
                      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = rowBg; }}
                    >
                      <td style={{ padding: "9px 12px", color: C.textDim, fontFamily: MONO, fontSize: 11, whiteSpace: "nowrap" }}>
                        {fmtTimeShort(l.timestamp)}
                      </td>
                      <td style={{ padding: "9px 12px", color: C.text, fontFamily: MONO, fontSize: 12, whiteSpace: "nowrap" }}>
                        {l.name}
                      </td>
                      <td style={{ padding: "9px 12px", color: C.cyan, fontFamily: MONO, fontSize: 12, whiteSpace: "nowrap" }}>
                        {l.company}
                      </td>
                      <td style={{ padding: "9px 12px", fontFamily: MONO, fontSize: 11 }}>
                        <a href={`mailto:${l.email}`} style={{ color: C.green, textDecoration: "none" }}
                           onClick={e => e.stopPropagation()}>{l.email}</a>
                      </td>
                      <td style={{ padding: "9px 12px", color: C.textMid, fontFamily: MONO, fontSize: 11, whiteSpace: "nowrap" }}>
                        {l.phone || "—"}
                      </td>
                      <td style={{ padding: "9px 12px", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ color: C.violet, fontFamily: MONO, fontSize: 11 }}>{l.product}</span>
                      </td>
                      <td style={{ padding: "9px 12px", color: C.textDim, fontFamily: MONO, fontSize: 11, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.message
                          ? (l.message.length > 60 ? l.message.slice(0, 60) + "…" : l.message)
                          : <span style={{ color: C.textDim, opacity: 0.4 }}>—</span>}
                      </td>
                      <td style={{ padding: "9px 12px", textAlign: "center", color: l.attachments_count > 0 ? C.amber : C.textDim, fontFamily: MONO, fontSize: 11 }}>
                        {l.attachments_count > 0 ? `📎 ${l.attachments_count}` : "—"}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(0,212,255,0.03)" }}>
                        <td colSpan={8} style={{ padding: "14px 20px 18px" }}>
                          <div style={{ fontSize: 10, color: C.textMid, fontFamily: MONO, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            Full Message
                          </div>
                          <div style={{
                            background: C.panelSolid, border: `1px solid ${C.border}`,
                            borderRadius: 8, padding: "12px 16px",
                            color: C.text, fontSize: 13, lineHeight: 1.75,
                            whiteSpace: "pre-wrap", fontFamily: "inherit",
                            minHeight: 40,
                          }}>
                            {l.message || <span style={{ color: C.textDim }}>No message provided.</span>}
                          </div>

                          {(l.attachments && l.attachments.length > 0) && (
                            <div style={{ marginTop: 14 }}>
                              <div style={{ fontSize: 10, color: C.textMid, fontFamily: MONO, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                Attachments ({l.attachments.length})
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                {l.attachments.map((att, ai) => {
                                  const isImage = att.contentType && att.contentType.startsWith("image/");
                                  const dataUri = att.content ? `data:${att.contentType};base64,${att.content}` : null;
                                  const sizeLabel = att.size > 1048576
                                    ? (att.size / 1048576).toFixed(1) + " MB"
                                    : att.size > 1024
                                    ? (att.size / 1024).toFixed(0) + " KB"
                                    : att.size + " B";
                                  return (
                                    <div key={ai} style={{
                                      background: C.panelSolid, border: `1px solid ${C.borderHi}`,
                                      borderRadius: 8, overflow: "hidden",
                                      maxWidth: isImage ? 200 : "none",
                                      flex: isImage ? "0 0 auto" : "1 1 auto",
                                    }}>
                                      {isImage && dataUri && (
                                        <img
                                          src={dataUri}
                                          alt={att.filename}
                                          style={{ width: "100%", maxWidth: 200, display: "block", objectFit: "cover", maxHeight: 130 }}
                                        />
                                      )}
                                      <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 14 }}>{isImage ? "🖼" : "📎"}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          {dataUri ? (
                                            <a
                                              href={dataUri}
                                              download={att.filename}
                                              style={{ color: C.cyan, fontFamily: MONO, fontSize: 11, textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                              onClick={e => e.stopPropagation()}
                                            >
                                              {att.filename}
                                            </a>
                                          ) : (
                                            <span style={{ color: C.textMid, fontFamily: MONO, fontSize: 11, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                              {att.filename}
                                            </span>
                                          )}
                                          <span style={{ color: C.textDim, fontFamily: MONO, fontSize: 10 }}>{sizeLabel}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {l.attachments_count > 0 && (!l.attachments || l.attachments.length === 0) && (
                            <div style={{ marginTop: 10, fontSize: 11, color: C.amber, fontFamily: MONO }}>
                              📎 {l.attachments_count} file{l.attachments_count > 1 ? "s" : ""} attached (recorded before file storage was enabled)
                            </div>
                          )}

                          {l.resend_id && (
                            <div style={{ marginTop: 10, fontSize: 10, color: C.textDim, fontFamily: MONO }}>
                              Resend ID: {l.resend_id}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Tab: Catalogue ────────────────────────────────────────────────────────────
function CatalogueTab({ token }) {
  const [regenState, setRegenState] = useState("idle"); // idle | running | done | error
  const [regenMsg,   setRegenMsg]   = useState("");

  async function handleRegen() {
    setRegenState("running");
    setRegenMsg("");
    try {
      const r = await fetch("/api/ops/regen-catalogue", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (r.ok) { setRegenState("done");  setRegenMsg(d.message || "Started"); }
      else       { setRegenState("error"); setRegenMsg(d.error  || "Failed");   }
    } catch (e) {
      setRegenState("error"); setRegenMsg(e.message);
    }
  }

  const regenColor = regenState === "done" ? C.green : regenState === "error" ? C.red : C.amber;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
      <Card>
        <PanelHeader title="Catalogue Downloads" />
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Web Version (Compressed)", href: "/catalogue/durbolt-power-catalogue-2025-web.pdf", note: "Fast sharing — compressed JPEG images" },
            { label: "Print Version (Full Resolution)", href: "/catalogue/durbolt-power-catalogue-2025.pdf", note: "Full quality — for print and high-res review" },
          ].map(({ label, href, note }) => (
            <div key={href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 16, padding: "12px 16px",
              background: C.panelSolid, border: `1px solid ${C.border}`, borderRadius: 8,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: MONO }}>{label}</div>
                <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, marginTop: 4 }}>{note}</div>
              </div>
              <a href={href} target="_blank" rel="noreferrer" style={{
                padding: "7px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: `${C.cyan}22`, color: C.cyan, border: `1px solid ${C.cyan}55`,
                textDecoration: "none", whiteSpace: "nowrap", fontFamily: MONO, letterSpacing: "0.08em",
              }}>↓ OPEN PDF</a>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <PanelHeader title="Regenerate Catalogue" right={
          <span style={{ fontSize: 10, color: C.textDim, fontFamily: MONO }}>~15 min · runs in background</span>
        } />
        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: 12, color: C.textMid, fontFamily: MONO, marginBottom: 16, lineHeight: 1.7 }}>
            Regenerates both PDFs from source data. Fetches fresh product images, rebuilds all 52 pages,
            outputs full-res and compressed web versions, then replaces the landing page.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <button
              onClick={handleRegen}
              disabled={regenState === "running"}
              style={{
                padding: "9px 18px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: regenState === "running" ? `${C.amber}11` : `${C.amber}22`,
                color: C.amber, border: `1px solid ${C.amber}55`,
                cursor: regenState === "running" ? "default" : "pointer",
                fontFamily: MONO, letterSpacing: "0.1em", textTransform: "uppercase",
                opacity: regenState === "running" ? 0.6 : 1,
              }}>
              {regenState === "running" ? "⟳ STARTING…" : "↺ REGENERATE CATALOGUE"}
            </button>
            {regenMsg && (
              <span style={{ fontSize: 11, color: regenColor, fontFamily: MONO }}>{regenMsg}</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",   label: "Overview",   icon: "▦" },
  { id: "visitors",   label: "Visitors",   icon: "◈" },
  { id: "pages",      label: "Pages",      icon: "▤" },
  { id: "traffic",    label: "Traffic",    icon: "⚡" },
  { id: "inquiries",  label: "Inquiries",  icon: "✉" },
  { id: "catalogue",  label: "Catalogue",  icon: "⬡" },
];

function timeAgo(d) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5)  return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s/60)}m ago`;
}

function Dashboard({ token, onLogout }) {
  const [tab,        setTab]        = useState("overview");
  const [data,       setData]       = useState(null);
  const [leads,      setLeads]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await fetch("/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.status === 401 || r.status === 404) { onLogout(); return; }
      const d = await r.json();
      setData(d);
      setError("");
      setLastUpdate(new Date());
    } catch { setError("Failed to fetch analytics."); }
    setRefreshing(false);
    setLoading(false);
  }, [token, onLogout]);

  const fetchLeads = useCallback(async () => {
    try {
      const r = await fetch("/api/ops/leads", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setLeads(d.leads || []); }
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchData();
    fetchLeads();
    const iv = setInterval(() => { fetchData(); fetchLeads(); }, 30_000);
    return () => clearInterval(iv);
  }, [fetchData, fetchLeads]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: C.cyan, fontFamily: MONO, fontSize: 13, letterSpacing: "0.15em" }}>
          <PulseDot color={C.cyan} />&nbsp;LOADING INTELLIGENCE…
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: C.red, fontFamily: MONO, fontSize: 13 }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at top, #0b1020 0%, ${C.bg} 60%)`,
      color: C.text, overflowX: "hidden",
    }}>
      <style>{`
        @keyframes drblt-pulse {
          0%,100% { opacity:1; box-shadow:0 0 0 0 currentColor; }
          70%      { opacity:.7; box-shadow:0 0 0 6px transparent; }
        }
        @keyframes drblt-skel {
          0%,100% { opacity:.3; }
          50%     { opacity:.6; }
        }
        @media (max-width:900px) {
          .drblt-grid-2-1,.drblt-grid-3 { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(6,8,15,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`, padding: "18px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>
              Durbolt Analytics
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, display: "flex", alignItems: "center", gap: 6, fontFamily: MONO }}>
              <PulseDot color={data ? C.green : C.amber} />
              {data ? `Live · updated ${timeAgo(lastUpdate)}` : "Connecting…"}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Btn size="sm" onClick={fetchData}>↻ Refresh</Btn>
            <Btn size="sm" color={C.green} onClick={() => downloadCSV(data?.visits || [])}>↓ Export CSV</Btn>
            <Btn size="sm" color={C.red}   onClick={onLogout}>Logout</Btn>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", gap: 2, marginTop: 14,
          borderBottom: `1px solid ${C.border}`,
          marginLeft: -24, marginRight: -24,
          paddingLeft: 24, paddingRight: 24,
          overflowX: "auto", scrollbarWidth: "none",
        }}>
          {TABS.map(t => {
            const active = tab === t.id;
            const badge  = t.id === "inquiries" && leads.length > 0 ? leads.length : null;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "10px 16px", background: "transparent", border: "none",
                color: active ? C.cyan : C.textMid, fontWeight: 600, fontSize: 13,
                cursor: "pointer", whiteSpace: "nowrap", fontFamily: MONO,
                borderBottom: `2px solid ${active ? C.cyan : "transparent"}`,
                display: "inline-flex", alignItems: "center", gap: 8,
                transition: "color 0.15s",
              }}>
                {t.icon} {t.label}
                {badge !== null && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: active ? C.cyan : `${C.cyan}99`,
                    color: C.bg, borderRadius: 999,
                    fontSize: 9, fontWeight: 800, padding: "1px 6px", minWidth: 18,
                    fontFamily: MONO, letterSpacing: 0, lineHeight: "16px",
                  }}>{badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 24px 60px", maxWidth: 1500, margin: "0 auto" }}>
        {tab === "overview"   && <OverviewTab data={data} />}
        {tab === "visitors"   && <VisitorsTab visits={data?.visits || []} bots={data?.bots || []} onCSV={downloadCSV} />}
        {tab === "pages"      && <PagesTab topPages={data?.topPages || []} pageBounce={data?.pageBounce || {}} />}
        {tab === "traffic"    && <TrafficTab sources={data?.sources || []} visits={data?.visits || []} />}
        {tab === "inquiries"  && <InquiriesTab leads={leads} />}
        {tab === "catalogue"  && <CatalogueTab token={token} />}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  function handleLogout() { localStorage.removeItem(STORAGE_KEY); setToken(""); }
  if (!token) return <LoginScreen onLogin={setToken} />;
  return <Dashboard token={token} onLogout={handleLogout} />;
}
