import { type Claim, PAYERS, addDays, claims, fmtDate, parseDate } from './data'
import { normalizeDate } from './components/DateInput'

export type Criteria = 'idDob' | 'idName' | 'nameDob' | 'acctClaim' | 'provider'
export const CRITERIA: { id: Criteria; label: string }[] = [
  { id: 'idDob', label: 'Member ID & date of birth' },
  { id: 'idName', label: 'Member ID & member name' },
  { id: 'nameDob', label: 'Member name & date of birth' },
  { id: 'acctClaim', label: 'Patient account number or claim number' },
  { id: 'provider', label: 'Provider information' },
]
export const PREDEF = [
  { id: '30', label: 'Last 30 days' },
  { id: '60', label: 'Last 60 days' },
  { id: '90', label: 'Last 90 days' },
  { id: '180', label: 'Last 6 months' },
  { id: '365', label: 'Last 12 months' },
  { id: '730', label: 'Last 24 months' },
]

export interface Q {
  criteria: Criteria
  by: 'tin' | 'provider'
  memberId: string
  dob: string
  first: string
  last: string
  acct: string
  range: 'custom' | 'predef'
  predef: string
  from: string
  to: string
}
export const EMPTY_Q: Q = { criteria: 'idDob', by: 'tin', memberId: '', dob: '', first: '', last: '', acct: '', range: 'custom', predef: '90', from: '', to: '' }

export const TODAY = () => fmtDate(new Date())

export function dateWindow(q: Q): [string, string] | null {
  if (q.criteria === 'acctClaim') return null
  if (q.range === 'predef') return [addDays(TODAY(), -Number(q.predef)), TODAY()]
  return [normalizeDate(q.from) ?? '', normalizeDate(q.to) ?? '']
}

export function validate(q: Q): Record<string, string> {
  const e: Record<string, string> = {}
  const need = (k: keyof Q, m: string) => { if (!String(q[k]).trim()) e[k] = m }
  if (q.criteria === 'idDob' || q.criteria === 'idName') need('memberId', 'Enter a member ID.')
  if (q.criteria === 'idDob' || q.criteria === 'nameDob') { if (!normalizeDate(q.dob)) e.dob = 'Enter a valid date of birth (mm/dd/yyyy).' }
  if (q.criteria === 'idName' || q.criteria === 'nameDob') { need('first', 'Enter a first name.'); need('last', 'Enter a last name.') }
  if (q.criteria === 'acctClaim') need('acct', 'Enter a patient account number or claim number.')
  if (q.criteria !== 'acctClaim' && q.range === 'custom') {
    const a = normalizeDate(q.from), b = normalizeDate(q.to)
    if (!a) e.from = 'Enter a first service date.'
    if (!b) e.to = 'Enter a last service date.'
    if (a && b) {
      if (parseDate(a) > parseDate(b)) e.to = 'Last service date must be on or after the first service date.'
      else if (parseDate(a) < parseDate(addDays(TODAY(), -730))) e.from = 'You may search for claims up to 24 months from the last processed date.'
    }
  }
  return e
}

const eq = (a: string, b: string) => a.trim().toUpperCase() === b.trim().toUpperCase()

export function runSearch(q: Q, payerId: string): { rows: Claim[]; otherPayer: string | null } {
  const win = dateWindow(q)
  const dob = normalizeDate(q.dob)
  const all = claims.filter((c) => {
    const m = c.member
    if (q.criteria === 'idDob' && !(eq(m.id, q.memberId) && m.dob === dob)) return false
    if (q.criteria === 'idName' && !(eq(m.id, q.memberId) && eq(m.firstName, q.first) && eq(m.lastName, q.last))) return false
    if (q.criteria === 'nameDob' && !(eq(m.firstName, q.first) && eq(m.lastName, q.last) && m.dob === dob)) return false
    if (q.criteria === 'acctClaim' && !(eq(c.claimNumber, q.acct) || eq(c.patientAccount, q.acct))) return false
    if (win) {
      const d = parseDate(c.dosFrom).getTime()
      if (d < parseDate(win[0]).getTime() || d > parseDate(win[1]).getTime()) return false
    }
    return true
  })
  const rows = all.filter((c) => c.member.payerId === payerId)
  const other = rows.length === 0 && all.length ? all[0].member.payerId : null
  const p = PAYERS.find((x) => x.id === other)
  return {
    rows: rows.sort((a, b) => parseDate(b.dosFrom).getTime() - parseDate(a.dosFrom).getTime()),
    otherPayer: p ? `${p.id.replace('-CP', '')} - ${p.name}` : null,
  }
}

export const toParams = (q: Q) => {
  const o: Record<string, string> = {}
  ;(Object.keys(q) as (keyof Q)[]).forEach((k) => { if (q[k]) o[k] = q[k] })
  return new URLSearchParams(o).toString()
}
export const fromParams = (p: URLSearchParams): Q => {
  const q = { ...EMPTY_Q }
  ;(Object.keys(q) as (keyof Q)[]).forEach((k) => { const v = p.get(k); if (v) (q as Record<string, string>)[k] = v })
  return q
}
