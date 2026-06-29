import { useState } from "react";
import { generateArticlePDF } from "../utils/generatePDF.js";

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const BRAND = "#E8631A";

export function DownloadPDFButton({ article }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await generateArticlePDF(article);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        background: "none",
        border: "none",
        borderBottom: `1px solid transparent`,
        padding: "2px 0",
        cursor: loading ? "wait" : "pointer",
        fontFamily: MONO,
        fontSize: "10px",
        fontWeight: 700,
        color: loading ? "rgba(232,99,26,0.5)" : BRAND,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        transition: "border-color 0.2s, color 0.2s",
        display: "inline-block",
      }}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.borderBottomColor = BRAND;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderBottomColor = "transparent";
      }}
    >
      {loading ? "GENERATING PDF..." : "DOWNLOAD TECHNICAL BRIEF ↓"}
    </button>
  );
}
