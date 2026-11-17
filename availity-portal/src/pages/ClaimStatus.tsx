import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ORGANIZATION, PAYERS, PROVIDERS, type AvClaim, members, money } from '../data'
import DateInput from '../components/DateInput'
import StatusPill from '../components/StatusPill'
import { Csv, Printer, Q, Viewer } from '../components/Icons'
import { type CsForm, EMPTY_FORM, clearSearch, loadSearch, saveSearch, search, uuid, validate } from '../search'

function Field({ label, req, help, err, children, id }: { label: string; req?: boolean; help?: boolean; err?: string; children: React.ReactNode; id?: string }) {
  return (
    <div className={`fg ${err ? 'has-err' : ''}`}>
      <label htmlFor={id}>
        {req && <span className="req">* </span>}
        {label} {help && <Q />}
      </label>
      {children}
      {err && <div className="ferr">{err}</div>}
    </div>
  )
}

export function exportCsv(rows: AvClaim[]) {
  const head = ['Status', 'Finalized Date', 'Service From', 'Service To', 'Claim #', 'Member Name', 'Member ID', 'Billed Amount', 'Paid Amount']
  const body = rows.map((c) =>
    [c.status, c.finalized ?? '', c.dosFrom, c.dosTo, c.claimNumber, `${c.member.lastName}, ${c.member.firstName}`, c.member.memberId, c.billed.toFixed(2), c.paid.toFixed(2)]
      .map((v) => `"${v}"`)
      .join(','),
  )
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([[head.join(','), ...body].join('\n')], { type: 'text/csv' }))
  a.download = 'claim-status-results.csv'
  a.click()
}

export default function ClaimStatus() {
  const nav = useNavigate()
  const saved = useMemo(() => loadSearch(), [])
  const [f, setF] = useState<CsForm>(saved?.form ?? EMPTY_FORM)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [run, setRun] = useState<{ asOf: string; txId: string; form: CsForm } | null>(saved)
  const results = useMemo(() => (run ? search(run.form) : null), [run])
  const set = <K extends keyof CsForm>(k: K, v: CsForm[K]) => setF((o) => ({ ...o, [k]: v }))
  const payerMembers = members.filter((m) => m.payerId === f.payerId)

  const pickMember = (key: string) => {
    const m = members.find((x) => x.key === key)
    if (!m) return setF((o) => ({ ...o, memberKey: '' }))
    setF((o) => ({
      ...o,
      memberKey: key,
      memberId: m.memberId,
      lastName: m.lastName,
      firstName: m.firstName,
      dob: m.dob,
      relationship: m.relationship,
      subLast: m.relationship === 'SELF' ? '' : m.subLast,
      subFirst: m.relationship === 'SELF' ? '' : `${m.subFirst}${m.subMiddle ? ' ' + m.subMiddle : ''}`,
    }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate(f)
    setErrs(v)
    if (Object.keys(v).length) return
    const now = new Date()
    const s = {
      form: f,
      txId: uuid(),
      asOf: now.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(' at', ''),
    }
    saveSearch(s)
    setRun(s)
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }
  const clear = () => {
    setF(EMPTY_FORM)
    setErrs({})
    setRun(null)
    clearSearch()
  }

  return (
    <div className="cs-page">
      <div className="crumbs">Home › Claim Status</div>
      <h1 className="app-title"><span className="cs-badge">CS</span> Claim Status</h1>

      <form onSubmit={submit} noValidate className="cs-form" id="claim-status-form">
        <div className="grid2">
          <Field label="Organization" req id="org">
            <select id="org" value={ORGANIZATION.name} disabled>
              <option>{ORGANIZATION.name}</option>
            </select>
          </Field>
          <Field label="Payer" req err={errs.payerId} id="payer">
            <select id="payer" value={f.payerId} onChange={(e) => setF({ ...f, payerId: e.target.value, memberKey: '' })}>
              <option value="">Select...</option>
              {PAYERS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <h2 className="fs-title">Provider Information</h2>
        <div className="fg">
          <label><span className="req">* </span>Is the provider the same as the organization name? <Q /></label>
          <div className="radios">
            <label><input type="radio" name="same" checked={f.providerSame === 'yes'} onChange={() => setF({ ...f, providerSame: 'yes', providerId: '', npi: ORGANIZATION.npi, tin: ORGANIZATION.tin })} /> Yes</label>
            <label><input type="radio" name="same" checked={f.providerSame === 'no'} onChange={() => set('providerSame', 'no')} /> No</label>
          </div>
        </div>
        <div className="grid2">
          <Field label="Select a Provider" help id="provider">
            <select
              id="provider"
              value={f.providerId}
              disabled={f.providerSame === 'yes'}
              onChange={(e) => {
                const p = PROVIDERS.find((x) => x.id === e.target.value)
                setF({ ...f, providerId: e.target.value, npi: p?.npi ?? '', tin: p?.tin ?? '' })
              }}
            >
              <option value="">Select...</option>
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.name} - NPI {p.npi}</option>
              ))}
            </select>
          </Field>
          <Field label="Provider NPI" req help err={errs.npi} id="npi">
            <input id="npi" value={f.npi} onChange={(e) => set('npi', e.target.value.replace(/\D/g, '').slice(0, 10))} />
          </Field>
          <Field label="Provider Tax ID" help id="tin">
            <input id="tin" value={f.tin} onChange={(e) => set('tin', e.target.value.replace(/\D/g, '').slice(0, 9))} />
          </Field>
          <Field label="Payer Assigned Provider ID" help id="ppid">
            <input id="ppid" value={f.payerProviderId} onChange={(e) => set('payerProviderId', e.target.value)} />
          </Field>
        </div>

        <h2 className="fs-title">Patient Information</h2>
        <div className="grid2">
          <Field label="Select a Patient" help id="patient">
            <div className="sel-clear">
              <select id="patient" value={f.memberKey} onChange={(e) => pickMember(e.target.value)} disabled={!f.payerId}>
                <option value="">{f.payerId ? 'Select...' : 'Select a payer first'}</option>
                {payerMembers.map((m) => (
                  <option key={m.key} value={m.key}>{m.lastName}, {m.firstName} - {m.memberId}</option>
                ))}
              </select>
              <button type="button" className="linkbtn muted" onClick={() => pickMember('')}>clear</button>
            </div>
          </Field>
          <Field label="Member ID" req help err={errs.memberId} id="memberId">
            <input id="memberId" value={f.memberId} onChange={(e) => set('memberId', e.target.value.toUpperCase())} />
          </Field>
          <Field label="Patient Last Name" req err={errs.lastName} id="lastName">
            <input id="lastName" value={f.lastName} onChange={(e) => set('lastName', e.target.value.toUpperCase())} />
          </Field>
          <Field label="Patient First Name" req err={errs.firstName} id="firstName">
            <input id="firstName" value={f.firstName} onChange={(e) => set('firstName', e.target.value.toUpperCase())} />
          </Field>
          <Field label="Patient Birth Date" req err={errs.dob} id="dob">
            <DateInput id="dob" value={f.dob} onChange={(v) => set('dob', v)} />
          </Field>
          <Field label="Subscriber Relationship" req err={errs.relationship} id="relationship">
            <select id="relationship" value={f.relationship} onChange={(e) => set('relationship', e.target.value as CsForm['relationship'])}>
              <option value="">Select...</option>
              <option value="SELF">Self</option>
              <option value="SPOUSE">Spouse</option>
              <option value="DEPENDENT">Child / Dependent</option>
            </select>
          </Field>
          {f.relationship && f.relationship !== 'SELF' && (
            <>
              <Field label="Subscriber Last Name" req err={errs.subLast} id="subLast">
                <input id="subLast" value={f.subLast} onChange={(e) => set('subLast', e.target.value.toUpperCase())} />
              </Field>
              <Field label="Subscriber First Name" req err={errs.subFirst} id="subFirst">
                <input id="subFirst" value={f.subFirst} onChange={(e) => set('subFirst', e.target.value.toUpperCase())} />
              </Field>
            </>
          )}
        </div>

        <h2 className="fs-title">Claim Information</h2>
        <div className="fg">
          <label><span className="req">* </span>Service Dates <Q /></label>
          <div className="range">
            <DateInput id="from" value={f.from} onChange={(v) => set('from', v)} />
            <span className="dash">-</span>
            <DateInput id="to" value={f.to} onChange={(v) => set('to', v)} />
          </div>
          {errs.from && <div className="ferr">{errs.from}</div>}
        </div>
        <div className="grid2">
          <Field label="Claim Number" help id="claimNumber">
            <input id="claimNumber" value={f.claimNumber} onChange={(e) => set('claimNumber', e.target.value.toUpperCase())} />
          </Field>
          <Field label="Claim Amount" err={errs.claimAmount} id="claimAmount">
            <input id="claimAmount" value={f.claimAmount} onChange={(e) => set('claimAmount', e.target.value)} />
          </Field>
          <Field label="Institutional Bill Type" help id="billType">
            <input id="billType" value={f.billType} onChange={(e) => set('billType', e.target.value)} />
          </Field>
        </div>
        {Object.keys(errs).length > 0 && <div className="err" role="alert">Please correct the highlighted fields.</div>}
        <div className="form-actions">
          <button type="submit" className="btn-dark" id="submit">Submit</button>
          <button type="button" className="btn-plain" onClick={clear}>Clear Form</button>
        </div>
      </form>

      <div className="version">
        <b>Claim Status Version</b> 2.0
      </div>

      {run && results && (
        <section id="results" className="results">
          <div className="res-head">
            <div>
              <h2>Results (Displaying {results.length ? `1 - ${results.length}` : '0'} of {results.length})</h2>
              <div className="small">As of {run.asOf}</div>
              <div className="small"><b>Transaction ID:</b> {run.txId}</div>
            </div>
            <div className="res-tools">
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Results show the most recent status returned by the payer.') }}><Viewer /> Learn about search results</a>
              <button className="linkbtn dark" disabled={!results.length} onClick={() => exportCsv(results)}>Export to CSV <Csv /></button>
              <button className="linkbtn dark" onClick={() => window.print()}>Print Page <Printer /></button>
            </div>
          </div>
          {results.length === 0 ? (
            <div className="no-res">No claims were found that match the search criteria. Please verify the patient, provider and service date information and try again.</div>
          ) : (
            <table className="tbl" id="results-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Finalized Date</th>
                  <th>Service Dates</th>
                  <th>Claim #</th>
                  <th>Member Name</th>
                  <th>Member ID</th>
                  <th className="r">Billed Amount</th>
                  <th className="r">Paid Amount</th>
                </tr>
              </thead>
              <tbody>
                {results.map((c) => (
                  <tr key={c.claimNumber} data-claim={c.claimNumber}>
                    <td><StatusPill status={c.status} onClick={() => nav(`/claim-status/detail/${c.claimNumber}`)} /></td>
                    <td>{c.finalized ?? '--'}</td>
                    <td>{c.dosFrom}<br />{c.dosTo}</td>
                    <td>{c.claimNumber}</td>
                    <td>{c.member.lastName},<br />{c.member.firstName}</td>
                    <td>{c.member.memberId}</td>
                    <td className="r">{money(c.billed)}</td>
                    <td className="r">{money(c.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  )
}
