import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PAYERS, claims, money, payerById } from '../data'
import { downloadRemit, openRemit } from '../pdf'

export default function RemittanceViewer() {
  const [payerId, setPayerId] = useState('')
  const [by, setBy] = useState<'claim' | 'check'>('claim')
  const [q, setQ] = useState('')
  const [ran, setRan] = useState(false)
  const [err, setErr] = useState('')
  const hits = ran
    ? claims.filter(
        (c) =>
          c.status === 'PAID' &&
          (!payerId || c.payerId === payerId) &&
          (by === 'claim' ? c.claimNumber === q.trim().toUpperCase() : c.checkNumber === q.trim()),
      )
    : []
  const found = hits.filter((c) => c.remitAvailable)
  return (
    <div className="cs-page">
      <div className="crumbs">Home › Remittance Viewer</div>
      <h1 className="app-title"><span className="cs-badge" style={{ background: '#1b6f8a' }}>RV</span> Remittance Viewer</h1>
      <form
        className="cs-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!q.trim()) return setErr(`Enter a ${by === 'claim' ? 'claim number' : 'check/EFT number'}.`)
          setErr('')
          setRan(true)
        }}
      >
        <div className="grid2">
          <div className="fg">
            <label htmlFor="rv-payer">Payer</label>
            <select id="rv-payer" value={payerId} onChange={(e) => setPayerId(e.target.value)}>
              <option value="">All payers</option>
              {PAYERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Search by</label>
            <div className="radios">
              <label><input type="radio" checked={by === 'claim'} onChange={() => setBy('claim')} /> Claim Number</label>
              <label><input type="radio" checked={by === 'check'} onChange={() => setBy('check')} /> Check/EFT Number</label>
            </div>
          </div>
          <div className="fg">
            <label htmlFor="rv-q"><span className="req">* </span>{by === 'claim' ? 'Claim Number' : 'Check/EFT Number'}</label>
            <input id="rv-q" value={q} onChange={(e) => { setQ(e.target.value); setRan(false) }} />
          </div>
        </div>
        {err && <div className="err">{err}</div>}
        <div className="form-actions">
          <button className="btn-dark" type="submit" id="rv-search">Search</button>
        </div>
      </form>
      {ran && (
        <section className="results">
          {found.length === 0 ? (
            <div className="no-res" id="rv-none">
              {hits.length
                ? 'The claim was found, but its remittance has not been posted yet (Set to pay). Please check again later.'
                : 'No remittance found for the information entered.'}
            </div>
          ) : (
            <table className="tbl" id="rv-results">
              <thead>
                <tr><th>Payer</th><th>Check/EFT Number</th><th>Payment Date</th><th className="r">Amount</th><th>Claim #</th><th>Patient</th><th></th></tr>
              </thead>
              <tbody>
                {found.map((c) => (
                  <tr key={c.claimNumber}>
                    <td>{payerById(c.payerId).name}</td>
                    <td>{c.checkNumber}</td>
                    <td>{c.paymentDate}</td>
                    <td className="r">{money(c.paid)}</td>
                    <td><Link to={`/claim-status/detail/${c.claimNumber}`}>{c.claimNumber}</Link></td>
                    <td>{c.member.lastName}, {c.member.firstName}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="linkbtn" onClick={() => openRemit(c)}>View PDF</button> ·{' '}
                      <button className="linkbtn" onClick={() => downloadRemit(c)}>Download</button>
                    </td>
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
