#!/usr/bin/env node
/**
 * Batch outreach sender — Batch 1
 * BCC: sales@durbolt.com on every send
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load env
for (const line of readFileSync(join(ROOT, ".env"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) { console.error("RESEND_API_KEY not set"); process.exit(1); }

const BCC = ["sales@durbolt.com"];
const FROM = "sales@durbolt.com";
const DELAY_MS = 8000;

// ─── Personalised HTML builder ───────────────────────────────────────────────

function buildHtml({ companyName, contactName, intro1, intro2, closingLine }) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Durbolt Power — Critical Power Infrastructure</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f4;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:24px 0;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e8e8e8;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:#080F1A;padding:60px 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <img
                      src="https://i.ibb.co/Q7f5CDdT/D2-F79-BA4-D0-F2-42-F5-9-F8-B-9-C0-ACB270-BC3.png"
                      alt="Durbolt D"
                      height="52"
                      width="auto"
                      style="display:block;height:52px;width:auto;border:0;outline:none;text-decoration:none;"
                    />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:0.14em;color:#E8631A;white-space:nowrap;">&#8212;</span><span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:0.14em;color:#ffffff;white-space:nowrap;"> DURBOLT </span><span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:0.14em;color:#E8631A;">POWER &#8212;</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 48px;">

              <p style="margin:0 0 24px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#E8631A;line-height:1;">CRITICAL POWER INFRASTRUCTURE</p>

              <p style="margin:0 0 28px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#2a2a2a;line-height:1.8;">${intro1}</p>

              <!-- Stats row -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px 0;border-top:1px solid #f0f0f0;border-bottom:1px solid #f0f0f0;">
                <tr>
                  <td align="center" style="padding:32px 8px;width:33.33%;">
                    <p style="margin:0 0 6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:700;color:#080F1A;line-height:1;">20+</p>
                    <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#999999;line-height:1;">YEARS</p>
                  </td>
                  <td align="center" style="padding:32px 8px;width:33.33%;border-left:1px solid #f0f0f0;border-right:1px solid #f0f0f0;">
                    <p style="margin:0 0 6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:700;color:#080F1A;line-height:1;">500+</p>
                    <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#999999;line-height:1;">PROJECTS</p>
                  </td>
                  <td align="center" style="padding:32px 8px;width:33.33%;">
                    <p style="margin:0 0 6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:700;color:#080F1A;line-height:1;">50+</p>
                    <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#999999;line-height:1;">COUNTRIES</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#2a2a2a;line-height:1.8;">${intro2}</p>

              <p style="margin:0 0 32px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#2a2a2a;line-height:1.8;">We are selectively expanding our network of procurement partners and project clients across key markets. If your organization sources, specifies, or deploys power infrastructure at scale, we would welcome the conversation.</p>

              <!-- Catalogue block -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:85%;margin:0 auto 32px auto;background-color:#080F1A;border-left:3px solid #E8631A;">
                <tr>
                  <td style="padding:20px;border-radius:2px;">
                    <p style="margin:0 0 8px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#E8631A;line-height:1;">2025 PRODUCT CATALOGUE</p>
                    <p style="margin:0 0 18px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#888888;line-height:1.7;">44 product lines across 4 divisions &#8212; generators, switchgear, BESS, cooling, transformers, UPS and more.</p>
                    <p style="margin:0;">
                      <a href="https://durbolt.com/catalogue/durbolt-power-catalogue-2025.pdf" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.08em;color:#E8631A;text-decoration:none;">&#8594; Download Catalogue</a>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#2a2a2a;line-height:1.8;">${closingLine}</p>

              <!-- Sign-off -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;color:#1a1a1a;line-height:1.5;">Durbolt Power &#8212; Procurement &amp; Supply Chain</p>
                    <p style="margin:0 0 6px 0;">
                      <a href="mailto:sales@durbolt.com" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#E8631A;text-decoration:none;">sales@durbolt.com</a>
                    </p>
                    <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#888888;line-height:1.5;">durbolt.com &nbsp;&#183;&nbsp; +1 (609) 369-0422</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="height:1px;background-color:#f0f0f0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color:#080F1A;padding:32px 48px;">
              <p style="margin:0 0 6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#ffffff;line-height:1;">DURBOLT POWER</p>
              <p style="margin:0 0 16px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#555555;line-height:1;">Critical Power Infrastructure &nbsp;&#183;&nbsp; durbolt.com</p>
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:9px;color:#333333;line-height:1.6;">&#169; 2025 Durbolt Power. This message was sent to this address. To unsubscribe reply with REMOVE.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─── Recipients ──────────────────────────────────────────────────────────────

const recipients = [
  // ── US TARGETS ──────────────────────────────────────────────────────────────
  {
    to: "procurement@vantagedatacenters.com",
    contactName: "Procurement Team",
    companyName: "Vantage Data Centers",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to hyperscale data center operators, EPC contractors, and industrial facilities across North America and the Middle East. We understand that facilities at the scale of Vantage Data Centers demand uncompromising reliability in every layer of the power stack.",
    intro2: "Our product range covers the full data center power chain &#8212; N+1 and 2N industrial UPS systems, standby and prime-rated diesel generators, precision cooling, medium-voltage switchgear, transformers, and grid-scale BESS &#8212; supplied factory-direct with DDP fulfillment and full project documentation.",
    closingLine: "If your team is evaluating vendors for upcoming capacity expansions or redundancy upgrades, we would be glad to provide specifications and pricing.",
  },
  {
    to: "procurement@equinix.com",
    contactName: "Procurement Team",
    companyName: "Equinix",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to colocation operators, hyperscale tenants, and data center developers across North America and the Middle East. We recognize that Equinix operates at a scale where power redundancy and uptime are non-negotiable.",
    intro2: "Our product range covers the full colocation power stack &#8212; industrial UPS systems, standby generators, precision cooling, medium-voltage switchgear, and BESS &#8212; supplied factory-direct with DDP fulfillment and full project documentation. With industry lead times on transformers and switchgear stretching 18&#8211;36 months, our supply chain is built to move faster.",
    closingLine: "If your procurement or facilities team is evaluating suppliers for upcoming capacity expansions, we would welcome the conversation.",
  },
  {
    to: "procurement@digitalrealty.com",
    contactName: "Procurement Team",
    companyName: "Digital Realty",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to global data center operators and their development teams. We understand that Digital Realty&#8217;s portfolio demands consistent, spec-grade equipment across multiple jurisdictions and power environments.",
    intro2: "Our product range covers generators, industrial UPS, MV transformers, switchgear, precision cooling, and grid-scale BESS &#8212; all sourced factory-direct with full technical documentation and DDP delivery. Current industry backlogs on MV transformers and switchgear are running 18&#8211;36 months &#8212; we offer a faster path.",
    closingLine: "If your team has upcoming infrastructure projects where lead times or sourcing flexibility are a concern, we would be glad to provide specifications and pricing.",
  },
  {
    to: "procurement@cyrusone.com",
    contactName: "Procurement Team",
    companyName: "CyrusOne",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to AI-ready data center operators building the next generation of compute capacity. We understand CyrusOne&#8217;s growth trajectory demands a reliable, fast-moving supply chain across every layer of the power stack.",
    intro2: "Our portfolio includes high-density precision cooling, N+1 and 2N UPS systems, standby generators, BESS, and MV switchgear &#8212; supplied factory-direct with full technical documentation. With cooling and switchgear lead times under significant pressure industry-wide, our sourcing model is built for speed.",
    closingLine: "If your team is evaluating power infrastructure suppliers for upcoming builds or expansions, we would welcome the opportunity to provide specifications.",
  },
  {
    to: "procurement@dpr.com",
    contactName: "Procurement Team",
    companyName: "DPR Construction",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to EPC contractors and construction firms executing data center, industrial, and mission-critical projects across North America. We understand that DPR&#8217;s project timelines demand reliable sourcing partners who can deliver on schedule.",
    intro2: "Our product range includes modular power skids, switchgear, motor control centers, busway systems, automatic transfer switches, and MV transformers &#8212; all sourced factory-direct with full project documentation and DDP fulfillment. On projects where lead times are critical, we offer faster turnaround than standard channel.",
    closingLine: "If your team has upcoming projects where power infrastructure sourcing is on the critical path, we would be glad to discuss how we can support your timeline.",
  },
  {
    to: "procurement@turnerconstruction.com",
    contactName: "Procurement Team",
    companyName: "Turner Construction",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to construction firms and EPC contractors executing mission-critical and data center projects. We understand that Turner&#8217;s project delivery standards demand suppliers who can perform at scale and on schedule.",
    intro2: "Our product range includes modular power skids, switchgear, MCC, busway systems, transfer switches, and transformers &#8212; factory-direct with full technical documentation. With switchgear and transformer lead times currently stretching 18&#8211;36 months industry-wide, our supply chain is structured to move faster.",
    closingLine: "If your team has active or upcoming projects where power infrastructure sourcing is time-sensitive, we would welcome a brief conversation.",
  },
  {
    to: "datacenter-procurement@amazon.com",
    contactName: "Infrastructure Procurement",
    companyName: "AWS",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to hyperscale cloud operators building and expanding data center campuses globally. We understand that AWS infrastructure demands spec-grade, reliable equipment across generators, UPS, cooling, and grid interconnection.",
    intro2: "Our portfolio covers the full hyperscale power stack &#8212; standby and prime-rated generators, N+1 industrial UPS, MV transformers, switchgear, precision cooling, and containerized grid-scale BESS &#8212; supplied factory-direct with DDP fulfillment and full technical documentation. With MV transformer lead times running 24&#8211;36 months industry-wide, we offer an alternative path.",
    closingLine: "If AWS infrastructure or procurement teams are evaluating new suppliers for upcoming capacity builds, we would welcome the opportunity to provide specifications and pricing.",
  },
  {
    to: "procurement@nexteraenergy.com",
    contactName: "Procurement Team",
    companyName: "NextEra Energy",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to utility operators, IPPs, and grid-scale energy developers across North America. We understand that NextEra&#8217;s project pipeline demands reliable sourcing across transmission, generation, and storage infrastructure.",
    intro2: "Our product range includes grid-scale BESS, MV and HV transformers, medium-voltage switchgear, and power conversion systems &#8212; all sourced factory-direct with full technical and compliance documentation. With transformer lead times under significant pressure industry-wide, our supply chain offers a faster and more flexible path.",
    closingLine: "If your procurement or project development teams are evaluating infrastructure suppliers for upcoming utility or storage projects, we would be glad to discuss.",
  },
  {
    to: "procurement@duke-energy.com",
    contactName: "Procurement Team",
    companyName: "Duke Energy",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to regulated utilities, grid operators, and energy transition projects across North America. We understand that Duke Energy&#8217;s grid modernization and storage initiatives require suppliers who can deliver at utility scale with full compliance documentation.",
    intro2: "Our product range includes grid-scale BESS, MV transformers, medium-voltage switchgear, and substation components &#8212; supplied factory-direct with full technical documentation and DDP fulfillment. With transformer and switchgear backlogs running 18&#8211;36 months across the industry, we provide an alternative sourcing channel.",
    closingLine: "If your procurement or grid development teams are evaluating suppliers for upcoming capital projects, we would welcome the conversation.",
  },
  {
    to: "dc-procurement@microsoft.com",
    contactName: "Infrastructure Procurement",
    companyName: "Microsoft Azure",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to hyperscale cloud operators building and expanding data center capacity across North America, Europe, and the Middle East. We understand that Microsoft Azure&#8217;s infrastructure program demands spec-grade, auditable equipment across every tier of the power stack.",
    intro2: "Our portfolio covers the full cloud data center power chain &#8212; N+1 and 2N industrial UPS, standby and prime-rated generators, MV transformers, precision cooling, switchgear, and containerized BESS &#8212; all factory-direct with full technical documentation and DDP fulfillment. With MV transformer lead times running 24&#8211;36 months industry-wide, we offer an alternative sourcing path at proven scale.",
    closingLine: "If your infrastructure or procurement teams are evaluating new power suppliers for upcoming campus builds or expansions, we would welcome the opportunity to provide specifications.",
  },
  // ── UAE TARGETS ─────────────────────────────────────────────────────────────
  {
    to: "procurement@khazna.ae",
    contactName: "Procurement Team",
    companyName: "Khazna Data Centers",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to data center operators across the Middle East and North America. We understand that Khazna&#8217;s position as a leading UAE colocation provider demands uncompromising reliability across every layer of the power stack.",
    intro2: "Our portfolio includes precision cooling, industrial UPS, standby generators, MV transformers, switchgear, and BESS &#8212; supplied factory-direct with DDP fulfillment into the UAE and full technical documentation. We have active supply relationships supporting infrastructure projects across the Gulf region.",
    closingLine: "If your facilities or procurement team is evaluating suppliers for upcoming capacity expansions, we would welcome the opportunity to provide specifications and pricing.",
  },
  {
    to: "procurement@du.ae",
    contactName: "Infrastructure Procurement",
    companyName: "du (EITC)",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to telecom operators, data center developers, and network infrastructure owners across the Middle East. We understand that du&#8217;s network expansion demands reliable backup power and energy systems at scale.",
    intro2: "Our portfolio includes 48V LiFePO4 telecom battery systems, standby generators, automatic transfer switches, industrial UPS, and precision cooling &#8212; all sourced factory-direct with DDP fulfillment and full technical documentation. We support telecom tower and data center power requirements across the Gulf.",
    closingLine: "If your network infrastructure or procurement teams are evaluating power suppliers for upcoming projects, we would be glad to provide specifications.",
  },
  {
    to: "procurement@etisalat.ae",
    contactName: "Infrastructure Procurement",
    companyName: "Etisalat (e&)",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to telecom carriers and digital infrastructure operators across the Middle East. We understand that e&amp;&#8217;s network and data center operations demand spec-grade, reliable power equipment at scale.",
    intro2: "Our portfolio covers telecom battery systems, generators, transfer switches, switchgear, UPS, and precision cooling &#8212; supplied factory-direct with DDP fulfillment into the UAE and full technical documentation. We are actively supporting power infrastructure requirements for operators across the Gulf region.",
    closingLine: "If your procurement or infrastructure teams are evaluating suppliers for upcoming network or data center projects, we would welcome the conversation.",
  },
  {
    to: "procurement@g42.ai",
    contactName: "Infrastructure Procurement",
    companyName: "G42",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to AI hyperscale operators and sovereign technology developers. We understand that G42&#8217;s ambition to build world-class AI infrastructure in the UAE demands power systems that can support the highest compute densities at scale.",
    intro2: "Our portfolio includes high-density precision cooling, containerized BESS, industrial UPS, modular power skids, and standby generators &#8212; supplied factory-direct with DDP fulfillment and full project documentation. We are equipped to support the power density and reliability requirements of next-generation AI data centers.",
    closingLine: "If your infrastructure or procurement teams are evaluating power suppliers for upcoming AI campus builds, we would welcome the opportunity to discuss.",
  },
  {
    to: "procurement@dewa.gov.ae",
    contactName: "Procurement Department",
    companyName: "DEWA",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to utility operators and grid developers across the Middle East. We understand that DEWA&#8217;s mandate to deliver world-class power infrastructure to Dubai demands suppliers who operate at the highest standards of reliability and compliance.",
    intro2: "Our product range includes grid-scale BESS, MV transformers, medium-voltage switchgear, standby generators, and substation components &#8212; supplied factory-direct with full technical and compliance documentation. We are experienced in supporting utility-scale infrastructure projects across the Gulf region.",
    closingLine: "If your procurement or project teams are evaluating infrastructure suppliers for upcoming grid or generation projects, we would be glad to provide specifications.",
  },
  {
    to: "procurement@adnoc.ae",
    contactName: "Procurement Team",
    companyName: "ADNOC",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to energy companies, EPC contractors, and industrial facility operators across the Middle East. We understand that ADNOC&#8217;s operations demand power systems that perform without compromise in the most demanding environments.",
    intro2: "Our portfolio includes industrial generators, MV transformers, weatherproof switchgear enclosures, BESS, and substation components &#8212; all sourced factory-direct with full technical and compliance documentation and DDP delivery into the UAE. We are experienced in supporting energy sector infrastructure requirements across the Gulf.",
    closingLine: "If your procurement or facilities teams are evaluating power infrastructure suppliers for upcoming projects, we would welcome the conversation.",
  },
  {
    to: "procurement@mubadala.ae",
    contactName: "Infrastructure Team",
    companyName: "Mubadala / MGX",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to sovereign investment platforms and AI infrastructure developers across the Middle East. We understand that Mubadala and MGX&#8217;s AI and digital infrastructure commitments demand reliable, scalable power systems delivered to the highest standards.",
    intro2: "Our portfolio includes grid-scale BESS, precision cooling, modular power skids, industrial generators, and MV transformers &#8212; supplied factory-direct with DDP fulfillment and full project documentation. We are positioned to support the power infrastructure requirements of large-scale AI and data center campuses across the Gulf.",
    closingLine: "If your infrastructure or procurement teams are evaluating suppliers for upcoming digital or energy projects, we would welcome the opportunity to discuss.",
  },
  {
    to: "procurement@puredatacentres.com",
    contactName: "Procurement Team",
    companyName: "Pure Data Centres Group",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to data center developers and operators across the Middle East. We understand that Pure Data Centres Group&#8217;s growth in the UAE market demands a reliable, fast-moving supply chain for power and cooling infrastructure.",
    intro2: "Our portfolio includes precision cooling, standby generators, industrial UPS, BESS, and busway systems &#8212; supplied factory-direct with DDP fulfillment and full technical documentation. We are actively supporting data center infrastructure projects across the Gulf region.",
    closingLine: "If your development or procurement teams are evaluating power suppliers for upcoming builds, we would be glad to provide specifications and pricing.",
  },
  {
    to: "uae-infrastructure@microsoft.com",
    contactName: "Infrastructure Team",
    companyName: "Microsoft UAE",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to hyperscale cloud operators expanding data center capacity across the Middle East. We understand that Microsoft&#8217;s UAE infrastructure program &#8212; one of the largest cloud investments in the region &#8212; demands suppliers who can deliver spec-grade equipment on aggressive timelines.",
    intro2: "Our portfolio covers the full data center power stack &#8212; N+1 and 2N industrial UPS, standby generators, MV transformers, switchgear, precision cooling, and containerized BESS &#8212; supplied factory-direct with DDP fulfillment into the UAE and full technical documentation. We are actively supporting hyperscale infrastructure builds across the Gulf.",
    closingLine: "If your UAE infrastructure or procurement teams are evaluating power suppliers for upcoming builds, we would welcome the opportunity to provide specifications and pricing.",
  },
  {
    to: "procurement@voltxds.com",
    contactName: "Procurement Team",
    companyName: "Volt/XDS",
    subject: "Critical Power Infrastructure — Durbolt Power",
    intro1: "Durbolt Power supplies critical power infrastructure to electrical contractors and infrastructure services firms executing mission-critical, data center, and industrial projects. We understand that Volt&#8217;s project portfolio demands sourcing partners who can move fast and deliver to specification.",
    intro2: "Our product range includes modular power skids, busway systems, transfer switches, MV switchgear, motor control centers, and transformers &#8212; all factory-direct with full technical documentation. On time-sensitive projects where standard channel lead times create schedule risk, we offer a faster and more direct sourcing path.",
    closingLine: "If your team has active or upcoming projects where power equipment sourcing is on the critical path, we would be glad to discuss what we can support.",
  },
];

// ─── Send function ────────────────────────────────────────────────────────────

async function sendEmail({ to, contactName, companyName, subject, intro1, intro2, closingLine }) {
  const html = buildHtml({ companyName, contactName, intro1, intro2, closingLine });
  const payload = {
    from: FROM,
    to: [to],
    bcc: BCC,
    subject,
    html,
  };

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await r.json();
  return { ok: r.ok, status: r.status, id: body.id, error: body.message };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const testTo = args.find(a => a.startsWith("--test="))?.slice(7);

  console.log(`Batch 1 — ${recipients.length} recipient(s)${dryRun ? " [DRY RUN]" : ""}${testTo ? ` [TEST → ${testTo}]` : ""}`);

  let sent = 0, failed = 0;

  for (const r of recipients) {
    const target = testTo ? { ...r, to: testTo, subject: r.subject + " [BATCH TEST - " + r.companyName + "]" } : r;
    if (dryRun) {
      const preview = target.intro1.replace(/&#\d+;|&[a-z]+;/g, " ").slice(0, 100);
      console.log(`  [DRY RUN] ${target.companyName} | ${target.to} | ${target.subject}`);
      console.log(`            intro1: "${preview}…"`);
      continue;
    }
    try {
      const result = await sendEmail(target);
      if (result.ok) {
        console.log(`  ✓ ${target.to} | ${target.companyName} | id=${result.id}`);
        sent++;
      } else {
        console.error(`  ✗ ${target.to} | ${target.companyName} | ${result.status} ${result.error}`);
        failed++;
      }
    } catch (e) {
      console.error(`  ✗ ${target.to} | ${target.companyName} | Exception: ${e.message}`);
      failed++;
    }
    if (recipients.indexOf(r) < recipients.length - 1) {
      await new Promise(res => setTimeout(res, DELAY_MS));
    }
  }

  console.log(`\nDone: ${sent} sent, ${failed} failed`);
}

main().catch(e => { console.error(e); process.exit(1); });
