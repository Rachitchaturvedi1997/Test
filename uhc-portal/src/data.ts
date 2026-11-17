// Dummy data for the UnitedHealthcare-style demo portal. Everything here is fictional.

export type UhcStatus = 'Finalized' | 'Pending' | 'Denied' | 'In Process'

export const PAYERS = [
  { id: '87726', name: 'UnitedHealthcare' },
  { id: '36273', name: 'AARP Supplemental Health' },
  { id: '87726-CP', name: 'UnitedHealthcare Community Plan' },
]
export const PROVIDER = { name: 'Srivatsa, Sanjay', tin: '273377866', npi: '1588603369', rendering: 'S. SURATH SRIVATSA', address: '222 W SHAW AVE, FRESNO, CA 93704-2644' }

export interface Member {
  id: string
  firstName: string
  lastName: string
  dob: string
  subscriberName: string
  relationship: 'SP' | 'EE' | 'DEP'
  product: string
  group: string
  payerId: string
}
export interface Adj { amount: number; grp: 'CO' | 'PR' | 'OA'; rsn: string }
export interface Line {
  line: number
  ctrl: string
  dosFrom: string
  dosTo: string
  code: string
  revenue: string
  modifier: string
  units: number
  billed: number
  allowed: number
  adjustments: Adj[]
  paid: number
  remarks: string[]
}
export interface Claim {
  claimNumber: string
  icn: string
  member: Member
  patientAccount: string
  status: UhcStatus
  processed: string | null
  received: string
  dosFrom: string
  dosTo: string
  billed: number
  allowed: number
  paid: number
  patientResp: number
  network: 'In-Network' | 'Out-of-Network'
  lines: Line[]
  remitDates: string[]
  checkNumber: string | null
  paymentMethod: 'EFT' | 'Check' | null
  letters: { date: string; title: string }[]
}

export const CODES: Record<string, string> = {
  CO45: 'CONTRACTUAL OBLIGATIONS - CHARGE EXCEEDS FEE SCHEDULE/MAXIMUM ALLOWABLE OR CONTRACTED/LEGISLATED FEE ARRANGEMENT.',
  PR1: 'PATIENT RESPONSIBILITY - DEDUCTIBLE AMOUNT',
  PR2: 'PATIENT RESPONSIBILITY - COINSURANCE AMOUNT',
  PR3: 'PATIENT RESPONSIBILITY - CO-PAYMENT AMOUNT',
  CO50: 'CONTRACTUAL OBLIGATIONS - NON-COVERED SERVICE; NOT DEEMED A MEDICAL NECESSITY BY THE PAYER.',
  CO97: 'CONTRACTUAL OBLIGATIONS - PAYMENT IS INCLUDED IN THE ALLOWANCE FOR ANOTHER SERVICE/PROCEDURE.',
  D1: 'NETWORK BENEFITS HAVE BEEN APPLIED. THE MEMBER IS ONLY RESPONSIBLE FOR THE COST SHARE (DEDUCTIBLE, COPAY AND COINSURANCE) AND ANY NON-COVERED AMOUNT AFTER THEY MEET THEIR BENEFIT LIMIT FOR A COVERED SERVICE.',
  N4: 'MEDICAL RECORDS HAVE BEEN REQUESTED. THE CLAIM WILL BE REVIEWED ONCE RECORDS ARE RECEIVED.',
  M51: 'MISSING/INCOMPLETE/INVALID PROCEDURE CODE(S).',
}

let seed = 87726
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296), seed / 4294967296)
const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)]
const digits = (n: number) => Array.from({ length: n }, () => int(0, 9)).join('')
const r2 = (n: number) => Math.round(n * 100) / 100

export function parseDate(s: string) {
  const [m, d, y] = s.split('/').map(Number)
  return new Date(y, m - 1, d)
}
export const fmtDate = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
export const addDays = (s: string, n: number) => {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return fmtDate(d)
}
export const short = (s: string) => s.slice(0, 6) + s.slice(8) // MM/DD/YY
export const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

type MRow = [string, string, string, string, string, Member['relationship'], string, string?]
const ROWS: MRow[] = [
  ['985092259', 'GULVEEN', 'CHEEMA', '11/06/1995', 'SARBJOT SINGH', 'SP', 'CHOYC+'],
  ['912345870', 'ROBERT', 'ANDERSON', '03/18/1958', 'ROBERT ANDERSON', 'EE', 'CHOYC+'],
  ['907261534', 'PRIYA', 'SHARMA', '07/29/1987', 'PRIYA SHARMA', 'EE', 'NAVIGATE'],
  ['954018827', 'MIGUEL', 'TORRES', '12/04/1969', 'ELENA TORRES', 'SP', 'CHOYC+'],
  ['968112045', 'ETHAN', 'TORRES', '05/16/2010', 'ELENA TORRES', 'DEP', 'CHOYC+'],
  ['921774306', 'BARBARA', 'COLLINS', '09/09/1949', 'BARBARA COLLINS', 'EE', 'AARP MEDSUPP PLAN G', '36273'],
  ['933601278', 'GEORGE', 'HARRIS', '01/27/1944', 'GEORGE HARRIS', 'EE', 'AARP MEDSUPP PLAN N', '36273'],
  ['946285113', 'FATIMA', 'KHAN', '08/02/1991', 'FATIMA KHAN', 'EE', 'OPTIONS PPO'],
  ['958830462', 'DANIEL', 'KIM', '04/11/1976', 'DANIEL KIM', 'EE', 'CHOYC+'],
  ['972410395', 'JESSICA', 'MORALES', '10/23/1983', 'CARLOS MORALES', 'SP', 'CORE'],
  ['984726518', 'ANTHONY', 'BROWN', '06/30/1972', 'ANTHONY BROWN', 'EE', 'COMMUNITY PLAN', '87726-CP'],
  ['990153287', 'MAYA', 'BROWN', '02/14/2013', 'ANTHONY BROWN', 'DEP', 'COMMUNITY PLAN', '87726-CP'],
  ['915938604', 'RAJESH', 'IYER', '11/19/1965', 'RAJESH IYER', 'EE', 'CHOYC+'],
  ['927364051', 'LAUREN', 'MITCHELL', '01/05/1998', 'LAUREN MITCHELL', 'EE', 'NAVIGATE'],
  ['939475162', 'WALTER', 'GREEN', '07/07/1950', 'WALTER GREEN', 'EE', 'AARP MEDSUPP PLAN G', '36273'],
  ['941582736', 'NINA', 'PATEL', '03/31/1979', 'VIKRAM PATEL', 'SP', 'OPTIONS PPO'],
]
export const members: Member[] = ROWS.map(([id, firstName, lastName, dob, subscriberName, relationship, product, payerId]) => ({
  id, firstName, lastName, dob, subscriberName, relationship, product, payerId: payerId ?? '87726', group: `0${digits(6)}`,
}))

const CATALOG = [
  { code: '99214', charge: 230, allowed: 94.86 },
  { code: '99213', charge: 180, allowed: 76.12 },
  { code: '99204', charge: 320, allowed: 139.5 },
  { code: '93000', charge: 35, allowed: 14.88 },
  { code: '93306', charge: 520, allowed: 228.4 },
  { code: '93350', charge: 380, allowed: 187.3 },
  { code: '36415', charge: 20, allowed: 3.0 },
  { code: '80053', charge: 55, allowed: 11.2 },
  { code: '93880', charge: 410, allowed: 172.65 },
]

interface Spec {
  claimNumber?: string
  member: Member
  dos: string
  codes: string[]
  status: UhcStatus
  coinsPct?: number
  copay?: number
  deductible?: number
  account?: string
  processed?: string
  received?: string
  remitDates?: string[]
}

function build(s: Spec): Claim {
  const claimNumber = s.claimNumber ?? `${pick(['FX', 'FW', 'FZ', 'GA', 'GB'])}${digits(8)}`
  const received = s.received ?? addDays(s.dos, int(5, 15))
  const done = s.status === 'Finalized' || s.status === 'Denied'
  const processed = done ? (s.processed ?? addDays(received, int(3, 14))) : null
  const lines: Line[] = s.codes.map((code, i) => {
    const c = CATALOG.find((x) => x.code === code)!
    const base = {
      line: i + 1,
      ctrl: `${digits(6)}K${digits(2)} ${digits(4)}K${i + 8}`,
      dosFrom: s.dos, dosTo: s.dos, code, revenue: '--',
      modifier: code.startsWith('992') && s.codes.length > 1 ? '25' : '',
      units: 1, billed: c.charge,
    }
    if (s.status === 'Denied') return { ...base, allowed: 0, adjustments: [{ amount: c.charge, grp: 'CO' as const, rsn: pick(['50', '97']) }], paid: 0, remarks: ['M51'] }
    if (!done) return { ...base, allowed: 0, adjustments: [], paid: 0, remarks: s.status === 'Pending' ? ['N4'] : [] }
    const allowed = c.allowed
    const copay = i === 0 ? Math.min(s.copay ?? 0, allowed) : 0
    const ded = i === 0 ? Math.min(s.deductible ?? 0, r2(allowed - copay)) : 0
    const coins = r2((allowed - copay - ded) * ((s.coinsPct ?? 0) / 100))
    const adjustments: Adj[] = [{ amount: r2(c.charge - allowed), grp: 'CO', rsn: '45' }]
    if (ded) adjustments.push({ amount: ded, grp: 'PR', rsn: '1' })
    if (coins) adjustments.push({ amount: coins, grp: 'PR', rsn: '2' })
    if (copay) adjustments.push({ amount: copay, grp: 'PR', rsn: '3' })
    return { ...base, allowed, adjustments, paid: r2(allowed - copay - ded - coins), remarks: ['D1'] }
  })
  const sum = (f: (l: Line) => number) => r2(lines.reduce((a, l) => a + f(l), 0))
  const paid = sum((l) => l.paid)
  return {
    claimNumber,
    icn: digits(10),
    member: s.member,
    patientAccount: s.account ?? `${digits(6)}Z${digits(5)}`,
    status: s.status,
    processed,
    received,
    dosFrom: s.dos,
    dosTo: s.dos,
    billed: sum((l) => l.billed),
    allowed: sum((l) => l.allowed),
    paid,
    patientResp: sum((l) => l.adjustments.filter((a) => a.grp === 'PR').reduce((a, x) => a + x.amount, 0)),
    network: 'In-Network',
    lines,
    remitDates: s.remitDates ?? (processed && paid > 0 ? [addDays(processed, int(3, 24))] : processed ? [addDays(processed, 3)] : []),
    checkNumber: processed ? `${int(1, 9)}${digits(8)}` : null,
    paymentMethod: processed ? (paid > 0 ? 'EFT' : null) : null,
    letters: s.status === 'Denied' ? [{ date: addDays(processed!, 2), title: 'Claim denial letter' }] : s.status === 'Pending' ? [{ date: addDays(received, 6), title: 'Request for medical records' }] : [],
  }
}

const M = (last: string, first?: string) => members.find((m) => m.lastName === last && (!first || m.firstName === first))!

// From the reference screenshots (kept exact)
const fixed = build({
  claimNumber: 'FX36693112', member: M('CHEEMA'), dos: '08/06/2026', codes: ['99214', '93000'], status: 'Finalized', coinsPct: 20,
  account: '268332Z56076', received: '08/20/2026', processed: '08/21/2026', remitDates: ['09/14/2026'],
})
fixed.icn = '0243345744'
fixed.lines[0].ctrl = '356076K47 7095K9'
fixed.lines[1].ctrl = '356076K47 7096K8'
fixed.lines[0].adjustments = [{ amount: 135.14, grp: 'CO', rsn: '45' }, { amount: 18.97, grp: 'PR', rsn: '2' }]
fixed.lines[0].paid = 75.89
fixed.lines[1].adjustments = [{ amount: 2.98, grp: 'PR', rsn: '2' }, { amount: 20.12, grp: 'CO', rsn: '45' }]
fixed.lines[1].paid = 11.9
fixed.paid = 87.79
fixed.patientResp = 21.95
fixed.billed = 265
fixed.allowed = 109.74

const generated: Claim[] = []
const STATUSES: UhcStatus[] = ['Finalized', 'Finalized', 'Finalized', 'Finalized', 'Denied', 'Pending', 'In Process']
const COMBOS = [['99213'], ['99214'], ['99214', '93000'], ['99204', '36415', '80053'], ['93306'], ['93350'], ['93880'], ['99213', '36415']]
members.forEach((m, i) => {
  const n = i === 0 ? 1 : int(1, 3)
  for (let k = 0; k < n; k++) {
    const month = int(3, 10)
    let status = pick(STATUSES)
    if (month >= 10 && status === 'Finalized') status = 'In Process'
    generated.push(build({
      member: m, dos: fmtDate(new Date(2026, month - 1, int(1, 28))), codes: pick(COMBOS), status,
      copay: pick([0, 0, 25, 40]), deductible: rnd() < 0.25 ? 50 : 0, coinsPct: pick([0, 10, 20]),
    }))
  }
})

export const claims: Claim[] = [fixed, ...generated]
export const findClaim = (n: string) => claims.find((c) => c.claimNumber.toUpperCase() === n.trim().toUpperCase())
