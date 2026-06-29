/**
 * REDESIGN PREVIEW — /redesign-preview
 * Isolated from the live homepage (App.jsx). Safe to scrap or merge independently.
 * Preview: run `npm run dev` and visit http://localhost:5173/redesign-preview
 * Deploy: only after explicit approval — `npm run build` overwrites the live dist/.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowRight, Mail, Menu, X, Shield, Globe, GitBranch, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const MONO    = "'JetBrains Mono', ui-monospace, monospace";
const HEADING = "'Space Grotesk', sans-serif";
const BRAND      = "#E8631A";
const BRAND_DARK = "#CC5816";

// ─── Keyframes injected once on mount ────────────────────────────────────────
const RV2_CSS = `
@keyframes rv2KenBurns {
  0%   { transform: scale(1.0)   translate(0%,    0%);    }
  50%  { transform: scale(1.07)  translate(-0.8%, 0.4%); }
  100% { transform: scale(1.0)   translate(0%,    0%);    }
}
@keyframes rv2KenBurnsAlt {
  0%   { transform: scale(1.0)  translate(0%,    0%);   }
  50%  { transform: scale(1.06) translate(0.8%, -0.4%); }
  100% { transform: scale(1.0)  translate(0%,    0%);   }
}
@keyframes rv2FadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes rv2CountUp {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.rv2-ken        { animation: rv2KenBurns    18s ease-in-out infinite; will-change: transform; }
.rv2-ken-alt    { animation: rv2KenBurnsAlt 24s ease-in-out infinite; will-change: transform; }
.rv2-enter-0    { animation: rv2FadeUp 600ms ease-out 100ms both; }
.rv2-enter-1    { animation: rv2FadeUp 650ms ease-out 250ms both; }
.rv2-enter-2    { animation: rv2FadeUp 650ms ease-out 430ms both; }
.rv2-enter-3    { animation: rv2FadeUp 650ms ease-out 640ms both; }

/* Magnetic button glow state */
.rv2-btn-glow:hover {
  box-shadow: 0 0 36px rgba(232,99,26,0.55), 0 0 10px rgba(232,99,26,0.85);
}

/* About grid — 2-col on lg, 1-col on mobile */
.rv2-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
.rv2-about-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 1024px) {
  .rv2-about-grid { grid-template-columns: 1fr; gap: 48px; }
}
@media (max-width: 640px) {
  .rv2-about-cards { grid-template-columns: 1fr; }
}

/* KPI grid */
.rv2-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}
@media (max-width: 900px)  { .rv2-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .rv2-kpi-grid { grid-template-columns: 1fr; } }

/* Trust grid: 2-col × 4-row on mobile → 4-col × 2-row tablet → 8-col × 1-row wide */
.rv2-trust-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 600px)  { .rv2-trust-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1100px) { .rv2-trust-grid { grid-template-columns: repeat(8, 1fr); } }
`;

function InjectCSS() {
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "rv2-styles";
    el.textContent = RV2_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

// ─── Preview banner ───────────────────────────────────────────────────────────
function PreviewBanner() {
  return (
    <div
      aria-label="Preview mode indicator"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(18,10,4,0.97)",
        borderTop: `1px solid ${BRAND}`,
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <span style={{
        fontFamily: MONO,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.22em",
        color: BRAND,
        textTransform: "uppercase",
      }}>
        REDESIGN PREVIEW — /redesign-preview
      </span>
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>|</span>
      <Link
        to="/"
        style={{
          fontFamily: MONO,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.55)",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => (e.target.style.color = "#fff")}
        onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.55)")}
      >
        ← Back to live site
      </Link>
    </div>
  );
}

// ─── Navbar (copy — not exported from App.jsx) ────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "About",        href: "#about"          },  // section exists on this page
    { label: "Divisions",    href: "/#divisions"     },  // live site section
    { label: "Products",     href: "/#products"      },  // live site section
    { label: "Solutions",    href: "/solutions",  isRoute: true },
    { label: "Resources",    href: "/blog",       isRoute: true },
    { label: "How It Works", href: "/#how-it-works"  },  // live site section
    { label: "Contact",      href: "/#rfq"           },  // live site RFQ form
  ];

  const linkStyle = {
    fontFamily: MONO,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#E0E0E0",
    textDecoration: "none",
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
          background:     scrolled ? "rgba(8,14,22,0.94)" : "rgba(8,14,22,0.32)",
          backdropFilter: scrolled ? "blur(20px)"         : "blur(10px)",
          WebkitBackdropFilter: scrolled ? "blur(20px)"  : "blur(10px)",
          borderBottom:   scrolled ? "1px solid rgba(44,82,130,0.2)" : "1px solid rgba(44,82,130,0.08)",
        }}
      >
        <nav style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ display: "block", width: 18, height: 1.5, background: BRAND, flexShrink: 0 }} />
            <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.15rem", letterSpacing: "0.12em", color: "#fff", WebkitFontSmoothing: "antialiased" }}>
              DURBOLT <span style={{ color: BRAND }}>POWER</span>
            </span>
            <span style={{ display: "block", width: 18, height: 1.5, background: BRAND, flexShrink: 0 }} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) =>
              l.isRoute ? (
                <Link key={l.href} to={l.href} style={linkStyle}>{l.label}</Link>
              ) : (
                <a key={l.href} href={l.href} style={linkStyle}>{l.label}</a>
              )
            )}
            <a
              href="/#rfq"
              style={{
                padding: "8px 20px",
                background: BRAND,
                color: "#fff",
                fontFamily: MONO,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                textDecoration: "none",
                clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
            >
              Request Quote
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden"
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setMobileOpen(false)} />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                top: 0, right: 0,
                height: "100dvh",
                width: "82%",
                maxWidth: 340,
                background: "rgba(8,14,22,0.98)",
                backdropFilter: "blur(20px)",
                borderLeft: `1px solid rgba(232,99,26,0.2)`,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                padding: 24,
                gap: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 0 }}
                >
                  ×
                </button>
              </div>
              {links.map((l) => (
                <a key={l.href} href={l.href} style={{ ...linkStyle, fontSize: "13px" }} onClick={() => setMobileOpen(false)}>
                  {l.label}
                </a>
              ))}
              <a
                href="/#rfq"
                style={{
                  marginTop: "auto",
                  padding: "14px 0",
                  background: BRAND,
                  color: "#fff",
                  fontFamily: MONO,
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  textAlign: "center",
                }}
                onClick={() => setMobileOpen(false)}
              >
                Request a Quote
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Magnetic CTA ─────────────────────────────────────────────────────────────
function MagneticCTA({ href, children }) {
  const ref  = useRef(null);
  const [xy, setXY] = useState({ x: 0, y: 0 });
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
      className="rv2-btn-glow"
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
        boxShadow: hot
          ? "0 0 36px rgba(232,99,26,0.6), 0 0 10px rgba(232,99,26,0.85)"
          : "none",
        willChange: "transform",
      }}
    >
      {children}
      <ArrowRight size={14} />
    </a>
  );
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

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}

// ─── Hero (redesigned) ────────────────────────────────────────────────────────
// Uses scene3-ground.jpg — the closest/most macro shot in the asset library.
// Swap src to any real product photo. Ken Burns replaces the lightning system.
function HeroRedesigned() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
      }}
    >
      {/* Ken Burns background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <img
          src="/scene3-ground.jpg"
          alt=""
          className="rv2-ken"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transformOrigin: "center center",
            display: "block",
          }}
          loading="eager"
        />
      </div>

      {/* Gradient overlays */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(108deg, rgba(5,8,15,0.90) 0%, rgba(5,8,15,0.72) 48%, rgba(5,8,15,0.38) 100%)",
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(5,8,15,0.1) 0%, transparent 38%, rgba(5,8,15,0.88) 100%)",
      }} />

      {/* Grain */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 10,
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 24px 96px",
        width: "100%",
      }}>
        <div style={{ maxWidth: 680 }}>

          {/* Eyebrow */}
          <p
            className="rv2-enter-0"
            style={{
              fontFamily: MONO,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: BRAND,
              marginBottom: 20,
            }}
          >
            Critical Power Infrastructure
          </p>

          {/* Headline — 5 words, confident */}
          <h1
            className="rv2-enter-1"
            style={{
              fontFamily: HEADING,
              fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
              color: "#fff",
              marginBottom: 28,
              textShadow: "0 4px 32px rgba(0,0,0,0.65)",
            }}
          >
            Critical Power,<br />
            <span style={{ color: BRAND }}>Engineered to Spec.</span>
          </h1>

          {/* Short subhead — longer copy lives in About section below */}
          <p
            className="rv2-enter-2"
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: "#B8B8B8",
              maxWidth: 500,
              marginBottom: 44,
            }}
          >
            B2B critical power infrastructure — engineered, sourced, and delivered. Direct pricing. Global reach. 44 product lines.
          </p>

          {/* CTAs */}
          <div
            className="rv2-enter-3"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
            }}
          >
            <MagneticCTA href="/#rfq">Request a Quote</MagneticCTA>

            <a
              href="/#products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "15px 28px",
                color: "#C8C8C8",
                border: "1px solid rgba(44,82,130,0.45)",
                fontFamily: HEADING,
                fontWeight: 700,
                fontSize: "0.82rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = `rgba(232,99,26,0.5)`; }}
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

// ─── Stats ticker (same items as live) ───────────────────────────────────────
const TICKER_ITEMS = [
  "44 Product Lines", "4 Divisions", "50+ Countries Supplied", "24hr Quote Turnaround",
  "B2B Direct Pricing", "Engineered to Specification", "Private Label Ready",
  "Global Freight Management", "IEC / UL / ANSI Certified", "Tier-1 Manufacturer Network",
];

function StatsTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{
      position: "relative",
      zIndex: 2,
      overflow: "hidden",
      padding: "14px 0",
      background: "rgba(15,15,15,0.9)",
      borderTop: "1px solid rgba(232,99,26,0.25)",
      borderBottom: "1px solid rgba(232,99,26,0.22)",
    }}>
      <motion.div
        style={{ display: "flex", whiteSpace: "nowrap" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "0 32px" }}>
            <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", color: "#E0E0E0", textTransform: "uppercase" }}>
              {item}
            </span>
            <span style={{ color: BRAND, fontSize: "6px", opacity: 0.9 }}>◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Trusted-by / Certifications row ─────────────────────────────────────────
const TRUST_LOGOS = [
  { src: "/logos/ul.svg",               alt: "UL Solutions",       w: 44 },
  { src: "/logos/ce-mark.svg",          alt: "CE Mark",            w: 60 },
  { src: "/logos/iso-9001.svg",         alt: "ISO 9001",           w: 68 },
  { src: "/logos/ieee.svg",             alt: "IEEE",               w: 68 },
  { src: "/logos/schneiderelectric.svg",alt: "Schneider Electric", w: 76 },
  { src: "/logos/siemens.svg",          alt: "Siemens",            w: 76 },
  { src: "/logos/abb.svg",              alt: "ABB",                w: 44 },
  { src: "/logos/sgs.svg",             alt: "SGS",                w: 44 },
];

function LogoBox({ src, alt, w }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 10px",
        border: `1px solid ${hover ? "rgba(232,99,26,0.35)" : "rgba(255,255,255,0.08)"}`,
        background: hover ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)",
        transition: "border-color 0.22s, background 0.22s",
        minHeight: 68,
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: w,
          height: "auto",
          objectFit: "contain",
          filter: hover
            ? "grayscale(1) brightness(1.05) opacity(1)"
            : "grayscale(1) brightness(0.55) opacity(0.65)",
          transition: "filter 0.22s",
          display: "block",
          userSelect: "none",
        }}
      />
    </div>
  );
}

function TrustedRow() {
  return (
    <div style={{
      position: "relative",
      zIndex: 2,
      background: "rgba(10,12,18,0.98)",
      borderBottom: "1px solid rgba(44,82,130,0.15)",
      padding: "36px 24px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <p style={{
          fontFamily: MONO,
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.28em",
          color: "rgba(232,99,26,0.5)",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 24,
        }}>
          Certifications &amp; Partners
        </p>
        <div className="rv2-trust-grid">
          {TRUST_LOGOS.map((logo) => (
            <LogoBox key={logo.alt} {...logo} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── KPI / Stats strip (scroll-triggered count-up) ────────────────────────────
// Placeholder numbers — swap real figures before going live.
const KPI_DATA = [
  { end: 20,  suffix: "+",   prefix: "",  label: "Years in Operation"  },
  { end: 500, suffix: "+",   prefix: "",  label: "Projects Delivered"  },
  { end: 50,  suffix: "+",   prefix: "",  label: "Countries Served"    },
  { end: 100, suffix: "M+",  prefix: "$", label: "Sourced to Date"     },
];

function KPIStrip() {
  return (
    <div style={{
      position: "relative",
      zIndex: 2,
      background: "linear-gradient(rgba(10,10,10,0.88), rgba(10,10,10,0.88)), url('/scene1-aerial.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      borderTop: "1px solid rgba(232,99,26,0.2)",
      borderBottom: "1px solid rgba(232,99,26,0.18)",
      padding: "72px 24px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="rv2-kpi-grid">
          {KPI_DATA.map((kpi, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: HEADING,
                fontWeight: 900,
                fontSize: "clamp(2.4rem, 4.5vw, 3.2rem)",
                color: "#fff",
                lineHeight: 1,
                marginBottom: 10,
                textShadow: "0 0 40px rgba(232,99,26,0.12)",
              }}>
                <ScrollCounter end={kpi.end} suffix={kpi.suffix} prefix={kpi.prefix} />
              </div>
              <div style={{
                fontFamily: MONO,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: BRAND,
              }}>
                {kpi.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── About / Intro (condensed, Cipher-hierarchy restraint) ───────────────────
// The longer subhead copy from the old hero now lives here.
const ABOUT_CARDS = [
  {
    icon: Shield,
    title: "Engineered to Specification",
    body: "44 product lines manufactured to our own design standards. We control the spec, the quality, and the certification.",
  },
  {
    icon: Globe,
    title: "Global Supply Chain",
    body: "Vetted tier-1 manufacturers across 12+ countries. Full documentation, factory audits, and QC on every order.",
  },
  {
    icon: GitBranch,
    title: "B2B Direct Pricing",
    body: "Qualified business buyers only. Direct pricing — no distributor markup, no retail layer.",
  },
  {
    icon: TrendingUp,
    title: "Factory-Direct Delivery",
    body: "DDP, FOB, or CIF — your terms. Full freight management and customs, port to site.",
  },
];

function AboutIntro() {
  return (
    <section
      id="about"
      style={{
        position: "relative",
        zIndex: 2,
        background: "linear-gradient(rgba(10,10,10,0.88), rgba(10,10,10,0.88)), url('/scene2-tower-storm.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "88px 24px 96px",
      }}
    >
      {/* Orange rule */}
      <div style={{
        width: "100%",
        height: 1,
        background: "linear-gradient(90deg, transparent, rgba(232,99,26,0.65), transparent)",
        marginBottom: 64,
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="rv2-about-grid">

          {/* Left: copy */}
          <div>
            <p style={{
              fontFamily: MONO,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.26em",
              color: BRAND,
              textTransform: "uppercase",
              marginBottom: 18,
            }}>
              About Durbolt Power
            </p>
            <h2 style={{
              fontFamily: HEADING,
              fontWeight: 900,
              fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              color: "#fff",
              marginBottom: 24,
            }}>
              Built for the demands of{" "}
              <span style={{ color: BRAND }}>critical infrastructure.</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#C0C0C0", marginBottom: 16 }}>
              Durbolt Power is a U.S.-based critical power and connectivity infrastructure brand. We engineer, source, and deliver the infrastructure modern facilities run on — from industrial generator sets and medium voltage switchgear to fiber optic cable and precision cooling.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#C0C0C0", marginBottom: 44 }}>
              Direct-pricing model. Qualified B2B buyers only. Spec-grade equipment at scale, bearing the Durbolt name because it's built to Durbolt specification.
            </p>
            <a
              href="/#rfq"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 28px",
                background: BRAND,
                color: "#fff",
                fontFamily: HEADING,
                fontWeight: 800,
                fontSize: "0.82rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                textDecoration: "none",
                clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
            >
              Get in Contact <ArrowRight size={14} />
            </a>
          </div>

          {/* Right: 2×2 feature cards */}
          <div className="rv2-about-cards">
            {ABOUT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  style={{
                    padding: "24px",
                    background: "rgba(8,8,8,0.92)",
                    border: "1px solid rgba(232,99,26,0.22)",
                    transition: "border-color 0.25s, box-shadow 0.25s, transform 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(232,99,26,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 24px rgba(232,99,26,0.1)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(232,99,26,0.22)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Icon size={18} style={{ color: BRAND, marginBottom: 14, display: "block" }} />
                  <h3 style={{
                    fontFamily: HEADING,
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    color: "#fff",
                    marginBottom: 8,
                    letterSpacing: "-0.01em",
                  }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: "#A0A0A0" }}>{card.body}</p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Mid-page macro section ───────────────────────────────────────────────────
// Second instance of the macro-visual + fade-in treatment, paired with
// the "factory-direct" positioning copy and a secondary CTA.
function MidPageSection() {
  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        overflow: "hidden",
        minHeight: 520,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Ken Burns — alternate direction, slower */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <img
          src="/scene4-control.jpg"
          alt=""
          className="rv2-ken-alt"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 40%",
            transformOrigin: "60% 50%",
            display: "block",
          }}
          loading="lazy"
        />
      </div>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(105deg, rgba(5,8,15,0.93) 0%, rgba(5,8,15,0.78) 45%, rgba(5,8,15,0.42) 100%)",
      }} />

      <div style={{
        position: "relative",
        zIndex: 10,
        maxWidth: 1280,
        margin: "0 auto",
        padding: "88px 24px",
        width: "100%",
      }}>
        <div style={{ maxWidth: 560 }}>
          <p style={{
            fontFamily: MONO,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.26em",
            color: BRAND,
            textTransform: "uppercase",
            marginBottom: 18,
          }}>
            Factory-Direct · Global Logistics
          </p>
          <h2 style={{
            fontFamily: HEADING,
            fontWeight: 900,
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: "#fff",
            marginBottom: 24,
          }}>
            Factory-direct,{" "}
            <span style={{ color: BRAND }}>delivered to your site.</span>
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "#B8B8B8", marginBottom: 40 }}>
            No distributors. No markups. We source directly and ship DDP, FOB, or CIF — fully managed by our global logistics team from factory to project site.
          </p>
          <a
            href="/#rfq"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 28px",
              background: "transparent",
              color: BRAND,
              fontFamily: HEADING,
              fontWeight: 800,
              fontSize: "0.82rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textDecoration: "none",
              border: `1px solid ${BRAND}`,
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = BRAND; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = BRAND; }}
          >
            Start Your RFQ <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer (copy of live) ────────────────────────────────────────────────────
function Footer() {
  const footerLinks = [
    ["About",        "#about"],           // section exists on this page
    ["Divisions",    "/#divisions"],      // live site section
    ["Products",     "/#products"],       // live site section
    ["Solutions",    "/solutions"],       // route exists
    ["Resources",    "/blog"],            // route exists
    ["How It Works", "/#how-it-works"],   // live site section
    ["Request Quote","/#rfq"],            // live site RFQ form
  ];

  return (
    <footer style={{
      position: "relative",
      zIndex: 2,
      background: "#0A0A0A",
      borderTop: "1px solid rgba(44,82,130,0.15)",
      padding: "48px 24px 80px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 32,
          marginBottom: 32,
        }}>
          <div>
            <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <span style={{ display: "block", width: 18, height: 1.5, background: BRAND, flexShrink: 0 }} />
              <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.15rem", letterSpacing: "0.12em", color: "#fff", WebkitFontSmoothing: "antialiased" }}>
                DURBOLT <span style={{ color: BRAND }}>POWER</span>
              </span>
              <span style={{ display: "block", width: 18, height: 1.5, background: BRAND, flexShrink: 0 }} />
            </Link>
            <p style={{ fontSize: 12, color: "#C8C8C8", maxWidth: 240, lineHeight: 1.6 }}>
              Critical power and connectivity infrastructure. U.S.-based. B2B only.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 28px", alignItems: "flex-start" }}>
            {footerLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                style={{
                  fontFamily: MONO,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#E0E0E0",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div style={{
          borderTop: "1px solid rgba(44,82,130,0.1)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <p style={{ fontFamily: MONO, fontSize: 11, color: "#E0E0E0", letterSpacing: "0.16em" }}>
            © 2026 DURBOLT POWER. ALL RIGHTS RESERVED.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mail size={11} style={{ color: "#E0E0E0" }} />
            <a href="mailto:info@durbolt.com" style={{ fontFamily: MONO, fontSize: 11, color: "#E0E0E0", letterSpacing: "0.16em", textDecoration: "none" }}>
              info@durbolt.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Scroll-linked power line ─────────────────────────────────────────────────
// A thin orange path drawn down the left margin as the user scrolls.
// Positioned at z-index:1 (below all content) — visible in the desktop left
// margin; naturally hidden behind content on narrower viewports.
//
// path in a 40×1000 viewBox (1000 = 100vh). Gentle 4-bend Q-curve:
const LINE_PATH = "M 20 24 Q 10 155 20 285 Q 30 415 20 500 Q 10 590 20 720 Q 30 860 20 976";
// Scroll progress thresholds where junction nodes light up
const LINE_NODE_THRESHOLDS = [0.12, 0.27, 0.44, 0.62, 0.82];

function PowerLine() {
  const measureRef = useRef(null);

  // MotionValues for dot position — avoids React re-render on every scroll tick
  const dotCX = useMotionValue(20);
  const dotCY = useMotionValue(24);

  // Exact node positions on the path (computed after mount)
  const [nodePositions, setNodePositions] = useState(
    LINE_NODE_THRESHOLDS.map(p => ({ x: 20, y: 24 + p * 952 }))
  );
  // Tracks how many nodes the scroll has passed (only 5 possible state changes total)
  const activeCountRef = useRef(0);
  const [activeCount, setActiveCount] = useState(0);

  const { scrollYProgress } = useScroll();
  // Normalized 0→1 for Framer Motion's built-in SVG pathLength animation
  const drawnLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Compute exact node positions once the SVG path is in the DOM
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const total = el.getTotalLength();
    setNodePositions(
      LINE_NODE_THRESHOLDS.map(t => {
        const pt = el.getPointAtLength(t * total);
        return { x: pt.x, y: pt.y };
      })
    );
  }, []);

  // Track dot position and node activations on scroll (no extra re-renders for dot)
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const el = measureRef.current;
    if (!el) return;
    const total = el.getTotalLength();
    const pt = el.getPointAtLength(Math.min(progress, 0.9999) * total);
    dotCX.set(pt.x);
    dotCY.set(pt.y);
    const n = LINE_NODE_THRESHOLDS.filter(t => progress >= t).length;
    if (n !== activeCountRef.current) {
      activeCountRef.current = n;
      setActiveCount(n);
    }
  });

  return (
    <svg
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0, top: 0,
        width: 40,
        height: "100vh",
        zIndex: 3,      // above section backgrounds (z:2), below navbar (z:50)
        pointerEvents: "none",
        overflow: "visible",
      }}
      viewBox="0 0 40 1000"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="rv2LineGlow" x="-150%" y="-5%" width="400%" height="110%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="rv2DotGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4"/>
        </filter>
      </defs>

      {/* Invisible measurement path */}
      <path ref={measureRef} d={LINE_PATH} fill="none" stroke="none" />

      {/* Ghost line — full path, always visible at 8% opacity */}
      <path d={LINE_PATH} stroke="rgba(232,99,26,0.08)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Glow layer — wide soft orange, scroll-driven */}
      <motion.path
        d={LINE_PATH}
        stroke="rgba(232,99,26,0.18)"
        strokeWidth="8"
        fill="none"
        filter="url(#rv2LineGlow)"
        style={{ pathLength: drawnLength }}
      />

      {/* Active line — crisp 1.5px, scroll-driven */}
      <motion.path
        d={LINE_PATH}
        stroke="rgba(232,99,26,0.65)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        style={{ pathLength: drawnLength }}
      />

      {/* Junction nodes — light up as scroll passes each threshold */}
      {nodePositions.map(({ x, y }, i) => {
        const active = i < activeCount;
        return (
          <g key={i}>
            {/* Outer halo ring */}
            <circle cx={x} cy={y} r={active ? 6 : 0}
              fill="rgba(232,99,26,0.06)"
              stroke={active ? "rgba(232,99,26,0.28)" : "none"}
              strokeWidth="0.8"
              style={{ transition: "r 0.5s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s" }}
            />
            {/* Node core */}
            <circle cx={x} cy={y} r={2}
              fill={active ? BRAND : "rgba(232,99,26,0.15)"}
              style={{ transition: "fill 0.35s ease" }}
            />
          </g>
        );
      })}

      {/* Traveling dot — glow halo (no re-render, driven by MotionValue) */}
      <motion.circle r={9} fill="rgba(232,99,26,0.10)" filter="url(#rv2DotGlow)"
        style={{ cx: dotCX, cy: dotCY }} />
      {/* Traveling dot — solid core */}
      <motion.circle r={3} fill={BRAND}
        style={{ cx: dotCX, cy: dotCY }} />
      {/* Traveling dot — inner highlight spark */}
      <motion.circle r={1.1} fill="rgba(255,255,255,0.65)"
        style={{ cx: dotCX, cy: dotCY }} />
    </svg>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────
export default function RedesignPreview() {
  return (
    <>
      <InjectCSS />
      <PowerLine />
      <div style={{ background: "#0F0F0F", minHeight: "100vh", color: "#fff", paddingBottom: 44 }}>
        <Navbar />
        <HeroRedesigned />
        <StatsTicker />
        <TrustedRow />
        <KPIStrip />
        <AboutIntro />
        <MidPageSection />
        <Footer />
        <PreviewBanner />
      </div>
    </>
  );
}
