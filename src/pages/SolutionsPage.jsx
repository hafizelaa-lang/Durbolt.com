import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X, Mail, Package, Cpu, Battery, Globe, Building2, Zap, Wifi, Car } from "lucide-react";
import { usePageMeta } from "../utils/seo.js";

const BRAND = "#E8631A";
const BRAND_DARK = "#CC5816";
const HEADING = "'Space Grotesk', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const TEAL = "#22D3EE";

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

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold mb-4" style={{ color: BRAND, letterSpacing: "0.22em", fontFamily: MONO }}>
      {children}
    </p>
  );
}

function PageNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "About", href: "/#about" },
    { label: "Divisions", href: "/#divisions" },
    { label: "Products", href: "/#products" },
    { label: "Solutions", href: "/solutions", active: true },
    { label: "Resources", href: "/blog" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Contact", href: "/#rfq" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(8,14,22,0.97)" : "rgba(8,14,22,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(44,82,130,0.2)",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ display: "block", width: "18px", height: "1.5px", background: "#E8631A", flexShrink: 0 }} />
          <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.12em", lineHeight: 1, color: "#FFFFFF", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility" }}>
            DURBOLT <span style={{ color: "#E8631A" }}>POWER</span>
          </span>
          <span style={{ display: "block", width: "18px", height: "1.5px", background: "#E8631A", flexShrink: 0 }} />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            l.href.startsWith("/") && !l.href.startsWith("/#") ? (
              <Link
                key={l.href}
                to={l.href}
                className="text-xs font-semibold uppercase transition-colors duration-200"
                style={{ color: l.active ? BRAND : "#E0E0E0", letterSpacing: "0.16em" }}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-xs font-semibold uppercase transition-colors duration-200"
                style={{ color: "#E0E0E0", letterSpacing: "0.16em" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
              >
                {l.label}
              </a>
            )
          ))}
          <a
            href="/#rfq"
            className="px-5 py-2 text-xs font-bold uppercase transition-all duration-200"
            style={{ background: BRAND, color: "#fff", clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)", letterSpacing: "0.16em" }}
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

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 md:hidden"
            style={{ background: "rgba(0,0,0,0.6)", top: 0, zIndex: 40 }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="fixed top-0 right-0 h-screen md:hidden flex flex-col"
            style={{
              width: "82%",
              maxWidth: 340,
              background: "rgba(8,14,22,0.98)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(232,99,26,0.2)",
              zIndex: 45,
            }}
          >
            <div className="px-6 pt-24 flex flex-col gap-6 flex-1">
              {links.map((l) => (
                l.href.startsWith("/") && !l.href.startsWith("/#") ? (
                  <Link
                    key={l.href}
                    to={l.href}
                    className="text-sm font-bold uppercase"
                    style={{ color: l.active ? BRAND : "#E0E0E0", letterSpacing: "0.16em" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-sm font-bold uppercase"
                    style={{ color: "#E0E0E0", letterSpacing: "0.16em" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </a>
                )
              ))}
            </div>
            <div className="p-6">
              <a
                href="/#rfq"
                className="block py-3 text-xs font-bold uppercase text-center"
                style={{ background: BRAND, color: "#fff", letterSpacing: "0.16em" }}
                onClick={() => setMobileOpen(false)}
              >
                Request a Quote
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

const BUNDLES = [
  {
    id: 1,
    icon: Cpu,
    name: "AI Data Center Power Package",
    tagline: "The complete power stack for high-density AI compute facilities",
    badge: "MOST POPULAR",
    price: "$500K+",
    includes: [
      "Industrial UPS Systems",
      "Modular Electrical Switchgear",
      "Medium Voltage Transformers",
      "Busway & Busduct Systems",
      "Surge Protection Devices",
      "Precision Air Conditioning",
    ],
    target: "Hyperscale data center developers, colocation operators, AI infrastructure builders",
  },
  {
    id: 2,
    icon: Zap,
    name: "Critical Backup Power System",
    tagline: "Zero-downtime backup power for mission-critical facilities",
    badge: null,
    price: "$250K+",
    includes: [
      "Industrial Generator Sets",
      "Automatic Transfer Switches",
      "Load Banks",
      "Industrial UPS Systems",
      "Weatherproof Enclosures",
      "Diesel Fuel Storage Tanks",
    ],
    target: "Hospitals, data centers, military facilities, government buildings",
  },
  {
    id: 3,
    icon: Battery,
    name: "Grid-Scale BESS + Solar Hybrid",
    tagline: "Utility-scale renewable energy storage, turnkey delivered",
    badge: "HIGHEST VALUE",
    price: "$1M+",
    includes: [
      "Containerized Grid-Scale BESS",
      "High-Capacity Containerized BESS",
      "Integrated Solar + BESS Skid System",
      "Commercial Solar Inverters",
      "Hybrid Solar + BESS Skid Systems",
    ],
    target: "Utility operators, renewable energy developers, industrial campuses",
  },
  {
    id: 4,
    icon: Building2,
    name: "Industrial Facility Power Package",
    tagline: "Full power infrastructure for manufacturing and industrial operations",
    badge: null,
    price: "$300K+",
    includes: [
      "Industrial Generator Sets",
      "Motor Control Centers",
      "Power Factor Correction Banks",
      "Modular Electrical Switchgear",
      "Grounding & Bonding Equipment",
      "Industrial Exhaust Systems",
    ],
    target: "Manufacturing plants, oil & gas facilities, heavy industrial",
  },
  {
    id: 5,
    icon: Wifi,
    name: "Telecom & 5G Infrastructure Package",
    tagline: "Reliable power for towers, base stations, and edge compute",
    badge: null,
    price: "$100K+",
    includes: [
      "Telecom & 5G Tower Battery Systems",
      "Auto Voltage Regulators",
      "Surge Protection Devices",
      "Armored Power Cable",
      "Control & Instrumentation Cable",
      "Weatherproof Enclosures",
    ],
    target: "Telecom operators, tower companies, 5G infrastructure builders",
  },
  {
    id: 6,
    icon: Globe,
    name: "Middle East Project Package",
    tagline: "Turnkey power infrastructure engineered for Gulf and MENA projects",
    badge: "GLOBAL REACH",
    price: "$750K+",
    includes: [
      "Industrial Generator Sets",
      "Medium Voltage Transformers",
      "Modular Electrical Switchgear",
      "Battery Energy Storage (BESS)",
      "Precision Air Conditioning",
      "Containerized Grid-Scale BESS",
    ],
    target: "EPC contractors, government projects, real estate developers in UAE, Saudi Arabia, Egypt",
  },
  {
    id: 7,
    icon: Car,
    name: "EV Charging Infrastructure Package",
    tagline: "Complete charging infrastructure for commercial and fleet operators",
    badge: null,
    price: "$200K+",
    includes: [
      "Commercial EV Charging Stations",
      "Mobile EV Charging Station with Integrated BESS",
      "Medium Voltage Transformers",
      "Busway & Busduct Systems",
      "Three-Phase Hybrid Solar Inverters",
    ],
    target: "Fleet operators, commercial real estate, municipalities, highway corridors",
  },
];

function BundleCard({ bundle }) {
  const Icon = bundle.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="glow-card flex flex-col h-full"
      style={{
        background: "rgba(8,8,8,0.92)",
        border: `1px solid ${hovered ? "rgba(232,99,26,0.55)" : "rgba(232,99,26,0.28)"}`,
        transition: "border-color 0.2s",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {bundle.badge && (
        <div
          className="absolute top-4 right-4 px-3 py-1 text-xs font-bold uppercase"
          style={{
            background: BRAND,
            color: "#fff",
            letterSpacing: "0.14em",
            fontFamily: MONO,
            borderRadius: 2,
          }}
        >
          {bundle.badge}
        </div>
      )}

      <div className="p-7 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              background: "rgba(232,99,26,0.08)",
              border: "1px solid rgba(232,99,26,0.22)",
            }}
          >
            <Icon size={20} style={{ color: BRAND }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold mb-1" style={{ color: BRAND, letterSpacing: "0.18em", fontFamily: MONO }}>
              BUNDLE {String(bundle.id).padStart(2, "0")}
            </p>
            <h3
              className="font-black leading-tight"
              style={{ fontFamily: HEADING, fontWeight: 800, fontSize: "1.15rem", color: "#fff", paddingRight: bundle.badge ? "6rem" : 0 }}
            >
              {bundle.name}
            </h3>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm mb-5" style={{ color: "#9CA3AF", lineHeight: 1.55 }}>
          {bundle.tagline}
        </p>

        {/* Price */}
        <div className="mb-5 flex items-baseline gap-2">
          <span className="text-xs font-semibold uppercase" style={{ color: "#6B7280", letterSpacing: "0.14em", fontFamily: MONO }}>
            Starting from
          </span>
          <span className="font-black text-2xl" style={{ fontFamily: HEADING, color: "#fff", letterSpacing: "-0.02em" }}>
            {bundle.price}
          </span>
        </div>

        {/* Included products */}
        <div className="mb-5 flex-1">
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: "#6B7280", letterSpacing: "0.18em", fontFamily: MONO }}>
            Includes
          </p>
          <ul className="flex flex-col gap-2">
            {bundle.includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: TEAL, fontSize: 10, lineHeight: "1.6" }}
                >
                  ▸
                </span>
                <span className="text-sm" style={{ color: TEAL, lineHeight: 1.5 }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Target buyer */}
        <div
          className="mb-6 px-4 py-3"
          style={{ background: "rgba(232,99,26,0.06)", borderLeft: `2px solid ${BRAND}` }}
        >
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: "#6B7280", letterSpacing: "0.14em", fontFamily: MONO }}>
            Ideal for
          </p>
          <p className="text-xs font-semibold" style={{ color: BRAND, lineHeight: 1.5 }}>
            {bundle.target}
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs mb-4" style={{ color: "#6B7280", lineHeight: 1.5, fontStyle: "italic" }}>
          All packages are configured to your exact specifications. Pricing varies by capacity, certification requirements, and delivery terms.
        </p>

        {/* CTA */}
        <a
          href={`/?package=${encodeURIComponent(bundle.name)}#rfq`}
          className="flex items-center justify-center gap-2 py-3.5 font-bold text-sm uppercase w-full transition-all duration-200"
          style={{
            background: BRAND,
            color: "#fff",
            letterSpacing: "0.14em",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
        >
          REQUEST QUOTE FOR THIS PACKAGE
          <ArrowRight size={13} />
        </a>
      </div>
    </div>
  );
}

function SolutionsHero() {
  return (
    <section
      style={{
        minHeight: "52vh",
        display: "flex",
        alignItems: "flex-end",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(rgba(5,8,15,0.75) 0%, rgba(5,8,15,0.88) 100%), url('/scene2-tower-storm.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
      }}
    >
      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Ambient light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 80%, rgba(232,99,26,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full pt-32">
        <p
          className="text-xs font-bold uppercase mb-5"
          style={{ color: BRAND, letterSpacing: "0.24em", fontFamily: MONO }}
        >
          ENGINEERED PACKAGES
        </p>
        <h1
          className="font-black leading-none mb-5"
          style={{
            fontFamily: HEADING,
            fontSize: "clamp(2.6rem,6vw,4.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            textShadow: "0 4px 24px rgba(0,0,0,0.7)",
          }}
        >
          TURNKEY POWER
          <br />
          <span style={{ color: BRAND }}>SOLUTIONS</span>
        </h1>
        <p
          className="max-w-xl"
          style={{
            color: "#9CA3AF",
            fontSize: "1.05rem",
            lineHeight: 1.65,
            textShadow: "0 2px 12px rgba(0,0,0,0.7)",
          }}
        >
          Engineered packages for the world's most demanding infrastructure projects. Seven turnkey bundles. Factory-direct pricing. Delivered to site.
        </p>
      </div>
    </section>
  );
}

function CustomPackageCTA() {
  return (
    <section
      className="py-20 px-6"
      style={{
        position: "relative",
        zIndex: 2,
        background: "linear-gradient(rgba(10,10,10,0.88), rgba(10,10,10,0.88)), url('/scene5-citywide.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <OrangeLine />
      <div className="max-w-3xl mx-auto pt-16 text-center">
        <p className="text-xs font-semibold uppercase mb-4" style={{ color: BRAND, letterSpacing: "0.22em", fontFamily: MONO }}>
          CUSTOM ENGINEERING
        </p>
        <h2
          className="font-black leading-tight mb-5"
          style={{ fontFamily: HEADING, fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          Can't find your exact package?
        </h2>
        <p className="mb-8 mx-auto max-w-lg" style={{ color: "#9CA3AF", lineHeight: 1.65 }}>
          We engineer custom solutions for any project scope. Tell us your capacity requirements, site conditions, timeline, and certifications — we'll build the package around your spec.
        </p>
        <a
          href="/#rfq"
          className="inline-flex items-center gap-3 px-8 py-4 font-bold text-sm uppercase transition-all duration-200"
          style={{
            background: BRAND,
            color: "#fff",
            clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
            letterSpacing: "0.16em",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
        >
          Contact Our Team
          <ArrowRight size={15} />
        </a>
        <p className="text-xs mt-6" style={{ color: "#9CA3AF", letterSpacing: "0.04em" }}>
          Direct inquiries:{" "}
          <a href="mailto:quotes@durbolt.com" style={{ color: BRAND, textDecoration: "none" }}>quotes@durbolt.com</a>
        </p>
      </div>
    </section>
  );
}

function SolutionsFooter() {
  return (
    <footer className="py-12 px-6" style={{ background: "#0A0A0A", borderTop: "1px solid rgba(44,82,130,0.15)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <span style={{ display: "block", width: "18px", height: "1.5px", background: "#E8631A", flexShrink: 0 }} />
              <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.12em", lineHeight: 1, color: "#FFFFFF", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility" }}>
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
              ["About", "/#about"],
              ["Divisions", "/#divisions"],
              ["Products", "/#products"],
              ["Solutions", "/solutions"],
              ["How It Works", "/#how-it-works"],
              ["Request Quote", "/#rfq"],
            ].map(([label, href]) =>
              href.startsWith("/") && !href.startsWith("/#") ? (
                <Link
                  key={href}
                  to={href}
                  className="text-xs font-semibold uppercase transition-colors duration-150"
                  style={{ color: BRAND, letterSpacing: "0.16em" }}
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={href}
                  href={href}
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

        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(44,82,130,0.1)" }}
        >
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

export default function SolutionsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  usePageMeta({
    title: "Turnkey Power Solutions | Durbolt Power — Data Center, Industrial & Grid-Scale Packages",
    description: "Complete power infrastructure packages for data centers, industrial facilities, telecom, and grid-scale projects. Factory-direct pricing. 7 engineered bundles starting from $100K.",
    canonical: "https://durbolt.com/solutions",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Durbolt Power Turnkey Solutions",
      "description": "Engineered power infrastructure packages for critical facilities",
      "url": "https://durbolt.com/solutions",
      "numberOfItems": 7,
    },
  });

  return (
    <div style={{ background: "#080F1A", color: "#fff", minHeight: "100vh" }}>
      <PageNavbar />
      <SolutionsHero />

      {/* Bundles grid */}
      <section
        className="py-20 px-6"
        style={{
          position: "relative",
          zIndex: 2,
          background: "linear-gradient(rgba(10,10,10,0.88), rgba(10,10,10,0.88)), url('/scene3-ground.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <OrangeLine />
        <div className="max-w-7xl mx-auto pt-16">
          <SectionLabel>7 ENGINEERED BUNDLES</SectionLabel>
          <h2
            className="font-black leading-none mb-4"
            style={{ fontFamily: HEADING, fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            The market's most in-demand
            <br />
            <span style={{ color: BRAND }}>power packages.</span>
          </h2>
          <p className="mb-14 max-w-2xl" style={{ color: "#9CA3AF", lineHeight: 1.65 }}>
            Each bundle is pre-engineered around the most common project configurations we see. Every package is fully configurable to your spec, certification requirements, and delivery terms.
          </p>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {BUNDLES.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </div>
      </section>

      <CustomPackageCTA />
      <SolutionsFooter />
    </div>
  );
}
