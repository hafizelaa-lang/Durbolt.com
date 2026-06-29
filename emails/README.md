# Durbolt Power — Cold Outreach Email

**File:** `outreach-v1.html`
**Live URL:** `https://durbolt.com/emails/outreach-v1.html`

---

## Personalization

Before each send, replace these three placeholders in the HTML:

| Placeholder | Replace with |
|---|---|
| `[REGION]` | Target geography — e.g. `the Gulf region`, `East Africa`, `Southeast Asia` |
| `[COMPANY NAME]` | Recipient company name — e.g. `ACWA Power`, `Bechtel` |
| `[EMAIL]` | Recipient email address — for the unsubscribe line in the footer |

Quick find-and-replace with any text editor or `sed`:

```bash
sed \
  -e 's/\[REGION\]/the Gulf region/g' \
  -e 's/\[COMPANY NAME\]/ACWA Power/g' \
  -e 's/\[EMAIL\]/contact@acwapower.com/g' \
  outreach-v1.html > send/acwapower.html
```

---

## Sending via Resend API

### 1. Install the Resend SDK

```bash
npm install resend
```

### 2. Send script

```js
import { Resend } from 'resend';
import fs from 'fs';

const resend = new Resend(process.env.RESEND_API_KEY);

const html = fs.readFileSync('./send/acwapower.html', 'utf8');

await resend.emails.send({
  from:    'Durbolt Power <sales@durbolt.com>',
  to:      ['contact@acwapower.com'],
  subject: 'Critical Power Infrastructure — Durbolt Power',
  html,
});
```

### 3. Environment variable

```bash
export RESEND_API_KEY=re_xxxxxxxxxxxx
```

---

## Subject Line Options

Pick based on recipient context:

1. **`Critical Power Infrastructure — Durbolt Power`** — Direct, sector-specific. Best for EPC contractors, utilities, data center operators.
2. **`Power Infrastructure Supply — Project Inquiry`**  — Softer opener. Best for government agencies or unfamiliar contacts.
3. **`Durbolt Power — 44 Product Lines, Factory Direct`** — Product-led. Best for procurement and supply chain leads.

---

## Catalogue Link

The email links to the live PDF:
`https://durbolt.com/catalogue/durbolt-power-catalogue-2025.pdf`

Web viewer: `https://durbolt.com/catalogue/`
