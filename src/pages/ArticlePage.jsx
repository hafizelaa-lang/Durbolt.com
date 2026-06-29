import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Menu, X, Mail, ArrowLeft } from "lucide-react";
import { ARTICLES } from "../data/articles.js";
import { DIVISIONS } from "../data/divisions.js";
import { toSlug, usePageMeta } from "../utils/seo.js";
import { DownloadPDFButton } from "../components/DownloadPDFButton.jsx";

const BRAND = "#E8631A";
const BRAND_DARK = "#CC5816";
const HEADING = "'Space Grotesk', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

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
              <a key={href} href={href} className="text-xs font-semibold uppercase transition-colors duration-200" style={{ color: "#E0E0E0", letterSpacing: "0.16em" }} onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}>{label}</a>
            )
          )}
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
    }}>
      {category}
    </span>
  );
}

function renderSection(section, idx) {
  switch (section.type) {
    case "pullquote":
      return (
        <blockquote
          key={idx}
          style={{
            borderLeft: "4px solid #E8631A",
            background: "rgba(232,99,26,0.06)",
            padding: "24px 32px",
            margin: "36px 0",
            fontStyle: "italic",
            fontSize: "1.15rem",
            lineHeight: 1.7,
            color: "#E0D0C8",
          }}
        >
          {section.heading && <p style={{ fontFamily: HEADING, fontWeight: 700, fontStyle: "normal", fontSize: "0.7rem", letterSpacing: "0.2em", color: BRAND, marginBottom: 12, textTransform: "uppercase" }}>{section.heading}</p>}
          {section.body}
        </blockquote>
      );

    case "callout":
      return (
        <div
          key={idx}
          style={{
            borderLeft: "4px solid #E8631A",
            background: "rgba(8,14,22,0.9)",
            border: "1px solid rgba(232,99,26,0.3)",
            borderLeftWidth: 4,
            padding: "20px 24px",
            margin: "32px 0",
          }}
        >
          {section.heading && (
            <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.2em", color: BRAND, marginBottom: 10, textTransform: "uppercase" }}>
              ⚡ {section.heading}
            </p>
          )}
          <p style={{ color: "#C8C8C8", fontSize: "0.92rem", lineHeight: 1.7, margin: 0 }}>{section.body}</p>
        </div>
      );

    case "bulletlist":
      return (
        <div key={idx} style={{ margin: "20px 0" }}>
          {section.heading && (
            <h3 style={{ fontFamily: HEADING, fontWeight: 700, fontSize: "1.4rem", color: "#fff", marginBottom: 16, marginTop: 0 }}>{section.heading}</h3>
          )}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {section.body.split("\n").filter((l) => l.trim()).map((line, i) => (
              <li key={i} style={{ display: "flex", gap: 12, marginBottom: 10, color: "#D4D4D4", fontSize: "17px", lineHeight: 1.85 }}>
                <span style={{ color: BRAND, flexShrink: 0, marginTop: 4, fontWeight: 700 }}>▸</span>
                <span>{line.replace(/^[-•▸]\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "specbox":
      return (
        <div
          key={idx}
          style={{
            background: "rgba(5,8,15,0.98)",
            border: "1px solid rgba(232,99,26,0.2)",
            margin: "32px 0",
            overflow: "hidden",
          }}
        >
          {section.heading && (
            <div style={{ background: "rgba(232,99,26,0.12)", borderBottom: "1px solid rgba(232,99,26,0.25)", padding: "10px 20px" }}>
              <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.2em", color: BRAND, margin: 0, textTransform: "uppercase" }}>{section.heading}</p>
            </div>
          )}
          <pre style={{ fontFamily: MONO, fontSize: "0.8rem", color: "#C8C8C8", padding: "16px 20px", margin: 0, overflowX: "auto", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {section.body}
          </pre>
        </div>
      );

    default:
      return (
        <div key={idx}>
          {section.heading && (
            <h3 style={{ fontFamily: HEADING, fontWeight: 700, fontSize: "1.4rem", color: "#fff", marginTop: 40, marginBottom: 16 }}>{section.heading}</h3>
          )}
          <p style={{ color: "#D4D4D4", fontSize: "17px", lineHeight: 1.85, marginBottom: 24, marginTop: 0 }}>{section.body}</p>
        </div>
      );
  }
}

function findProduct(name) {
  for (const div of DIVISIONS) {
    for (const p of div.products) {
      if (p.name === name) return { product: p, division: div };
    }
  }
  return null;
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [progress, setProgress] = useState(0);

  const article = ARTICLES.find((a) => a.slug === slug);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setProgress(height > 0 ? (scrollTop / height) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  usePageMeta(
    article
      ? {
          title: `${article.title} | Durbolt Power`,
          description: article.excerpt,
          canonical: `https://durbolt.com/blog/${article.slug}`,
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.excerpt,
            "image": article.heroImg,
            "author": { "@type": "Organization", "name": "Durbolt Power Editorial Team" },
            "publisher": { "@type": "Organization", "name": "Durbolt Power", "url": "https://durbolt.com" },
            "datePublished": article.date,
            "url": `https://durbolt.com/blog/${article.slug}`,
          },
        }
      : {
          title: "Article Not Found | Durbolt Power",
          description: "This article could not be found.",
          canonical: "https://durbolt.com/blog",
        }
  );

  const relatedArticles = article
    ? ARTICLES.filter((a) => a.slug !== slug && a.category === article.category).slice(0, 3).concat(
        ARTICLES.filter((a) => a.slug !== slug && a.category !== article.category)
      ).slice(0, 3)
    : [];

  if (!article) {
    return (
      <div style={{ background: "#050A0F", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
        <PageNavbar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
          <p style={{ fontFamily: MONO, color: "#555", letterSpacing: "0.15em", fontSize: "0.75rem", marginBottom: 24 }}>ARTICLE NOT FOUND</p>
          <Link to="/blog" style={{ color: BRAND, fontFamily: MONO, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textDecoration: "none" }}>← POWER INTELLIGENCE</Link>
        </div>
        <PageFooter />
      </div>
    );
  }

  return (
    <div style={{ background: "#050A0F", minHeight: "100vh", color: "#fff" }}>
      {/* Reading progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: 3,
          width: `${progress}%`,
          background: BRAND,
          zIndex: 99999,
          transition: "width 0.1s linear",
          boxShadow: `0 0 8px ${BRAND}`,
        }}
      />

      <PageNavbar />

      {/* Hero */}
      <div style={{ position: "relative", height: 520, overflow: "hidden", background: "#0A0A0A" }}>
        <img
          src={article.heroImg}
          alt={article.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(5,8,15,0.97) 0%, rgba(5,8,15,0.55) 50%, rgba(5,8,15,0.3) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0 32px 44px",
            maxWidth: 900,
          }}
        >
          <Link
            to="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#888",
              fontFamily: MONO,
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textDecoration: "none",
              marginBottom: 20,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = BRAND)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
          >
            <ArrowLeft size={12} /> POWER INTELLIGENCE
          </Link>
          <h1
            style={{
              fontFamily: HEADING,
              fontWeight: 900,
              fontSize: "clamp(1.6rem,3.5vw,2.6rem)",
              lineHeight: 1.15,
              color: "#fff",
              textShadow: "0 2px 20px rgba(0,0,0,0.8)",
              maxWidth: 820,
            }}
          >
            {article.title}
          </h1>
        </div>
      </div>

      {/* Metadata bar */}
      <div style={{ background: "rgba(8,8,8,0.98)", borderBottom: "1px solid rgba(232,99,26,0.12)", padding: "16px 32px" }}>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-4">
          <CategoryBadge category={article.category} />
          <span style={{ color: "#555", fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.1em" }}>{article.readTime} MIN READ</span>
          <span style={{ color: "#444", fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.08em" }}>
            {new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span style={{ color: "#555", fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.08em" }}>Durbolt Power Editorial Team</span>
        </div>
      </div>

      {/* Article body */}
      <article style={{ padding: "56px 32px 80px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          {/* Excerpt / lead */}
          <p style={{ fontSize: "1.15rem", lineHeight: 1.8, color: "#C8C8C8", marginBottom: 24, fontWeight: 500 }}>
            {article.excerpt}
          </p>

          {/* PDF download — top placement */}
          <div style={{ borderBottom: "1px solid rgba(232,99,26,0.12)", paddingBottom: 28, marginBottom: 40 }}>
            <DownloadPDFButton article={article} />
          </div>

          {/* Sections */}
          {(article.sections || []).map((section, idx) => renderSection(section, idx))}

          {/* Spec table */}
          {article.specTable && (
            <div style={{ margin: "48px 0", overflow: "hidden", border: "1px solid rgba(232,99,26,0.2)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: "0.8rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(232,99,26,0.15)", borderBottom: "1px solid rgba(232,99,26,0.3)" }}>
                      {article.specTable.headers.map((h, i) => (
                        <th key={i} style={{ padding: "12px 16px", textAlign: "left", color: BRAND, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.68rem" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {article.specTable.rows.map((row, ri) => (
                      <tr key={ri} style={{ borderBottom: "1px solid rgba(44,82,130,0.12)", background: ri % 2 === 0 ? "rgba(5,8,15,0.6)" : "rgba(8,14,22,0.4)" }}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={{ padding: "10px 16px", color: ci === 0 ? "#E0E0E0" : "#A0A0A0" }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pull quotes */}
          {article.pullQuotes && article.pullQuotes.length > 0 && (
            <div style={{ margin: "48px 0 32px" }}>
              {article.pullQuotes.slice(0, 1).map((q, i) => (
                <blockquote
                  key={i}
                  style={{
                    borderLeft: "4px solid #E8631A",
                    background: "rgba(232,99,26,0.06)",
                    padding: "24px 32px",
                    fontStyle: "italic",
                    fontSize: "1.2rem",
                    lineHeight: 1.7,
                    color: "#E0D0C8",
                    margin: 0,
                  }}
                >
                  "{q}"
                </blockquote>
              ))}
            </div>
          )}

          {/* Author block */}
          <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(232,99,26,0.15)" }}>
            <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.2em", color: BRAND, marginBottom: 8, textTransform: "uppercase" }}>About the Author</p>
            <p style={{ fontFamily: HEADING, fontWeight: 800, fontSize: "1rem", color: "#fff", marginBottom: 8 }}>Durbolt Power Editorial Team</p>
            <p style={{ color: "#888", fontSize: "0.88rem", lineHeight: 1.7, margin: 0 }}>
              Technical content produced in collaboration with field engineers and procurement specialists across North America and the Middle East.
            </p>
          </div>
        </div>
      </article>

      {/* PDF download — bottom placement */}
      <div style={{ padding: "0 32px 40px", background: "rgba(5,8,15,0.98)" }}>
        <div style={{ maxWidth: 740, margin: "0 auto", paddingTop: 32, borderTop: "1px solid rgba(232,99,26,0.15)" }}>
          <DownloadPDFButton article={article} />
        </div>
      </div>

      {/* Related Products */}
      {article.relatedProductNames && article.relatedProductNames.length > 0 && (
        <section style={{ padding: "64px 32px", background: "rgba(5,8,15,0.98)", borderTop: "1px solid rgba(232,99,26,0.12)" }}>
          <div style={{ maxWidth: 740, margin: "0 auto" }}>
            <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.22em", color: BRAND, marginBottom: 8, textTransform: "uppercase" }}>Related Products</p>
            <h2 style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.3rem", marginBottom: 28, color: "#fff" }}>Specify Your Project</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {article.relatedProductNames.slice(0, 3).map((name) => {
                const found = findProduct(name);
                if (!found) return null;
                const { product, division } = found;
                return (
                  <Link
                    key={name}
                    to={`/products/${toSlug(product.name)}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        background: "rgba(8,8,8,0.92)",
                        border: "1px solid rgba(232,99,26,0.2)",
                        padding: "20px",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                        height: "100%",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(232,99,26,0.55)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(232,99,26,0.07)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(232,99,26,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <p style={{ fontFamily: MONO, fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>{division.name}</p>
                      <p style={{ fontFamily: HEADING, fontWeight: 800, fontSize: "0.9rem", color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>{product.name}</p>
                      <p style={{ fontFamily: MONO, fontSize: "0.7rem", color: "#666", marginBottom: 12 }}>{product.spec.split(",")[0]}</p>
                      <span style={{ color: BRAND, fontFamily: MONO, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em" }}>VIEW PRODUCT →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section style={{ padding: "64px 32px", background: "rgba(8,8,8,0.98)", borderTop: "1px solid rgba(44,82,130,0.1)" }}>
          <div style={{ maxWidth: 740, margin: "0 auto" }}>
            <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.22em", color: BRAND, marginBottom: 8, textTransform: "uppercase" }}>Continue Reading</p>
            <h2 style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "1.3rem", marginBottom: 28, color: "#fff" }}>Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <Link key={rel.slug} to={`/blog/${rel.slug}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "#0d0d0d",
                      border: "1px solid rgba(232,99,26,0.2)",
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(232,99,26,0.55)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(232,99,26,0.2)")}
                  >
                    <div style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d0d", borderBottom: "1px solid rgba(232,99,26,0.12)" }}>
                      <p style={{ fontFamily: MONO, fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", color: BRAND, textTransform: "uppercase", margin: 0 }}>{rel.category}</p>
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: "0.85rem", color: "#E0E0E0", lineHeight: 1.35, marginBottom: 0 }}>{rel.title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section style={{ padding: "80px 32px", background: "rgba(5,8,15,0.98)", borderTop: "1px solid rgba(232,99,26,0.12)" }}>
        <div style={{ maxWidth: 740, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.25em", color: BRAND, marginBottom: 16, textTransform: "uppercase" }}>Ready to Specify Your Project?</p>
          <h2 style={{ fontFamily: HEADING, fontWeight: 900, fontSize: "clamp(1.6rem,3vw,2.4rem)", color: "#fff", marginBottom: 20 }}>Get a Quote in 24 Hours</h2>
          <p style={{ color: "#888", lineHeight: 1.7, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
            Our engineering team responds within 24 hours with pricing, lead times, and full technical documentation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/#rfq"
              style={{
                display: "inline-block",
                padding: "14px 36px",
                background: BRAND,
                color: "#fff",
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textDecoration: "none",
                textTransform: "uppercase",
                clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
            >
              Request Quote
            </a>
            <a
              href="mailto:quotes@durbolt.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#888",
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
            >
              <Mail size={13} /> quotes@durbolt.com
            </a>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
