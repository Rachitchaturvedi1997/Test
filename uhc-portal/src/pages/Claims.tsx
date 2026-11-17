import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PROVIDER } from '../data'
import DateInput from '../components/DateInput'
import { Ext } from '../components/Icons'
import { CRITERIA, PREDEF, type Q, fromParams, toParams, validate } from '../search'

export default function Claims() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState<Q>(fromParams(params))
  const [errs, setErrs] = useState<Record<string, string>>({})
  const set = <K extends keyof Q>(k: K, v: Q[K]) => setQ((o) => ({ ...o, [k]: v }))
  const c = q.criteria
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate(q)
    setErrs(v)
    if (!Object.keys(v).length) nav(`/claims/results?${toParams(q)}`)
  }
  const F = ({ id, label, req = true, children }: { id: keyof Q; label: string; req?: boolean; children: React.ReactNode }) => (
    <div className={`fld ${errs[id] ? 'bad' : ''}`}>
      <label htmlFor={id}>{label} {req && <span className="req">*</span>}</label>
      {children}
      {errs[id] && <div className="ferr">{errs[id]}</div>}
    </div>
  )
  return (
    <div className="page">
      <div className="crumbs"><Link to="/claims">Home</Link> › Claims</div>
      <h1 className="h1">Claims</h1>
      <div className="claims-grid">
        <section className="box">
          <h2>Look up a claim or ticket</h2>
          <div className="followed"><a href="#" onClick={(e) => { e.preventDefault(); alert('You are not following any claims yet.') }}>⟫ View followed claims</a></div>
          <form onSubmit={submit} noValidate id="lookup-form">
            <div className="fld">
              <label htmlFor="criteria">Select your claims or ticket search criteria <span className="req">*</span></label>
              <select id="criteria" value={c} onChange={(e) => { set('criteria', e.target.value as Q['criteria']); setErrs({}) }}>
                {CRITERIA.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
              </select>
            </div>
            <div className="fld">
              <label>Search by</label>
              <div className="radios">
                <label><input type="radio" checked={q.by === 'tin'} onChange={() => set('by', 'tin')} /> TIN <b>{PROVIDER.tin}</b> <a href="#" onClick={(e) => e.preventDefault()}>Edit</a></label>
                <label><input type="radio" checked={q.by === 'provider'} onChange={() => set('by', 'provider')} /> Provider <b>{PROVIDER.name}</b> <a href="#" onClick={(e) => e.preventDefault()}>Edit</a></label>
              </div>
            </div>
            <div className="row2">
              {(c === 'idDob' || c === 'idName') && (
                F({ id: 'memberId', label: 'Member ID', children: <input id="memberId" value={q.memberId} onChange={(e) => set('memberId', e.target.value)} /> })
              )}
              {(c === 'idName' || c === 'nameDob') && (
                <>
                  {F({ id: 'first', label: 'First name', children: <input id="first" value={q.first} onChange={(e) => set('first', e.target.value)} /> })}
                  {F({ id: 'last', label: 'Last name', children: <input id="last" value={q.last} onChange={(e) => set('last', e.target.value)} /> })}
                </>
              )}
              {(c === 'idDob' || c === 'nameDob') && (
                F({ id: 'dob', label: 'Date of birth', children: <><DateInput id="dob" value={q.dob} onChange={(v) => set('dob', v)} /><small className="hint">mm/dd/yyyy</small></> })
              )}
              {c === 'acctClaim' && (
                F({ id: 'acct', label: 'Patient account number or claim number', children: <input id="acct" value={q.acct} onChange={(e) => set('acct', e.target.value)} /> })
              )}
            </div>
            {c !== 'acctClaim' && (
              <>
                <div className="fld">
                  <label>Select range</label>
                  <div className="radios">
                    <label><input type="radio" checked={q.range === 'custom'} onChange={() => set('range', 'custom')} id="range-custom" /> Custom date</label>
                    <label><input type="radio" checked={q.range === 'predef'} onChange={() => set('range', 'predef')} id="range-predef" /> Predefined date</label>
                  </div>
                  <small className="hint">You may search for claims up to 24 months from the last processed date.</small>
                </div>
                {q.range === 'custom' ? (
                  <div className="row2">
                    {F({ id: 'from', label: 'First service date', children: <><DateInput id="from" value={q.from} onChange={(v) => set('from', v)} /><small className="hint">mm/dd/yyyy</small></> })}
                    {F({ id: 'to', label: 'Last service date', children: <><DateInput id="to" value={q.to} onChange={(v) => set('to', v)} /><small className="hint">mm/dd/yyyy</small></> })}
                  </div>
                ) : (
                  <div className="row2">
                    <div className="fld">
                      <label htmlFor="predef">Date range <span className="req">*</span></label>
                      <select id="predef" value={q.predef} onChange={(e) => set('predef', e.target.value)}>
                        {PREDEF.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
            <button className="btn-navy wide" type="submit" id="submit-search">Submit search</button>
          </form>
        </section>
        <aside>
          <section className="box">
            <h2>Submit claim</h2>
            <p className="small">Professional claims requiring a CMS-1500 form and institutional claims from hospitals and skilled nursing facilities requiring an 837I form (electronic version of UB-04 paper form) can be submitted online.</p>
            <p className="small">Click the 'Submit claim' button to enter and submit your claims electronically.</p>
            <button className="btn-outline wide" onClick={() => alert('Claim submission is disabled in this demo.')}>Submit claim</button>
          </section>
          <section className="box">
            <h2>Helpful resources</h2>
            {['Reimbursement policies for commercial plans', 'Reimbursement policies for medicaid plans', 'Reimbursement policies for medicare plans', 'Electronic payments and statements resources'].map((t) => (
              <a key={t} href="#" className="res-link" onClick={(e) => e.preventDefault()}>{t} <Ext /></a>
            ))}
          </section>
        </aside>
      </div>
    </div>
  )
}
