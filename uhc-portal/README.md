# UnitedHealthcare-style provider portal (demo)

Follows *UHC Portal – Navigation.pdf*: One Healthcare ID sign in → identity confirmation by **call or text** → **Claims & Payments › Look up a Claim** →
Claims results → Claim summary → Remittance advice document (PDF).
All data is fictional. Not affiliated with UnitedHealthcare or Optum.

```bash
npm install
npm run dev          # http://localhost:7990
npm run build && npm run preview   # production, port 7990 (HTTPS if the SSL files in vite.config.ts exist)
```

**Login:** `sam@zuqo.ai` → Continue → `zuqo123` → *Confirm your identity*: choose **Call me** (or Text me) → enter the code.

The code needs a person, like the real portal: the account owner opens the demo phone page
**`/demo-phone`** (e.g. https://3.6.106.238:7990/demo-phone) on their own phone or computer and reads out the code.
The portal never shows that page or links to it. Codes change every 5 minutes, and the previous code is also accepted.
On the server, `npm run code` prints the same code.

**Example search (from the screenshots):** Member ID & date of birth · 985092259 · 11/06/1995 · first/last service date 08/06/2026 →
claim **FX36693112** (Gulveen Cheema), Finalized, billed $265.00, paid $87.79, remittance advice 09/14/2026.

Search criteria supported: Member ID & DOB, Member ID & name, Name & DOB, Patient account # or claim #, Provider information.
Members under *36273 - AARP Supplemental Health* or *UnitedHealthcare Community Plan* need that payer selected (top right).

All test members/claims: `../docs/All_Portals_Test_Data.xlsx` (sheet *UHC Test Data*).
