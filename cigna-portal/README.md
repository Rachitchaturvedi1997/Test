# CignaforHCP-style provider portal (demo)

A mock provider portal that follows the navigation in *Cigna Portal – Navigation.pdf*:
login → Google Authenticator pass code → dashboard → **Claims ▸ Search Claims** → claim detail → remittance report **View PDF**.
All data is fictional dummy data. Not affiliated with Cigna.

## Run

```bash
cd cigna-portal
npm install
npm run dev        # http://localhost:5180
```

Production build: `npm run build` then `npm run preview` (or deploy `dist/`; `vercel.json` / `public/_redirects` handle SPA routes).

## Login

| | |
|---|---|
| Username | `sam@zuqo.ai` |
| Password | `zuqo123` |
| Authenticator secret | `KZXW6YTBNRSWG3DFOJUGC3TU` (TOTP, SHA-1, 6 digits, 30 s) |

1. Enter the username → **Continue**, then the password → **Continue** (two-step screen like the real one).
2. **First login in a browser:** a QR code is shown. Scan it with Google Authenticator (or tap "Can't scan it?" and type the setup key), then enter the 6-digit code.
3. **Later logins:** only the 6-digit pass code is asked. "Set up authenticator again" re-shows the QR.

For bots/automation, get the current code without a phone:

```bash
npm run totp
```

## Pages (URLs mirror the real portal)

| URL | What |
|---|---|
| `/login`, `/mfa` | login + Google Authenticator |
| `/app/dashboard` | Welcome, featured updates, Claims (Recent / Flagged), Messages, Latest Updates |
| `/app/claim/search` | Search by Patient (DOB/ID, Name/DOB, Name/ID, account #), Claim number, TIN, All; Adjusted claims; CSV Download |
| `/app/claim/detail/<claimNumber>` | Claim info, payment info, payment details (EFT), procedures, remark codes, remittance reports (View PDF / download), history tabs, View Coverage |
| `/app/reports/remittance` | All remittance reports |
| `/app/patient/search` | Patient lookup |

Search results are kept in the URL, e.g. `/app/claim/search?tab=patient&mode=dobid&dob=03/14/1968&pid=U46353873&run=1`.

## Test data (from the screenshots)

| Patient | DOB | Patient ID | Claim | DOS | Notes |
|---|---|---|---|---|---|
| Anamaria Cerda | 03/14/1968 | U46353873 | 9672624094335 | 08/06/2026 | $380 billed, $209.26 paid EFT, remittance 260829090061712 (4 pages) |
| Kimberlee Chin | 11/02/1975 | 112185095 | 262589025600 | 07/06/2026 | |
| Leticia Urbina | 07/22/1959 | U71440097 | 4432618102179 | 05/07/2026 | |
| Gurpreet Sandhu | 01/30/1982 | U58201146 | 4672529691844 | 04/22/2026 | remittance 261015090067697 (6 pages) |

Provider TINs: `273377866` (Sanjay Srivatsa Inc, Fresno) and `841692305` (Valley Heart & Vascular).
~50 claims across 18 patients are generated deterministically in `src/data.ts` (processed, pended, denied, in-process, adjusted) — the data is identical on every load.
Flags and remittance read/unread state are saved per browser.

## Deploy to an Ubuntu server (nginx)

```bash
./deploy.sh /path/to/key.pem ubuntu@3.6.106.238 8080
```

The last argument is the port (any free port, default `8080`; use `80` for a link with no port).
The script builds the app, uploads it, and configures nginx on that port (with SPA route fallback).
The link is then `http://3.6.106.238:8080/`. The EC2 security group must allow inbound TCP on that port (and 22 for the deploy).
