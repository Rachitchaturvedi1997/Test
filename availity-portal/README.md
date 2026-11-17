# Availity-style provider portal (demo)

Follows *Availity Portal – Navigation.pdf*: Sign In → 2-Step Authentication (Google Authenticator) → Home → **Claim Status** → results → claim details → Remittance Viewer.
All data is fictional. Not affiliated with Availity or any payer.

```bash
npm install
npm run dev          # http://localhost:7989
npm run build && npm run preview   # production, port 7989 (HTTPS if the SSL files in vite.config.ts exist)
```

**Login:** `sam@zuqo.ai` / `zuqo123`, then choose *Use an authenticator app* and enter the Google Authenticator code
(setup key `IFWGC2LMNF2HSRDFNVXUCMBS`, or `npm run totp`).

**Example search (from the screenshots):** Payer AETNA · Provider NPI 1588603369 · Member ID W270822790 · ROSE DAY / MCKENZIE ·
DOB 06/20/2003 · Dependent (subscriber ROSE DAY / MCKENZIE) · Service dates 09/11/2026–09/11/2026 → claim **EVTYXJL7100**, PAID $161.09 of $370.00,
remittance not posted yet ("Set to pay").

All test members/claims: `../docs/All_Portals_Test_Data.xlsx` (sheet *Availity Test Data*).
