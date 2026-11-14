// Dummy data for the demo portal. Everything here is fictional.

export type ClaimStatus = 'PROCESSED' | 'PENDED' | 'DENIED' | 'IN PROCESS'

export interface Patient {
  firstName: string
  lastName: string
  dob: string // MM/DD/YYYY
  id: string // Cigna patient ID
  group: string
  plan: string
  relationship: string
  address: string
}

export interface Provider {
  tin: string
  payeeName: string
  address: string[]
  renderingName: string
  npi: string
}

export interface Procedure {
  code: string
  description: string
  dosFrom: string
  dosTo: string
  pos: string
  charged: number
  allowed: number
  notCovered: number
  deductible: number
  copay: number
  coveredBalance: number
  planPct: number
  planPaid: number
  patientPct: number
  patientCoins: number
  patientResp: number
  remarkCodes: string[]
}

export interface Payment {
  payeeName: string
  payeeAddress: string[]
  amount: number
  trackingNumber: string
  status: 'Paid' | 'Issued'
  issued: string
  cleared: string
  method: 'EFT' | 'CHECK'
}

export interface Remittance {
  trackingNumber: string
  tin: string
  paymentDate: string
  depositAmount: number
  productType: string
  reportType: string
  pages: number
}

export interface HistoryItem {
  date: string
  type: string
  description: string
  status: string
}

export interface Claim {
  claimNumber: string
  status: ClaimStatus
  adjusted: boolean
  patient: Patient
  providerAccountNumber: string
  provider: Provider
  dosFrom: string
  dosTo: string
  received: string
  processed: string | null
  procedures: Procedure[]
  submitted: number
  amountDue: number
  amountPaid: number
  patientResponsibility: number
  payment: Payment | null
  remittance: Remittance | null
  supporting: HistoryItem[]
  reconsideration: HistoryItem[]
  correspondence: HistoryItem[]
  compositeKey: string
}

export const REMARK_CODES: Record<string, string> = {
  '0248': 'This amount reflects the contracted rate for this service under the provider agreement. The member is not responsible for the difference between billed and allowed amounts.',
  '0110': 'The copay required by the patient\'s plan has been applied to this service.',
  '0372': 'The deductible required by the patient\'s plan has been applied to this service.',
  '0517': 'Coinsurance has been applied according to the patient\'s benefit plan.',
  '0891': 'This service is not covered because the information submitted does not support medical necessity. Please submit medical records for reconsideration.',
  '0904': 'This claim is pending additional information. Please upload the requested documentation.',
  '0631': 'This service is included in the payment for another service performed on the same date (bundled).',
  '0773': 'Claim was received after the timely filing limit for this plan.',
  '0215': 'This claim has been adjusted. The original claim payment has been reprocessed.',
}

export const PROVIDERS: Provider[] = [
  {
    tin: '273377866',
    payeeName: '/SANJAY SRIVATSA INC',
    address: ['222 W SHAW AVE', 'FRESNO, CA', '93704-2644'],
    renderingName: 'Srivatsa MD , Sanjay',
    npi: '1730218846',
  },
  {
    tin: '841692305',
    payeeName: 'VALLEY HEART & VASCULAR GROUP',
    address: ['1450 E HERNDON AVE STE 200', 'FRESNO, CA', '93720-3311'],
    renderingName: 'Okafor MD , Adaeze',
    npi: '1295847720',
  },
]

const PATIENTS: Patient[] = [
  ['Anamaria', 'Cerda', '03/14/1968', 'U46353873'],
  ['Kimberlee', 'Chin', '11/02/1975', '112185095'],
  ['Leticia', 'Urbina', '07/22/1959', 'U71440097'],
  ['Gurpreet', 'Sandhu', '01/30/1982', 'U58201146'],
  ['Michael', 'Thompson', '05/09/1954', 'U30918472'],
  ['Rosa', 'Delgado', '09/17/1971', 'U62874015'],
  ['David', 'Nguyen', '12/03/1988', '113402268'],
  ['Patricia', 'Wallace', '04/25/1949', 'U19385560'],
  ['James', 'Ortega', '08/11/1963', 'U84102937'],
  ['Emily', 'Hawkins', '02/19/1993', '114778501'],
  ['Harpreet', 'Gill', '06/06/1977', 'U27760384'],
  ['Robert', 'Castillo', '10/28/1958', 'U90462718'],
  ['Linda', 'Moreno', '03/03/1966', 'U51189026'],
  ['Christopher', 'Lee', '11/21/1980', '115230947'],
  ['Maria', 'Gonzalez', '07/04/1972', 'U73015649'],
  ['Steven', 'Parker', '01/12/1961', 'U44638271'],
  ['Angela', 'Brooks', '09/29/1985', 'U66512093'],
  ['Thomas', 'Ramirez', '05/15/1951', 'U38894120'],
].map(([firstName, lastName, dob, id], i) => ({
  firstName,
  lastName,
  dob,
  id,
  group: ['3341562', '0629874', '3209981', '1187730'][i % 4],
  plan: ['Open Access Plus (OAP)', 'PPO', 'LocalPlus', 'Open Access Plus (OAP)'][i % 4],
  relationship: i % 3 === 0 ? 'Spouse' : 'Employee',
  address: `${100 + i * 37} ${['N Blackstone Ave', 'E Shields Ave', 'W Bullard Ave', 'N Fresno St'][i % 4]}, Fresno, CA 937${10 + (i % 20)}`,
}))

export const patients = PATIENTS

// ---------- helpers ----------
let seed = 20260914
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)]
const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))
const digits = (n: number) => Array.from({ length: n }, () => int(0, 9)).join('')
const r2 = (n: number) => Math.round(n * 100) / 100

export function parseDate(s: string): Date {
  const [m, d, y] = s.split('/').map(Number)
  return new Date(y, m - 1, d)
}
export function fmtDate(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}
const addDays = (s: string, n: number) => {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return fmtDate(d)
}
export const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const CATALOG: { code: string; description: string; charge: number; allowed: number }[] = [
  { code: '93350', description: 'Stress echocardiogram', charge: 380, allowed: 259.26 },
  { code: '99213', description: 'Office/outpatient visit, established, low', charge: 230, allowed: 142.18 },
  { code: '99214', description: 'Office/outpatient visit, established, moderate', charge: 310, allowed: 198.4 },
  { code: '99203', description: 'Office/outpatient visit, new, low', charge: 260, allowed: 161.72 },
  { code: '93000', description: 'Electrocardiogram, complete', charge: 85, allowed: 24.65 },
  { code: '93306', description: 'Echocardiography, transthoracic, complete', charge: 520, allowed: 312.44 },
  { code: '93880', description: 'Duplex scan, extracranial arteries', charge: 410, allowed: 228.9 },
  { code: '36415', description: 'Routine venipuncture', charge: 25, allowed: 3 },
  { code: '80053', description: 'Comprehensive metabolic panel', charge: 60, allowed: 14.39 },
  { code: '93015', description: 'Cardiovascular stress test', charge: 350, allowed: 97.82 },
  { code: 'G0439', description: 'Annual wellness visit, subsequent', charge: 280, allowed: 132.5 },
]

function buildProcedure(
  item: (typeof CATALOG)[number],
  dos: string,
  opts: { copay?: number; deductible?: number; coinsPct?: number; denied?: boolean },
): Procedure {
  const charged = item.charge
  if (opts.denied) {
    return {
      code: item.code, description: item.description, dosFrom: dos, dosTo: dos, pos: '11',
      charged, allowed: 0, notCovered: charged, deductible: 0, copay: 0, coveredBalance: 0,
      planPct: 0, planPaid: 0, patientPct: 0, patientCoins: 0, patientResp: 0, remarkCodes: ['0891'],
    }
  }
  const allowed = item.allowed
  const notCovered = r2(charged - allowed)
  const copay = Math.min(opts.copay ?? 0, allowed)
  const deductible = Math.min(opts.deductible ?? 0, r2(allowed - copay))
  const afterCostShare = r2(allowed - copay - deductible)
  const coinsPct = opts.coinsPct ?? 0
  const patientCoins = r2(afterCostShare * (coinsPct / 100))
  const planPaid = r2(afterCostShare - patientCoins)
  const remarkCodes = ['0248']
  if (copay) remarkCodes.push('0110')
  if (deductible) remarkCodes.push('0372')
  if (patientCoins) remarkCodes.push('0517')
  return {
    code: item.code, description: item.description, dosFrom: dos, dosTo: dos, pos: '11',
    charged, allowed, notCovered, deductible, copay,
    coveredBalance: afterCostShare,
    planPct: 100 - coinsPct, planPaid, patientPct: coinsPct, patientCoins,
    patientResp: r2(copay + deductible + patientCoins),
    remarkCodes,
  }
}

interface Spec {
  claimNumber?: string
  patient: Patient
  provider: Provider
  dos: string
  items: string[]
  status: ClaimStatus
  copay?: number
  deductible?: number
  coinsPct?: number
  receivedLag?: number
  processLag?: number
  accountNumber?: string
  remitTracking?: string
  remitPages?: number
  adjusted?: boolean
  supporting?: HistoryItem[]
  reconsideration?: HistoryItem[]
  correspondence?: HistoryItem[]
}

function buildClaim(s: Spec): Claim {
  const claimNumber = s.claimNumber ?? digits(13).replace(/^0/, '4')
  const received = addDays(s.dos, s.receivedLag ?? int(6, 24))
  const processed = s.status === 'PENDED' || s.status === 'IN PROCESS' ? null : addDays(received, s.processLag ?? int(2, 9))
  const denied = s.status === 'DENIED'
  const procs = s.items.map((code, i) =>
    buildProcedure(CATALOG.find((c) => c.code === code)!, s.dos, {
      copay: i === 0 ? s.copay : 0,
      deductible: i === 0 ? s.deductible : 0,
      coinsPct: s.coinsPct,
      denied,
    }),
  )
  const sum = (k: keyof Procedure) => r2(procs.reduce((a, p) => a + (p[k] as number), 0))
  const amountDue = sum('coveredBalance')
  const amountPaid = processed ? sum('planPaid') : 0
  const patientResponsibility = sum('patientResp')

  let payment: Payment | null = null
  let remittance: Remittance | null = null
  if (processed && amountPaid > 0) {
    const issued = processed
    const cleared = addDays(issued, 3)
    const d = parseDate(issued)
    const tracking =
      s.remitTracking ??
      `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}090${digits(6)}`
    payment = {
      payeeName: s.provider.payeeName,
      payeeAddress: s.provider.address,
      amount: amountPaid,
      trackingNumber: tracking,
      status: 'Paid',
      issued,
      cleared,
      method: 'EFT',
    }
    remittance = {
      trackingNumber: tracking,
      tin: s.provider.tin,
      paymentDate: cleared,
      depositAmount: amountPaid,
      productType: s.patient.plan.includes('PPO') ? 'PPO/OAP' : 'PPO/OAP',
      reportType: 'Remittance Report',
      pages: s.remitPages ?? int(2, 6),
    }
  }

  return {
    claimNumber,
    status: s.status,
    adjusted: !!s.adjusted,
    patient: s.patient,
    providerAccountNumber: s.accountNumber ?? `${digits(6)}Z${digits(5)}`,
    provider: s.provider,
    dosFrom: s.dos,
    dosTo: s.dos,
    received,
    processed,
    procedures: procs,
    submitted: sum('charged'),
    amountDue,
    amountPaid,
    patientResponsibility,
    payment,
    remittance,
    supporting: s.supporting ?? [],
    reconsideration: s.reconsideration ?? [],
    correspondence: s.correspondence ?? [],
    compositeKey: `3l3p31s3Z70123ZL${digits(4)}FEL${digits(3)}FGQVSZLV${digits(4)}FLS`,
  }
}

const P = (last: string) => PATIENTS.find((p) => p.lastName === last)!
const [SRIVATSA, VALLEY] = PROVIDERS

// Claims taken from the reference screenshots (kept exact)
const FIXED: Claim[] = [
  buildClaim({
    claimNumber: '9672624094335', patient: P('Cerda'), provider: SRIVATSA, dos: '08/06/2026', items: ['93350'],
    status: 'PROCESSED', copay: 50, receivedLag: 21, processLag: 2, accountNumber: '268361Z56076',
    remitTracking: '260829090061712', remitPages: 4,
  }),
  buildClaim({
    claimNumber: '262589025600', patient: P('Chin'), provider: SRIVATSA, dos: '07/06/2026', items: ['99213'],
    status: 'PROCESSED', copay: 30, accountNumber: '268361Z55190',
  }),
  buildClaim({
    claimNumber: '4432618102179', patient: P('Urbina'), provider: SRIVATSA, dos: '05/07/2026', items: ['99213'],
    status: 'PROCESSED', copay: 20, accountNumber: '268361Z53318',
  }),
  buildClaim({
    claimNumber: '4672529691844', patient: P('Sandhu'), provider: SRIVATSA, dos: '04/22/2026', items: ['99214', '93000'],
    status: 'PROCESSED', copay: 30, accountNumber: '268361Z52047', remitTracking: '261015090067697', remitPages: 6,
  }),
]

const GENERATED: Claim[] = []
const statuses: ClaimStatus[] = ['PROCESSED', 'PROCESSED', 'PROCESSED', 'PROCESSED', 'PROCESSED', 'PENDED', 'DENIED', 'IN PROCESS']
const combos = [['99213'], ['99214'], ['99214', '93000'], ['93306'], ['93880'], ['99203', '36415', '80053'], ['93015', '93000'], ['G0439'], ['93350'], ['99213', '36415']]
PATIENTS.forEach((patient, pi) => {
  const n = pi < 4 ? int(1, 2) : int(2, 4)
  for (let k = 0; k < n; k++) {
    const month = int(3, 10)
    let status = pick(statuses)
    const dos = fmtDate(new Date(2026, month - 1, int(1, 28)))
    if (month >= 10 && status === 'PROCESSED') status = 'PENDED'
    const isPended = status === 'PENDED'
    const adjusted = status === 'PROCESSED' && rnd() < 0.18
    GENERATED.push(
      buildClaim({
        patient,
        provider: rnd() < 0.7 ? SRIVATSA : VALLEY,
        dos,
        items: pick(combos),
        status,
        copay: pick([0, 20, 30, 50]),
        deductible: rnd() < 0.25 ? pick([25, 40, 75]) : 0,
        coinsPct: rnd() < 0.3 ? 20 : 0,
        adjusted,
        supporting: isPended
          ? [{ date: addDays(dos, 30), type: 'Request', description: 'Medical records requested (office notes for DOS)', status: 'Awaiting upload' }]
          : [],
        reconsideration: adjusted
          ? [{ date: addDays(dos, 45), type: 'Reconsideration', description: 'Provider requested review of allowed amount', status: 'Completed – claim adjusted' }]
          : status === 'DENIED' && rnd() < 0.5
            ? [{ date: addDays(dos, 40), type: 'Appeal', description: 'Level 1 appeal submitted with medical records', status: 'In review' }]
            : [],
        correspondence:
          status === 'DENIED'
            ? [{ date: addDays(dos, 28), type: 'Letter', description: 'Explanation of denial mailed to provider', status: 'Sent' }]
            : [],
      }),
    )
  }
})
GENERATED.forEach((c) => {
  if (c.adjusted) {
    c.procedures.forEach((p) => p.remarkCodes.push('0215'))
  }
})

const byDosDesc = (a: Claim, b: Claim) => parseDate(b.dosFrom).getTime() - parseDate(a.dosFrom).getTime()

export const claims: Claim[] = [...FIXED, ...GENERATED.sort(byDosDesc)]

export const findClaim = (n: string) => claims.find((c) => c.claimNumber === n.trim())

export const allRemittances = (): (Remittance & { claims: Claim[] })[] => {
  const map = new Map<string, Remittance & { claims: Claim[] }>()
  claims.forEach((c) => {
    if (!c.remittance) return
    const r = map.get(c.remittance.trackingNumber)
    if (r) r.claims.push(c)
    else map.set(c.remittance.trackingNumber, { ...c.remittance, claims: [c] })
  })
  return [...map.values()].sort((a, b) => parseDate(b.paymentDate).getTime() - parseDate(a.paymentDate).getTime())
}

// ---------- flags & read state (per browser) ----------
function readSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'))
  } catch {
    return new Set()
  }
}
function writeSet(key: string, s: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...s]))
  } catch {
    /* ignore */
  }
}
export const flags = {
  get: () => readSet('hcp.flags'),
  toggle(n: string) {
    const s = readSet('hcp.flags')
    s.has(n) ? s.delete(n) : s.add(n)
    writeSet('hcp.flags', s)
    return s
  },
}
export const remitRead = {
  get: () => readSet('hcp.remitRead'),
  toggle(n: string) {
    const s = readSet('hcp.remitRead')
    s.has(n) ? s.delete(n) : s.add(n)
    writeSet('hcp.remitRead', s)
    return s
  },
  mark(n: string) {
    const s = readSet('hcp.remitRead')
    s.add(n)
    writeSet('hcp.remitRead', s)
    return s
  },
}
