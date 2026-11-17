# UnitedHealthcare-style provider portal (demo)

Follows *UHC Portal – Navigation.pdf*: One Healthcare ID sign in → identity confirmation (Google Authenticator) → **Claims & Payments › Look up a Claim** →
Claims results → Claim summary → Remittance advice document (PDF).
All data is fictional. Not affiliated with UnitedHealthcare or Optum.

```bash
npm install
npm run dev          # http://localhost:7990
npm run build && npm run preview   # production, port 7990 (HTTPS if the SSL files in vite.config.ts exist)
```

**Login:** `sam@zuqo.ai` → Continue → `zuqo123` → choose *Authenticator app* → Google Authenticator code
(setup key `KVEEGRDFNVXVGZLDOJSXIMJS`, or `npm run totp`).

**Example search (from the screenshots):** Member ID & date of birth · 985092259 · 11/06/1995 · first/last service date 08/06/2026 →
claim **FX36693112** (Gulveen Cheema), Finalized, billed $265.00, paid $87.79, remittance advice 09/14/2026.

Search criteria supported: Member ID & DOB, Member ID & name, Name & DOB, Patient account # or claim #, Provider information.
Members under *36273 - AARP Supplemental Health* or *UnitedHealthcare Community Plan* need that payer selected (top right).

All test members/claims: `../docs/All_Portals_Test_Data.xlsx` (sheet *UHC Test Data*).
