import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Mail } from "lucide-react";
import { useEffect } from "react";
import { ARTICLES } from "../data/articles.js";
import { usePageMeta } from "../utils/seo.js";

const BRAND = "#E8631A";
const BRAND_DARK = "#CC5816";
const HEADING = "'Space Grotesk', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const CATEGORIES = ["ALL", "BUYER'S GUIDE", "TECHNICAL", "MARKET INTELLIGENCE", "REGIONAL", "INDUSTRY TRENDS"];

function PageNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    ["About", "/#about"],
    ["Divisions", "/#divisions"],
    ["Products", "/#products"],
    ["Solutions", "/solutions"],
    ["Resources", "/blog"],
    ["How It Works", "/#how-it-works"],
    ["Contact", "/#rfq"],
  ];

  return (
    <>
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
          <span style={{ display: "block", width: "28px", height: "2px", background: BRAND, flexShrink: 0 }} />
          <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.18em", lineHeight: 1, color: "#FFFFFF" }}>
            DURBOLT <span style={{ color: BRAND }}>POWER</span>
          </span>
          <span style={{ display: "block", width: "28px", height: "2px", background: BRAND, flexShrink: 0 }} />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(([label, href]) =>
            href.startsWith("/") && !href.startsWith("/#") ? (
              <Link
                key={href}
                to={href}
                className="text-xs font-semibold uppercase transition-colors duration-200"
                style={{ color: "#E0E0E0", letterSpacing: "0.16em", textDecoration: "none" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
              >
                {label}
              </Link>
            ) : (
              <a
                key={href}
                href={href}
                className="text-xs font-semibold uppercase transition-colors duration-200"
                style={{ color: "#E0E0E0", letterSpacing: "0.16em" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
              >
                {label}
              </a>
            )
          )}
          <a
            href="/#rfq"
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
    {mobileOpen && (
      <>
        <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "transparent" }} onClick={() => setMobileOpen(false)} />
        <div style={{ position: "fixed", top: 0, right: 0, height: "100dvh", width: "82%", maxWidth: 340, background: "rgba(8,14,22,0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderLeft: "1px solid rgba(232,99,26,0.2)", zIndex: 50, display: "flex", flexDirection: "column" }}>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "#fff", fontSize: "24px", lineHeight: 1, padding: 0, cursor: "pointer" }}
          >
            ×
          </button>
          <div className="px-6 pt-24 flex flex-col gap-6 flex-1">
            {navLinks.map(([label, href]) =>
              href.startsWith("/") && !href.startsWith("/#") ? (
                <Link key={href} to={href} className="text-sm font-bold uppercase" style={{ color: "#E0E0E0", letterSpacing: "0.16em", textDecoration: "none" }} onClick={() => setMobileOpen(false)}>{label}</Link>
              ) : (
                <a key={href} href={href} className="text-sm font-bold uppercase" style={{ color: "#E0E0E0", letterSpacing: "0.16em" }} onClick={() => setMobileOpen(false)}>{label}</a>
              )
            )}
          </div>
          <div className="p-6">
            <a href="/#rfq" className="block py-3 text-xs font-bold uppercase text-center" style={{ background: BRAND, color: "#fff", letterSpacing: "0.16em" }} onClick={() => setMobileOpen(false)}>Request a Quote</a>
          </div>
        </div>
      </>
    )}
    </>
  );
}

function PageFooter() {
  return (
    <footer className="py-12 px-6" style={{ background: "#0A0A0A", borderTop: "1px solid rgba(44,82,130,0.15)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <span style={{ display: "block", width: "28px", height: "2px", background: BRAND, flexShrink: 0 }} />
              <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.18em", lineHeight: 1, color: "#FFFFFF" }}>
                DURBOLT <span style={{ color: BRAND }}>POWER</span>
              </span>
              <span style={{ display: "block", width: "28px", height: "2px", background: BRAND, flexShrink: 0 }} />
            </Link>
            <p className="text-xs max-w-xs" style={{ color: "#C8C8C8" }}>Critical power and connectivity infrastructure. U.S.-based. B2B only.</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[["About", "/#about"], ["Divisions", "/#divisions"], ["Products", "/#products"], ["Resources", "/blog"], ["Request Quote", "/#rfq"]].map(([label, href]) =>
              href.startsWith("/") && !href.startsWith("/#") ? (
                <Link key={href} to={href} className="text-xs font-semibold uppercase transition-colors duration-150" style={{ color: "#E0E0E0", letterSpacing: "0.16em", textDecoration: "none" }} onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}>{label}</Link>
              ) : (
                <a key={href} href={href} className="text-xs font-semibold uppercase transition-colors duration-150" style={{ color: "#E0E0E0", letterSpacing: "0.16em" }} onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}>{label}</a>
              )
            )}
          </div>
        </div>
        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(44,82,130,0.1)" }}>
          <p className="text-xs font-semibold" style={{ color: "#E0E0E0", letterSpacing: "0.16em", fontFamily: MONO }}>© 2026 DURBOLT POWER. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-2">
            <Mail size={11} style={{ color: "#E0E0E0" }} />
            <a href="mailto:info@durbolt.com" className="text-xs font-semibold" style={{ color: "#E0E0E0", letterSpacing: "0.16em", fontFamily: MONO, textDecoration: "none" }}>info@durbolt.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function CategoryBadge({ category }) {
  return (
    <span style={{
      background: "rgba(232,99,26,0.15)",
      border: "1px solid rgba(232,99,26,0.4)",
      color: BRAND,
      fontFamily: MONO,
      fontSize: "0.62rem",
      fontWeight: 700,
      letterSpacing: "0.18em",
      padding: "3px 8px",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      {category}
    </span>
  );
}

function ArticleCard({ article }) {
  return (
    <Link to={`/blog/${article.slug}`} style={{ textDecoration: "none" }}>
      <div
        className="h-full flex flex-col"
        style={{
          background: "rgba(8,8,8,0.92)",
          border: "1px solid rgba(232,99,26,0.25)",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(232,99,26,0.6)";
          e.currentTarget.style.boxShadow = "0 0 24px rgba(232,99,26,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(232,99,26,0.25)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={{ height: 72, background: "#0d0d0d", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(232,99,26,0.1)" }}>
          <span style={{ fontFamily: MONO, fontSize: "9px", fontWeight: 700, color: BRAND, letterSpacing: "0.35em", textTransform: "uppercase" }}>
            {article.category}
          </span>
        </div>
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <CategoryBadge category={article.category} />
            <span style={{ color: "#555", fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.1em" }}>
              {article.readTime} MIN READ
            </span>
          </div>
          <h3 className="font-black leading-tight mb-2" style={{ fontFamily: HEADING, fontSize: "0.95rem", color: "#fff", lineHeight: 1.35 }}>
            {article.title}
          </h3>
          <p className="text-sm flex-1" style={{ color: "#888", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {article.excerpt}
          </p>
          <div className="mt-4" style={{ color: BRAND, fontFamily: MONO, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em" }}>
            READ ARTICLE →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("ALL");

  usePageMeta({
    title: "Power Intelligence Hub | Durbolt Power — Critical Infrastructure Insights",
    description: "Technical guides, buyer's guides, and market intelligence for critical power infrastructure professionals. Generators, BESS, switchgear, UPS, and more.",
    canonical: "https://durbolt.com/blog",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Power Intelligence Hub",
      "url": "https://durbolt.com/blog",
      "publisher": { "@type": "Organization", "name": "Durbolt Power", "url": "https://durbolt.com" },
      "description": "Technical insights and market intelligence for critical infrastructure professionals",
    },
  });

  const filtered = activeCategory === "ALL" ? ARTICLES : ARTICLES.filter((a) => a.category === activeCategory);
  const [featured, ...rest] = filtered;

  return (
    <div style={{ background: "#050A0F", minHeight: "100vh", color: "#fff" }}>
      <PageNavbar />

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(rgba(5,8,15,0.88), rgba(5,8,15,0.95)), url('/scene2-tower-storm.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "140px 24px 72px",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p style={{ fontFamily: MONO, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.28em", color: BRAND, marginBottom: 20, textTransform: "uppercase" }}>
            DURBOLT POWER ——
          </p>
          <h1
            style={{
              fontFamily: HEADING,
              fontWeight: 900,
              fontSize: "clamp(2.4rem,5vw,4.2rem)",
              letterSpacing: "-0.02em",
              marginBottom: 20,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            Power Intelligence
          </h1>
          <p style={{ color: "#C8C8C8", maxWidth: 560, fontSize: "1.05rem", lineHeight: 1.75 }}>
            Technical insights and market intelligence for critical infrastructure professionals
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(232,99,26,0.12)", background: "rgba(5,8,15,0.98)" }}>
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 16px",
                fontFamily: MONO,
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                border: activeCategory === cat ? "1px solid rgba(232,99,26,0.8)" : "1px solid rgba(255,255,255,0.1)",
                background: activeCategory === cat ? "rgba(232,99,26,0.12)" : "transparent",
                color: activeCategory === cat ? BRAND : "#666",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if (activeCategory !== cat) { e.currentTarget.style.color = "#E0E0E0"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; } }}
              onMouseLeave={(e) => { if (activeCategory !== cat) { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; } }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {ARTICLES.length === 0 ? (
        <div style={{ padding: "120px 24px", textAlign: "center" }}>
          <p style={{ fontFamily: MONO, color: "#444", letterSpacing: "0.1em", fontSize: "0.8rem" }}>LOADING ARTICLES...</p>
        </div>
      ) : (
        <>
          {/* Featured article */}
          {featured && (
            <section style={{ padding: "56px 24px 40px", background: "rgba(5,8,15,0.98)" }}>
              <div className="max-w-7xl mx-auto">
                <p style={{ fontFamily: MONO, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", color: "#444", marginBottom: 20, textTransform: "uppercase" }}>
                  Featured Article
                </p>
                <Link to={`/blog/${featured.slug}`} style={{ textDecoration: "none" }}>
                  <div
                    className="overflow-hidden"
                    style={{
                      background: "rgba(8,8,8,0.92)",
                      border: "1px solid rgba(232,99,26,0.25)",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(232,99,26,0.6)";
                      e.currentTarget.style.boxShadow = "0 0 40px rgba(232,99,26,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(232,99,26,0.25)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div>
                      <div style={{ height: 72, background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(232,99,26,0.1)" }}>
                        <span style={{ fontFamily: MONO, fontSize: "9px", fontWeight: 700, color: BRAND, letterSpacing: "0.35em", textTransform: "uppercase" }}>
                          {featured.category}
                        </span>
                      </div>
                      <div style={{ padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div className="flex items-center gap-3 mb-5 flex-wrap">
                          <CategoryBadge category={featured.category} />
                          <span style={{ color: "#555", fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.1em" }}>
                            {featured.readTime} MIN READ
                          </span>
                        </div>
                        <h2
                          style={{
                            fontFamily: HEADING,
                            fontWeight: 900,
                            fontSize: "clamp(1.3rem,2.5vw,1.9rem)",
                            color: "#fff",
                            lineHeight: 1.25,
                            marginBottom: 16,
                          }}
                        >
                          {featured.title}
                        </h2>
                        <p style={{ color: "#888", lineHeight: 1.75, marginBottom: 28, fontSize: "0.95rem" }}>
                          {featured.excerpt}
                        </p>
                        <div style={{ color: BRAND, fontFamily: MONO, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em" }}>
                          READ FULL ARTICLE →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* Article grid */}
          {rest.length > 0 && (
            <section style={{ padding: "8px 24px 96px", background: "rgba(5,8,15,0.98)" }}>
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {rest.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <PageFooter />
    </div>
  );
}
