import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { type Claim, claims, flags, money, parseDate } from '../data'
import DateInput, { normalizeDate } from '../components/DateInput'
import StatusBadge from '../components/StatusBadge'
import { Arrow, Flag, Folder, Help, Info } from '../components/Icons'

type Tab = 'patient' | 'claim' | 'tin' | 'all'
type Mode = 'dobid' | 'namedob' | 'nameid' | 'acct'

const MODES: { id: Mode; label: string }[] = [
  { id: 'dobid', label: 'Date of birth/Cigna patient ID' },
  { id: 'namedob', label: 'Name/Date of birth' },
  { id: 'nameid', label: 'Name/Cigna patient ID' },
  { id: 'acct', label: 'Provider-assigned account number' },
]
const FIELDS = ['dob', 'pid', 'first', 'last', 'acct', 'claimNo', 'tin', 'from', 'to'] as const
type Fields = Record<(typeof FIELDS)[number], string>
const EMPTY: Fields = { dob: '', pid: '', first: '', last: '', acct: '', claimNo: '', tin: '', from: '', to: '' }

const eq = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

function inRange(c: Claim, from: string, to: string) {
  const d = parseDate(c.dosFrom).getTime()
  const f = normalizeDate(from)
  const t = normalizeDate(to)
  if (f && d < parseDate(f).getTime()) return false
  if (t && d > parseDate(t).getTime()) return false
  return true
}

function runSearch(tab: Tab, mode: Mode, f: Fields, adjusted: boolean): Claim[] {
  let r = claims
  if (tab === 'patient') {
    const dob = normalizeDate(f.dob)
    if (mode === 'dobid') r = r.filter((c) => c.patient.dob === dob && eq(c.patient.id, f.pid))
    if (mode === 'namedob') r = r.filter((c) => eq(c.patient.firstName, f.first) && eq(c.patient.lastName, f.last) && c.patient.dob === dob)
    if (mode === 'nameid') r = r.filter((c) => eq(c.patient.firstName, f.first) && eq(c.patient.lastName, f.last) && eq(c.patient.id, f.pid))
    if (mode === 'acct') r = r.filter((c) => eq(c.providerAccountNumber, f.acct))
  } else if (tab === 'claim') {
    r = r.filter((c) => c.claimNumber === f.claimNo.replace(/\D/g, ''))
  } else if (tab === 'tin') {
    r = r.filter((c) => c.provider.tin === f.tin.replace(/\D/g, '') && inRange(c, f.from, f.to))
  } else {
    r = r.filter((c) => inRange(c, f.from, f.to))
  }
  if (adjusted) r = r.filter((c) => c.adjusted)
  return [...r].sort((a, b) => parseDate(b.dosFrom).getTime() - parseDate(a.dosFrom).getTime())
}

function validate(tab: Tab, mode: Mode, f: Fields): string {
  const needDate = (v: string, n: string) => (!normalizeDate(v) ? `Please enter a valid ${n} (MM/DD/YYYY).` : '')
  if (tab === 'patient') {
    if (mode === 'dobid') return needDate(f.dob, 'date of birth') || (!f.pid.trim() ? 'Please enter a patient ID.' : '')
    if (mode === 'namedob')
      return !f.first.trim() || !f.last.trim() ? 'Please enter the patient first and last name.' : needDate(f.dob, 'date of birth')
    if (mode === 'nameid')
      return !f.first.trim() || !f.last.trim() ? 'Please enter the patient first and last name.' : !f.pid.trim() ? 'Please enter a patient ID.' : ''
    if (mode === 'acct') return !f.acct.trim() ? 'Please enter a provider-assigned account number.' : ''
  }
  if (tab === 'claim') return !/^\d{8,15}$/.test(f.claimNo.replace(/\D/g, '')) ? 'Please enter a valid claim number.' : ''
  if (tab === 'tin') return !/^\d{9}$/.test(f.tin.replace(/\D/g, '')) ? 'Please enter a valid 9-digit TIN.' : ''
  for (const k of ['from', 'to'] as const) if (f[k] && !normalizeDate(f[k])) return 'Please enter valid dates of service (MM/DD/YYYY).'
  return ''
}

function downloadCsv(rows: Claim[]) {
  const head = ['Claim Number', 'Status', 'Patient Name', 'Patient ID', 'DOB', 'DOS From', 'DOS To', 'Submitted', 'Paid', 'Patient Responsibility', 'Received', 'Processed', 'TIN']
  const lines = rows.map((c) =>
    [c.claimNumber, c.status, `${c.patient.firstName} ${c.patient.lastName}`, c.patient.id, c.patient.dob, c.dosFrom, c.dosTo, c.submitted.toFixed(2), c.amountPaid.toFixed(2), c.patientResponsibility.toFixed(2), c.received, c.processed ?? '', c.provider.tin]
      .map((v) => `"${v}"`)
      .join(','),
  )
  const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'claims-search-results.csv'
  a.click()
}

export default function ClaimSearch() {
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'patient')
  const [mode, setMode] = useState<Mode>((params.get('mode') as Mode) || 'dobid')
  const [f, setF] = useState<Fields>(() => {
    const o = { ...EMPTY }
    FIELDS.forEach((k) => (o[k] = params.get(k) || ''))
    return o
  })
  const [err, setErr] = useState('')
  const [flagged, setFlagged] = useState(flags.get())
  const searched = params.get('run') === '1'
  const adjusted = params.get('adjusted') === '1'

  const results = useMemo(() => {
    if (!searched) return null
    const pTab = (params.get('tab') as Tab) || 'patient'
    const pMode = (params.get('mode') as Mode) || 'dobid'
    const pf = { ...EMPTY }
    FIELDS.forEach((k) => (pf[k] = params.get(k) || ''))
    return runSearch(pTab, pMode, pf, adjusted)
  }, [params, searched, adjusted])

  const adjustedCount = claims.filter((c) => c.adjusted).length
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement> | string) =>
    setF((o) => ({ ...o, [k]: typeof e === 'string' ? e : e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate(tab, mode, f)
    setErr(v)
    if (v) return
    const p: Record<string, string> = { tab, run: '1' }
    if (tab === 'patient') p.mode = mode
    const used: Record<string, (keyof Fields)[]> = {
      dobid: ['dob', 'pid'],
      namedob: ['first', 'last', 'dob'],
      nameid: ['first', 'last', 'pid'],
      acct: ['acct'],
      claim: ['claimNo'],
      tin: ['tin', 'from', 'to'],
      all: ['from', 'to'],
    }
    used[tab === 'patient' ? mode : tab].forEach((k) => f[k].trim() && (p[k] = f[k].trim()))
    setParams(p)
  }
  const reset = () => {
    setF(EMPTY)
    setErr('')
    setParams({})
  }
  const switchTab = (t: Tab) => {
    setTab(t)
    setErr('')
  }

  return (
    <div className="page">
      <h1 className="page-title">Claims search</h1>

      <div className="adj-card">
        <div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Info size={15} /> Adjusted claims
          </div>
          <span className="count">{adjustedCount}</span>
        </div>
        <button
          className="link"
          style={{ fontWeight: 500, display: 'flex', gap: 6, alignItems: 'center' }}
          onClick={() => {
            setTab('all')
            setParams({ tab: 'all', run: '1', adjusted: '1' })
          }}
        >
          View <Arrow />
        </button>
      </div>

      <div className="tabs" role="tablist">
        <button className={tab === 'patient' ? 'on' : ''} onClick={() => switchTab('patient')} role="tab">
          Patient
        </button>
        <button className={tab === 'claim' ? 'on' : ''} onClick={() => switchTab('claim')} role="tab">
          Claim number
        </button>
        <button className={tab === 'tin' ? 'on' : ''} onClick={() => switchTab('tin')} role="tab">
          Tax Identification number (TIN)
        </button>
        <button className={tab === 'all' ? 'on' : ''} onClick={() => switchTab('all')} role="tab">
          All
        </button>
        <span className="spacer" />
        <button
          style={{ color: results?.length ? 'var(--blue)' : '#999' }}
          disabled={!results?.length}
          onClick={() => results && downloadCsv(results)}
        >
          Download
        </button>
        <button aria-label="Help" style={{ color: 'var(--blue)' }} onClick={() => alert('Search by patient, claim number, TIN or view all claims.')}>
          <Help />
        </button>
      </div>

      <form onSubmit={submit} noValidate id="claim-search-form">
        {tab === 'patient' && (
          <div className="radios" role="radiogroup">
            {MODES.map((m) => (
              <label key={m.id}>
                <input type="radio" name="mode" value={m.id} checked={mode === m.id} onChange={() => { setMode(m.id); setErr('') }} />
                {m.label}
              </label>
            ))}
          </div>
        )}
        <div className="form-row" style={{ marginTop: tab === 'patient' ? 0 : 22 }}>
          {tab === 'patient' && (mode === 'namedob' || mode === 'nameid') && (
            <>
              <div className="fld">
                <label htmlFor="first">First name</label>
                <input id="first" name="first" value={f.first} onChange={set('first')} />
              </div>
              <div className="fld">
                <label htmlFor="last">Last name</label>
                <input id="last" name="last" value={f.last} onChange={set('last')} />
              </div>
            </>
          )}
          {tab === 'patient' && (mode === 'dobid' || mode === 'namedob') && (
            <div className="fld">
              <label htmlFor="dob">Date of birth</label>
              <DateInput id="dob" value={f.dob} onChange={set('dob')} />
            </div>
          )}
          {tab === 'patient' && (mode === 'dobid' || mode === 'nameid') && (
            <div className="fld">
              <label htmlFor="pid">Patient ID</label>
              <input id="pid" name="pid" value={f.pid} onChange={set('pid')} />
            </div>
          )}
          {tab === 'patient' && mode === 'acct' && (
            <div className="fld">
              <label htmlFor="acct">Provider-assigned account number</label>
              <input id="acct" name="acct" value={f.acct} onChange={set('acct')} style={{ width: 260 }} />
            </div>
          )}
          {tab === 'claim' && (
            <div className="fld">
              <label htmlFor="claimNo">Claim number</label>
              <input id="claimNo" name="claimNo" value={f.claimNo} onChange={set('claimNo')} style={{ width: 260 }} />
            </div>
          )}
          {tab === 'tin' && (
            <div className="fld">
              <label htmlFor="tin">Tax Identification number (TIN)</label>
              <input id="tin" name="tin" value={f.tin} onChange={set('tin')} style={{ width: 240 }} />
            </div>
          )}
          {(tab === 'tin' || tab === 'all') && (
            <>
              <div className="fld">
                <label htmlFor="from">Date of service from (optional)</label>
                <DateInput id="from" value={f.from} onChange={set('from')} />
              </div>
              <div className="fld">
                <label htmlFor="to">Date of service to (optional)</label>
                <DateInput id="to" value={f.to} onChange={set('to')} />
              </div>
            </>
          )}
          <button className="btn-primary" type="submit" id="search-btn" style={{ height: 40, padding: '0 22px', marginLeft: 20 }}>
            Search
          </button>
          <button type="button" className="btn-reset" onClick={reset}>
            Reset
          </button>
        </div>
        {err && <div className="form-err" role="alert">{err}</div>}
      </form>

      {!results && (
        <div className="search-empty">
          <Folder />
          <div>
            Enter search criteria in the fields above for
            <br />
            patients , claim numbers or TINs to retrieve your
            <br />
            claims .
          </div>
        </div>
      )}

      {results && (
        <>
          <div className="results-h">
            <div>
              <b>{results.length}</b> claim{results.length === 1 ? '' : 's'} found{adjusted ? ' (adjusted claims)' : ''}
            </div>
          </div>
          {results.length === 0 ? (
            <div className="search-empty">
              <Folder />
              <div>No claims match your search criteria. Please check the information and try again.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="grid" id="claim-results">
                <thead>
                  <tr>
                    <th></th>
                    <th>Claim number</th>
                    <th>Status</th>
                    <th>Patient name</th>
                    <th>Patient ID</th>
                    <th>Date of birth</th>
                    <th>Date(s) of service</th>
                    <th>Submitted amount</th>
                    <th>Paid amount</th>
                    <th>Received date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((c) => (
                    <tr key={c.claimNumber} data-claim={c.claimNumber}>
                      <td>
                        <button className={`flag-btn ${flagged.has(c.claimNumber) ? 'on' : ''}`} onClick={() => setFlagged(new Set(flags.toggle(c.claimNumber)))} aria-label="Flag claim">
                          <Flag filled={flagged.has(c.claimNumber)} />
                        </button>
                      </td>
                      <td>
                        <Link className="claim-num" to={`/app/claim/detail/${c.claimNumber}?tin=${c.provider.tin}&claimCompositeKey=${c.compositeKey}`}>
                          {c.claimNumber}
                        </Link>
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        {c.patient.firstName} {c.patient.lastName}
                      </td>
                      <td className="num">{c.patient.id}</td>
                      <td className="num">{c.patient.dob}</td>
                      <td className="num">
                        {c.dosFrom}-<br />
                        {c.dosTo}
                      </td>
                      <td className="num">{money(c.submitted)}</td>
                      <td className="num">{money(c.amountPaid)}</td>
                      <td className="num">{c.received}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
