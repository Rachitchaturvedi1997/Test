import { type AvClaim, claims, parseDate } from './data'
import { normalizeDate } from './components/DateInput'

export interface CsForm {
  payerId: string
  providerSame: 'yes' | 'no'
  providerId: string
  npi: string
  tin: string
  payerProviderId: string
  memberKey: string
  memberId: string
  lastName: string
  firstName: string
  dob: string
  relationship: '' | 'SELF' | 'SPOUSE' | 'DEPENDENT'
  subLast: string
  subFirst: string
  from: string
  to: string
  claimNumber: string
  claimAmount: string
  billType: string
}

export const EMPTY_FORM: CsForm = {
  payerId: '', providerSame: 'yes', providerId: '', npi: '1588603369', tin: '273377866', payerProviderId: '',
  memberKey: '', memberId: '', lastName: '', firstName: '', dob: '', relationship: '', subLast: '', subFirst: '',
  from: '', to: '', claimNumber: '', claimAmount: '', billType: '',
}

export function validate(f: CsForm): Record<string, string> {
  const e: Record<string, string> = {}
  const req = (k: keyof CsForm, msg: string) => { if (!String(f[k]).trim()) e[k] = msg }
  req('payerId', 'Payer is required.')
  if (!/^\d{10}$/.test(f.npi.trim())) e.npi = 'Enter a valid 10-digit Provider NPI.'
  req('memberId', 'Member ID is required.')
  req('lastName', 'Patient Last Name is required.')
  req('firstName', 'Patient First Name is required.')
  if (!normalizeDate(f.dob)) e.dob = 'Enter a valid Patient Birth Date (MM/DD/YYYY).'
  req('relationship', 'Subscriber Relationship is required.')
  if (f.relationship && f.relationship !== 'SELF') {
    req('subLast', 'Subscriber Last Name is required.')
    req('subFirst', 'Subscriber First Name is required.')
  }
  const a = normalizeDate(f.from), b = normalizeDate(f.to)
  if (!a || !b) e.from = 'Enter valid Service Dates (MM/DD/YYYY).'
  else if (parseDate(a) > parseDate(b)) e.from = 'The From date must be on or before the To date.'
  if (f.claimAmount && isNaN(Number(f.claimAmount.replace(/[$,]/g, '')))) e.claimAmount = 'Enter a valid amount.'
  return e
}

const eq = (a: string, b: string) => a.replace(/\s+/g, ' ').trim().toLowerCase() === b.replace(/\s+/g, ' ').trim().toLowerCase()

export function search(f: CsForm): AvClaim[] {
  const dob = normalizeDate(f.dob)
  const from = parseDate(normalizeDate(f.from)!).getTime()
  const to = parseDate(normalizeDate(f.to)!).getTime()
  const amt = f.claimAmount ? Number(f.claimAmount.replace(/[$,]/g, '')) : null
  return claims.filter((c) => {
    if (c.payerId !== f.payerId) return false
    if (c.provider.npi !== f.npi.trim() && c.provider.tin !== f.tin.replace(/\D/g, '')) return false
    if (!eq(c.member.memberId, f.memberId) || !eq(c.member.lastName, f.lastName) || !eq(c.member.firstName, f.firstName) || c.member.dob !== dob) return false
    const d = parseDate(c.dosFrom).getTime()
    if (d < from || d > to) return false
    if (f.claimNumber.trim() && !eq(c.claimNumber, f.claimNumber)) return false
    if (amt !== null && Math.abs(c.billed - amt) > 0.005) return false
    return true
  })
}

const KEY = 'av.lastSearch'
export interface Saved { form: CsForm; asOf: string; txId: string }
export const saveSearch = (s: Saved) => { try { sessionStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ } }
export const loadSearch = (): Saved | null => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null') } catch { return null } }
export const clearSearch = () => { try { sessionStorage.removeItem(KEY) } catch { /* ignore */ } }
export const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
  const r = (Math.random() * 16) | 0
  return (ch === 'x' ? r : (r & 3) | 8).toString(16)
})
