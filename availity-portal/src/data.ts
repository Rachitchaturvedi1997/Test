// Dummy data for the Availity-style demo portal. Everything here is fictional.

export type AvStatus = 'PAID' | 'DENIED' | 'PENDING' | 'RECEIVED'

export interface Payer { id: string; name: string; display: string; color: string; phone: string; address: string[] }
export interface Provider { id: string; name: string; npi: string; tin: string; address: string[] }
export interface Member {
  key: string
  payerId: string
  lastName: string
  firstName: string
  middle: string
  dob: string
  gender: 'M' | 'F'
  memberId: string
  group: string
  relationship: 'SELF' | 'SPOUSE' | 'DEPENDENT'
  subLast: string
  subFirst: string
  subMiddle: string
  funding: 'SelfFunded' | 'FullyInsured'
  plan: string
}
export interface ServiceLine {
  line: number
  code: string
  modifier: string
  description: string
  units: number
  dosFrom: string
  dosTo: string
  billed: number
  allowed: number
  deductible: number
  copay: number
  coinsurance: number
  contractual: number
  paid: number
  carc: string[]
  status: string
}
export interface AvClaim {
  claimNumber: string
  payerId: string
  member: Member
  provider: Provider
  patientAccount: string
  status: AvStatus
  statusCode: string
  statusText: string
  received: string
  finalized: string | null
  dosFrom: string
  dosTo: string
  billed: number
  paid: number
  patientResp: number
  lines: ServiceLine[]
  checkNumber: string | null
  paymentDate: string | null
  paymentMethod: 'EFT' | 'CHECK' | null
  remitAvailable: boolean
  billType: string
}

export const PAYERS: Payer[] = [
  { id: '60054', name: 'AETNA', display: 'aetna', color: '#7d3f98', phone: '1-888-632-3862', address: ['PO BOX 981106', 'EL PASO, TX 79998-1106'] },
  { id: '040', name: 'ANTHEM BLUE CROSS', display: 'Anthem', color: '#0079c1', phone: '1-800-677-6669', address: ['PO BOX 60007', 'LOS ANGELES, CA 90060-0007'] },
  { id: '940360524', name: 'BLUE SHIELD OF CALIFORNIA', display: 'Blue Shield', color: '#0b5ea8', phone: '1-800-541-6652', address: ['PO BOX 272540', 'CHICO, CA 95927-2540'] },
  { id: '61101', name: 'HUMANA', display: 'Humana', color: '#3a9d23', phone: '1-800-448-6262', address: ['PO BOX 14601', 'LEXINGTON, KY 40512-4601'] },
]
export const payerById = (id: string) => PAYERS.find((p) => p.id === id)!

export const ORGANIZATION = { name: 'SANJAY SRIVATSA INC', npi: '1588603369', tin: '273377866', customerId: '469221' }

export const PROVIDERS: Provider[] = [
  { id: 'p1', name: 'SANJAY SRIVATSA INC', npi: '1588603369', tin: '273377866', address: ['222 W SHAW AVE', 'FRESNO, CA 93704-2644'] },
  { id: 'p2', name: 'SRIVATSA, SANJAY MD', npi: '1730218846', tin: '273377866', address: ['222 W SHAW AVE', 'FRESNO, CA 93704-2644'] },
  { id: 'p3', name: 'VALLEY HEART & VASCULAR GROUP', npi: '1295847720', tin: '841692305', address: ['1450 E HERNDON AVE STE 200', 'FRESNO, CA 93720-3311'] },
]

export const CARC: Record<string, string> = {
  'CO-45': 'Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement.',
  'PR-1': 'Deductible amount.',
  'PR-2': 'Coinsurance amount.',
  'PR-3': 'Co-payment amount.',
  'CO-50': 'These are non-covered services because this is not deemed a medical necessity by the payer.',
  'CO-97': 'The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated.',
  'CO-16': 'Claim/service lacks information or has submission/billing error(s).',
  'CO-29': 'The time limit for filing has expired.',
}

const STATUS_INFO: Record<AvStatus, { code: string; text: string }> = {
  PAID: { code: 'F1:65', text: 'Finalized/Payment - The claim/line has been paid.' },
  DENIED: { code: 'F2:88', text: 'Finalized/Denial - The claim/line has been denied.' },
  PENDING: { code: 'P2:21', text: 'Pending/In Review - Missing or invalid information; claim is under review.' },
  RECEIVED: { code: 'A1:20', text: 'Acknowledgement/Receipt - The claim/encounter has been received.' },
}

// ---------- helpers ----------
let seed = 1157
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296), seed / 4294967296)
const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)]
const digits = (n: number) => Array.from({ length: n }, () => int(0, 9)).join('')
const letters = (n: number) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPRSTUVWXYZ'[int(0, 22)]).join('')
const r2 = (n: number) => Math.round(n * 100) / 100

export function parseDate(s: string) {
  const [m, d, y] = s.split('/').map(Number)
  return new Date(y, m - 1, d)
}
export function fmtDate(d: Date) {
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}
export const addDays = (s: string, n: number) => {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return fmtDate(d)
}
export const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ---------- members ----------
type MRow = [string, string, string, string, string, 'M' | 'F', string, string, 'SELF' | 'SPOUSE' | 'DEPENDENT', string?, string?]
const ROWS: MRow[] = [
  ['60054', 'ROSE DAY', 'MCKENZIE', 'R', '06/20/2003', 'F', 'W270822790', '891049', 'DEPENDENT', 'ROSE DAY', 'MCKENZIE L'],
  ['60054', 'PATEL', 'ANIL', 'K', '02/11/1971', 'M', 'W184530627', '891049', 'SELF'],
  ['60054', 'HERNANDEZ', 'SOFIA', 'M', '09/03/1988', 'F', 'W593017744', '477210', 'SPOUSE', 'HERNANDEZ', 'LUIS A'],
  ['60054', 'BAKER', 'WILLIAM', 'J', '12/19/1957', 'M', 'W730226158', '477210', 'SELF'],
  ['040', 'NGUYEN', 'LINH', 'T', '04/27/1990', 'F', 'XEH812345671', '200341M', 'SELF'],
  ['040', 'JOHNSON', 'MARCUS', 'D', '07/15/1966', 'M', 'XEH603918274', '200341M', 'SELF'],
  ['040', 'KAUR', 'SIMRAN', '', '01/08/2012', 'F', 'XEH455120983', '170982A', 'DEPENDENT', 'KAUR', 'JASPREET'],
  ['940360524', 'MITCHELL', 'KAREN', 'L', '10/30/1962', 'F', 'XDP907615432', 'W0051234', 'SELF'],
  ['940360524', 'ALVAREZ', 'DIEGO', 'R', '03/22/1979', 'M', 'XDP336281904', 'W0051234', 'SELF'],
  ['940360524', 'CHEN', 'GRACE', 'Y', '08/14/1995', 'F', 'XDP220745189', 'W0078810', 'SPOUSE', 'CHEN', 'DAVID'],
  ['61101', 'WRIGHT', 'HAROLD', 'E', '05/02/1948', 'M', 'H51047823', 'MAPD-H5216', 'SELF'],
  ['61101', 'LOPEZ', 'CARMEN', 'A', '11/25/1951', 'F', 'H62930481', 'MAPD-H5216', 'SELF'],
  ['61101', 'SCOTT', 'DOROTHY', 'M', '02/17/1945', 'F', 'H70318264', 'MAPD-H0028', 'SELF'],
  ['60054', 'SINGH', 'ARJUN', 'P', '06/09/1984', 'M', 'W418806352', '623307', 'SELF'],
  ['040', 'RIVERA', 'ISABELLA', 'C', '09/12/2001', 'F', 'XEH778104526', '170982A', 'DEPENDENT', 'RIVERA', 'MARCO'],
  ['940360524', 'TAYLOR', 'JAMES', 'W', '12/01/1973', 'M', 'XDP514096327', 'W0078810', 'SELF'],
]
export const members: Member[] = ROWS.map(([payerId, lastName, firstName, middle, dob, gender, memberId, group, relationship, subLast, subFirst], i) => ({
  key: `m${i}`,
  payerId, lastName, firstName, middle, dob, gender, memberId, group, relationship,
  subLast: subLast ?? lastName,
  subFirst: (subFirst ?? firstName).split(' ')[0],
  subMiddle: (subFirst ?? '').split(' ')[1] ?? middle,
  funding: i % 3 === 0 ? 'SelfFunded' : 'FullyInsured',
  plan: { '60054': 'Aetna Choice POS II', '040': 'Anthem PPO', '940360524': 'Blue Shield PPO', '61101': 'Humana Gold Plus HMO' }[payerId]!,
}))

// ---------- claims ----------
const CATALOG = [
  { code: '99213', desc: 'OFFICE/OUTPATIENT VISIT EST', charge: 185, rate: 0.52 },
  { code: '99214', desc: 'OFFICE/OUTPATIENT VISIT EST', charge: 230, rate: 0.48 },
  { code: '99204', desc: 'OFFICE/OUTPATIENT VISIT NEW', charge: 320, rate: 0.5 },
  { code: '93000', desc: 'ELECTROCARDIOGRAM COMPLETE', charge: 35, rate: 0.45 },
  { code: '93306', desc: 'TTE W/DOPPLER COMPLETE', charge: 520, rate: 0.55 },
  { code: '93350', desc: 'STRESS TTE ONLY', charge: 370, rate: 0.62 },
  { code: '36415', desc: 'ROUTINE VENIPUNCTURE', charge: 25, rate: 0.3 },
  { code: '80053', desc: 'COMPREHEN METABOLIC PANEL', charge: 60, rate: 0.25 },
  { code: '93880', desc: 'EXTRACRANIAL BILAT STUDY', charge: 410, rate: 0.5 },
]

interface Spec {
  claimNumber?: string
  member: Member
  provider?: Provider
  dos: string
  codes: string[]
  status: AvStatus
  copay?: number
  deductible?: number
  coinsPct?: number
  finalLag?: number
  remitAvailable?: boolean
  account?: string
  fixedPaid?: number
}

function buildClaim(s: Spec): AvClaim {
  const provider = s.provider ?? PROVIDERS[0]
  const received = addDays(s.dos, int(3, 12))
  const finalized = s.status === 'PAID' || s.status === 'DENIED' ? addDays(received, s.finalLag ?? int(6, 20)) : null
  let lines: ServiceLine[] = s.codes.map((code, i) => {
    const c = CATALOG.find((x) => x.code === code)!
    const billed = c.charge
    const base = { line: i + 1, code, modifier: code.startsWith('992') && s.codes.length > 1 ? '25' : '', description: c.desc, units: 1, dosFrom: s.dos, dosTo: s.dos, billed }
    if (s.status === 'DENIED') {
      return { ...base, allowed: 0, deductible: 0, copay: 0, coinsurance: 0, contractual: billed, paid: 0, carc: [pick(['CO-50', 'CO-16', 'CO-29'])], status: 'DENIED' }
    }
    if (s.status !== 'PAID') {
      return { ...base, allowed: 0, deductible: 0, copay: 0, coinsurance: 0, contractual: 0, paid: 0, carc: [], status: s.status }
    }
    const allowed = r2(billed * c.rate)
    const copay = i === 0 ? Math.min(s.copay ?? 0, allowed) : 0
    const deductible = i === 0 ? Math.min(s.deductible ?? 0, r2(allowed - copay)) : 0
    const coinsurance = r2((allowed - copay - deductible) * ((s.coinsPct ?? 0) / 100))
    const paid = r2(allowed - copay - deductible - coinsurance)
    const carc = ['CO-45']
    if (deductible) carc.push('PR-1')
    if (coinsurance) carc.push('PR-2')
    if (copay) carc.push('PR-3')
    return { ...base, allowed, deductible, copay, coinsurance, contractual: r2(billed - allowed), paid, carc, status: 'PAID' }
  })
  // Force an exact paid total when the reference screenshot requires it.
  if (s.fixedPaid !== undefined && s.status === 'PAID') {
    const l = lines[0]
    const allowed = r2(s.fixedPaid + l.copay + l.deductible + l.coinsurance)
    lines = [{ ...l, allowed, contractual: r2(l.billed - allowed), paid: s.fixedPaid }, ...lines.slice(1)]
  }
  const sum = (k: keyof ServiceLine) => r2(lines.reduce((a, l) => a + (l[k] as number), 0))
  const paid = sum('paid')
  const info = STATUS_INFO[s.status]
  return {
    claimNumber: s.claimNumber ?? `E${letters(5)}${letters(1)}${digits(4)}`,
    payerId: s.member.payerId,
    member: s.member,
    provider,
    patientAccount: s.account ?? `${digits(6)}Z${digits(5)}`,
    status: s.status,
    statusCode: info.code,
    statusText: info.text,
    received,
    finalized,
    dosFrom: s.dos,
    dosTo: s.dos,
    billed: sum('billed'),
    paid,
    patientResp: r2(sum('deductible') + sum('copay') + sum('coinsurance')),
    lines,
    checkNumber: s.status === 'PAID' ? `${int(1, 9)}${digits(9)}` : null,
    paymentDate: s.status === 'PAID' ? finalized : null,
    paymentMethod: s.status === 'PAID' ? 'EFT' : null,
    remitAvailable: s.status === 'PAID' ? (s.remitAvailable ?? true) : false,
    billType: '',
  }
}

const M = (last: string) => members.find((m) => m.lastName === last)!

const FIXED: AvClaim[] = [
  // From the reference screenshots: paid, but remittance not posted yet ("Set to pay")
  buildClaim({ claimNumber: 'EVTYXJL7100', member: M('ROSE DAY'), dos: '09/11/2026', codes: ['93350'], status: 'PAID', fixedPaid: 161.09, copay: 40, remitAvailable: false, account: '272386Z56076' }),
]
FIXED[0].finalized = '10/02/2026'
FIXED[0].paymentDate = '10/02/2026'
FIXED[0].received = '09/16/2026'

const GENERATED: AvClaim[] = []
const STATUSES: AvStatus[] = ['PAID', 'PAID', 'PAID', 'PAID', 'DENIED', 'PENDING', 'RECEIVED']
const COMBOS = [['99213'], ['99214'], ['99214', '93000'], ['99204', '36415', '80053'], ['93306'], ['93350'], ['93880'], ['99213', '36415']]
members.forEach((m, mi) => {
  const n = mi === 0 ? 1 : int(1, 3)
  for (let k = 0; k < n; k++) {
    const month = int(3, 10)
    let status = pick(STATUSES)
    if (month >= 10 && status === 'PAID') status = 'PENDING'
    GENERATED.push(
      buildClaim({
        member: m,
        provider: rnd() < 0.75 ? PROVIDERS[0] : pick(PROVIDERS.slice(1)),
        dos: fmtDate(new Date(2026, month - 1, int(1, 28))),
        codes: pick(COMBOS),
        status,
        copay: pick([0, 20, 30, 40]),
        deductible: rnd() < 0.25 ? pick([50, 100]) : 0,
        coinsPct: rnd() < 0.35 ? 20 : 0,
        remitAvailable: rnd() < 0.85,
      }),
    )
  }
})

export const claims: AvClaim[] = [...FIXED, ...GENERATED]
export const findClaim = (n: string) => claims.find((c) => c.claimNumber === n)
