const MONO = "'JetBrains Mono', ui-monospace, monospace";
const HEADING = "'Space Grotesk', sans-serif";
const BRAND = "#E8631A";

// ── Tier definitions ─────────────────────────────────────────────────────────

const TIERS = {
  standard: {
    label: "STANDARD PRODUCT LINE",
    range: "4–6 Weeks",
    rangeNote: "from confirmed order",
    copy: [
      "Every Durbolt product is manufactured to order. Your configuration enters our production pipeline upon order confirmation — we do not pull from warehouse stock.",
      "Each unit undergoes full pre-shipment quality verification and documentation review before release. Standard product lines carry a fulfillment window of ",
      "4–6 weeks",
      " from confirmed order. This is precision procurement — engineered for your load, tested before it ships, delivered to your door.",
    ],
  },
  mid: {
    label: "MID-COMPLEXITY SYSTEM",
    range: "6–10 Weeks",
    rangeNote: "from confirmed order",
    copy: [
      "Every Durbolt product is manufactured to order. Your configuration enters our production pipeline upon order confirmation — we do not pull from warehouse stock.",
      "Each unit undergoes full pre-shipment quality verification, functional testing, and documentation review before release. Mid-complexity systems carry a fulfillment window of ",
      "6–10 weeks",
      " from confirmed order. This is precision procurement — engineered for your load, tested before it ships, delivered to your door.",
    ],
  },
  high: {
    label: "HIGH-COMPLEXITY SYSTEM",
    range: "10–16 Weeks",
    rangeNote: "from confirmed order",
    copy: [
      "Every Durbolt product is manufactured to order. Your configuration enters our production pipeline upon order confirmation — we do not pull from warehouse stock.",
      "Each unit undergoes full pre-shipment quality verification, functional load testing, and documentation review before release. High-complexity systems carry a fulfillment window of ",
      "10–16 weeks",
      " from confirmed order. This is precision procurement — engineered for your load, tested before it ships, delivered to your door.",
    ],
  },
  utility: {
    label: "UTILITY / GRID-SCALE",
    range: "Quoted Per Project",
    rangeNote: "based on configuration and scope",
    copy: [
      "Every Durbolt product is manufactured to order. Your configuration enters our production pipeline upon order confirmation — we do not pull from warehouse stock.",
      "Each unit undergoes full pre-shipment quality verification, functional load testing, and a complete documentation package before release. Utility-scale and grid infrastructure systems are quoted per project scope — lead times are defined at contract stage based on capacity, configuration, and site requirements. ",
      "This is precision procurement",
      " — engineered for your load, tested before it ships, delivered to your door.",
    ],
  },
};

// ── Product → tier map ───────────────────────────────────────────────────────

const PRODUCT_TIERS = {
  // Standard (4–6 weeks): cable, conduit, trays, grounding, busbars, EV chargers, fuel tanks, SPDs, enclosures
  "ADSS Fiber Optic Cable":                           "standard",
  "GYXTW Fiber Optic Cable":                          "standard",
  "Drop Fiber Optic Cable":                           "standard",
  "Armored Power Cable":                              "standard",
  "Medium Voltage Cable":                             "standard",
  "Control & Instrumentation Cable":                  "standard",
  "Cable Trays & Ladder Racks":                       "standard",
  "Grounding & Bonding Equipment":                    "standard",
  "Conduit Systems":                                  "standard",
  "Copper Busbar":                                    "standard",
  "Commercial EV Charging Stations":                  "standard",
  "Diesel Fuel Storage Tanks":                        "standard",
  "Surge Protection Devices":                         "standard",
  "Weatherproof Enclosures":                          "standard",

  // Mid-complexity (6–10 weeks): inverters, chillers, cooling towers, UPS, batteries, AVRs, ATS, etc.
  "Industrial UPS Systems":                           "mid",
  "Auto Voltage Regulators":                          "mid",
  "Industrial Chillers":                              "mid",
  "Cooling Towers":                                   "mid",
  "Precision Air Conditioning":                       "mid",
  "Commercial Solar Inverters":                       "mid",
  "Three-Phase Hybrid Solar Inverters":               "mid",
  "Power Factor Correction Banks":                    "mid",
  "Voltage Regulators & Stabilizers":                 "mid",
  "Industrial Exhaust Systems":                       "mid",
  "Lithium Battery Modules":                          "mid",
  "Telecom & 5G Tower Battery Systems":               "mid",
  "Automatic Transfer Switches":                      "mid",
  "Manual Transfer Switches":                         "mid",
  "Load Banks":                                       "mid",
  "Residential Energy Storage Systems":               "mid",

  // High-complexity (10–16 weeks): generators, switchgear, transformers, BESS, skids
  "Industrial Generator Sets":                        "high",
  "Modular Electrical Switchgear":                    "high",
  "Motor Control Centers (MCC)":                      "mid",
  "Busway & Busduct Systems":                         "mid",
  "Medium Voltage Transformers":                      "high",
  "Isolation Transformers":                           "high",
  "Modular Data Center Power Skids":                  "high",
  "Battery Energy Storage (BESS)":                    "high",
  "Liquid-Cooled Industrial BESS Cabinet":            "high",
  "Integrated Solar + BESS Skid System":              "high",
  "Mobile EV Charging Station with Integrated BESS":  "mid",
  "Hybrid Solar + BESS Skid Systems":                 "high",

  // Utility / grid-scale: per-project lead time
  "Containerized Grid-Scale BESS":                    "utility",
  "High-Capacity Containerized BESS":                 "utility",
};

export function getLeadTimeTier(productName) {
  return PRODUCT_TIERS[productName] || "mid";
}

// ── Process steps (shared copy) ──────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Order Confirmation",
    body: "Configuration locked, BOM generated, production slot reserved within 5 business days.",
  },
  {
    num: "02",
    title: "Manufacturing Pipeline",
    body: "Production scheduled, components sourced, assembly and testing initiated to Durbolt specification.",
  },
  {
    num: "03",
    title: "Pre-Shipment QC",
    body: "Functional load test, performance verification, documentation package assembled and reviewed.",
  },
  {
    num: "04",
    title: "DDP Delivery",
    body: "Shipped to your facility fully documented — duties, freight, and customs managed end-to-end.",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function FulfillmentSection({ product, division }) {
  const tierKey = getLeadTimeTier(product.name);
  const tier = TIERS[tierKey];
  const [p1, pre, highlight, post] = tier.copy;

  return (
    <section
      style={{
        background: "rgba(5,8,15,0.99)",
        borderTop: `3px solid ${BRAND}`,
        borderBottom: "1px solid rgba(44,82,130,0.15)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid texture */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(232,99,26,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,99,26,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-20" style={{ position: "relative", zIndex: 1 }}>

        {/* Section label */}
        <p
          className="text-xs font-bold uppercase mb-12"
          style={{ color: BRAND, letterSpacing: "0.28em", fontFamily: MONO }}
        >
          PRODUCTION & FULFILLMENT
        </p>

        <div className="grid lg:grid-cols-5 gap-16 items-start">

          {/* ── LEFT: Process timeline (2 cols) ── */}
          <div className="lg:col-span-2">
            <h2
              className="font-black mb-10"
              style={{ fontFamily: HEADING, fontSize: "clamp(1.3rem,2.5vw,1.75rem)", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.2 }}
            >
              From your order to<br />
              <span style={{ color: BRAND }}>your facility.</span>
            </h2>

            <div style={{ position: "relative" }}>
              {/* Vertical connector line */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 15,
                  top: 8,
                  bottom: 8,
                  width: 1,
                  background: `linear-gradient(to bottom, ${BRAND}88, ${BRAND}22)`,
                }}
              />

              <div className="flex flex-col gap-0">
                {STEPS.map((step, i) => (
                  <div key={step.num} className="flex gap-5" style={{ paddingBottom: i < STEPS.length - 1 ? 28 : 0 }}>
                    {/* Indicator */}
                    <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          border: `1.5px solid ${BRAND}`,
                          background: "rgba(5,8,15,0.99)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontFamily: MONO, fontSize: "9px", fontWeight: 700, color: BRAND, letterSpacing: "0.05em" }}>
                          {step.num}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ paddingTop: 4 }}>
                      <p
                        className="font-bold mb-1"
                        style={{ fontFamily: HEADING, fontSize: "0.85rem", fontWeight: 700, color: "#fff", letterSpacing: "0.01em" }}
                      >
                        {step.title}
                      </p>
                      <p style={{ fontFamily: MONO, fontSize: "11px", color: "#666", lineHeight: 1.6 }}>
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Copy + lead time callout (3 cols) ── */}
          <div className="lg:col-span-3">

            {/* Tier badge */}
            <div
              className="inline-flex items-center gap-2 mb-6 px-3 py-1"
              style={{
                background: `${BRAND}14`,
                border: `1px solid ${BRAND}44`,
                fontFamily: MONO,
                fontSize: "10px",
                fontWeight: 700,
                color: BRAND,
                letterSpacing: "0.18em",
              }}
            >
              {tier.label}
            </div>

            <h3
              className="font-black mb-5"
              style={{ fontFamily: HEADING, fontSize: "clamp(1.3rem,2.5vw,1.75rem)", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.01em" }}
            >
              Every unit built to<br />your specification.
            </h3>

            {/* Copy paragraphs */}
            <p style={{ fontFamily: MONO, fontSize: "12px", color: "#888", lineHeight: 1.8, marginBottom: 12 }}>
              {p1}
            </p>
            <p style={{ fontFamily: MONO, fontSize: "12px", color: "#888", lineHeight: 1.8, marginBottom: 28 }}>
              {pre}
              <span style={{ color: "#fff", fontWeight: 700 }}>{highlight}</span>
              {post}
            </p>

            {/* Lead time callout */}
            <div
              style={{
                border: `1px solid ${BRAND}55`,
                background: `${BRAND}0a`,
                padding: "20px 24px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p style={{ fontFamily: MONO, fontSize: "9px", fontWeight: 700, color: BRAND, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4 }}>
                  ESTIMATED LEAD TIME
                </p>
                <p style={{ fontFamily: HEADING, fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 900, color: BRAND, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {tier.range}
                </p>
                <p style={{ fontFamily: MONO, fontSize: "10px", color: "#666", marginTop: 4, letterSpacing: "0.08em" }}>
                  {tier.rangeNote}
                </p>
                {tierKey !== "utility" && (
                  <p style={{ fontFamily: MONO, fontSize: "10px", color: "#555", marginTop: 8, lineHeight: 1.5, maxWidth: 220 }}>
                    For large volume orders or custom configurations, extended lead times apply. Contact us for a project-specific timeline.
                  </p>
                )}
              </div>
              <div
                style={{
                  width: 1,
                  alignSelf: "stretch",
                  background: `${BRAND}33`,
                  flexShrink: 0,
                  minHeight: 48,
                }}
              />
              <div style={{ flex: 1, minWidth: 160 }}>
                {[
                  "24hr quote turnaround",
                  "Factory Acceptance Test (FAT) included",
                  "Full certification documentation package",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2 mb-1.5">
                    <span style={{ color: BRAND, fontFamily: MONO, fontSize: "11px", flexShrink: 0, marginTop: 1 }}>▸</span>
                    <span style={{ fontFamily: MONO, fontSize: "11px", color: "#C8C8C8", lineHeight: 1.4 }}>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom fact strip */}
            <div
              className="grid grid-cols-3 gap-px"
              style={{ background: "rgba(44,82,130,0.2)" }}
            >
              {[
                ["SUPPLY MODEL", "Built-to-Order, No Stock"],
                ["FULFILLMENT", "DDP / FOB / CIF Available"],
                ["DOCUMENTATION", "Test Reports + COC Included"],
              ].map(([label, value]) => (
                <div key={label} style={{ background: "rgba(5,8,15,0.99)", padding: "12px 14px" }}>
                  <p style={{ fontFamily: MONO, fontSize: "8px", fontWeight: 700, color: "#555", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 3 }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 600, color: "#E0E0E0" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
