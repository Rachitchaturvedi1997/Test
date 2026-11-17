import { Fragment, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CODES, PROVIDER, findClaim, money } from '../data'
import { getPayer } from '../payer'
import { Bookmark, Chevron, Copy, Download, Ext, Info, Pencil, Printer, Right, Search } from '../components/Icons'
import { downloadPra, openPra } from '../pdf'

const followKey = 'uhc.followed'
const getFollowed = (): string[] => { try { return JSON.parse(localStorage.getItem(followKey) || '[]') } catch { return [] } }

export default function Summary() {
  const { claimNumber = '' } = useParams()
  const loc = useLocation()
  const nav = useNavigate()
  const c = findClaim(claimNumber)
  const [open, setOpen] = useState<Record<number, boolean>>({ 1: true })
  const [followed, setFollowed] = useState(getFollowed())
  const payer = getPayer()
  if (!c) return <div className="page"><h1 className="h1">Claim not found</h1><Link to="/claims">New search</Link></div>
  const m = c.member
  const isFollowed = followed.includes(c.claimNumber)
  const toggleFollow = () => {
    const next = isFollowed ? followed.filter((x) => x !== c.claimNumber) : [...followed, c.claimNumber]
    try { localStorage.setItem(followKey, JSON.stringify(next)) } catch { /* ignore */ }
    setFollowed(next)
  }
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const back = `/claims/results${loc.search}`

  return (
    <div className="page" id="claim-summary" data-claim={c.claimNumber}>
      <div className="crumbs-row">
        <div className="crumbs"><Link to="/claims">Home</Link> › <Link to="/claims">Claims</Link> › <Link to={back}>Claims search results</Link> › Claims Summary Page</div>
        <div className="crumbs">
          <a href="#" onClick={(e) => { e.preventDefault(); alert(followed.length ? `Followed: ${followed.join(', ')}` : 'You are not following any claims.') }}>⟫ View followed claims</a>
          {'  '}<a href="#" onClick={(e) => { e.preventDefault(); window.print() }}><Printer /> Print / Generate a Reference Number</a>
        </div>
      </div>
      <div className="small">Claim summary</div>
      <div className="sum-head">
        <h1 className="claimno">{c.claimNumber} <span className={`st st-${c.status.replace(' ', '').toLowerCase()}`}>{c.status}</span></h1>
        <div className="sum-actions">
          <button className="btn-outline sm" disabled title="Not available for this claim"><Copy /> Copy claim</button>
          <button className="btn-outline sm" onClick={toggleFollow} id="follow"><Bookmark filled={isFollowed} /> {isFollowed ? 'Following' : 'Follow Claim'}</button>
          <button className="btn-outline sm" onClick={() => nav('/claims')}><Search size={13} /> New Search</button>
        </div>
      </div>
      <div className="sum-strip">
        <div><div className="lbl">Patient name</div><a href="#" onClick={(e) => { e.preventDefault(); go('sec-patient') }}>{m.firstName.charAt(0) + m.firstName.slice(1).toLowerCase()} {m.lastName.charAt(0) + m.lastName.slice(1).toLowerCase()}</a></div>
        <div><div className="lbl">Member ID</div>{m.id}</div>
        <div><div className="lbl">Patient account number</div>{c.patientAccount}</div>
        <div><div className="lbl">First date of service</div>{c.dosFrom}</div>
        <div><div className="lbl">Total billed</div>{money(c.billed)}</div>
        <div><div className="lbl">Adjudication status</div><span className="green">{c.network}</span></div>
        <span className="spacer" />
        <a href="#" className="elig" onClick={(e) => { e.preventDefault(); alert(`${m.firstName} ${m.lastName} · ${m.product} · Active coverage 01/01/2026 - 12/31/2026`) }}>View Patient's Eligibility &amp; Benefits <Right /></a>
      </div>
      <div className="anchors">
        {[['sec-patient', 'Patient & provider details'], ['sec-claim', 'Claim details'], ['sec-lines', 'Line items'], ['sec-payments', 'Payments'], ['sec-docs', 'Documents'], ['sec-act', 'Act on claim']].map(([id, label]) => (
          <a key={id} href="#" onClick={(e) => { e.preventDefault(); go(id) }}>{label}</a>
        ))}
      </div>

      <section className="box" id="sec-patient">
        <h2 className="h2">Patient &amp; provider details</h2>
        <div className="kv-grid">
          <div><div className="lbl">Patient</div>{m.firstName} {m.lastName}</div>
          <div><div className="lbl">Date of birth</div>{m.dob}</div>
          <div><div className="lbl">Member ID</div>{m.id}</div>
          <div><div className="lbl">Subscriber</div>{m.subscriberName} ({m.relationship})</div>
          <div><div className="lbl">Product</div>{m.product}</div>
          <div><div className="lbl">Group number</div>{m.group}</div>
          <div><div className="lbl">Billing provider</div>{PROVIDER.name}</div>
          <div><div className="lbl">TIN / NPI</div>{PROVIDER.tin} / {PROVIDER.npi}</div>
          <div><div className="lbl">Payer</div>{payer.id.replace('-CP', '')} - {payer.name}</div>
        </div>
      </section>

      <section className="box" id="sec-claim">
        <h2 className="h2">Claim details</h2>
        <div className="kv-grid">
          <div><div className="lbl">Claim number</div>{c.claimNumber} {c.icn}</div>
          <div><div className="lbl">Status</div>{c.status}</div>
          <div><div className="lbl">Date received</div>{c.received}</div>
          <div><div className="lbl">Processed date</div>{c.processed ?? '--'}</div>
          <div><div className="lbl">Service dates</div>{c.dosFrom} - {c.dosTo}</div>
          <div><div className="lbl">Total billed</div>{money(c.billed)}</div>
          <div><div className="lbl">Total allowed</div>{money(c.allowed)}</div>
          <div><div className="lbl">Total paid</div>{money(c.paid)}</div>
          <div><div className="lbl">Patient responsibility</div>{money(c.patientResp)}</div>
        </div>
      </section>

      <section className="box" id="sec-lines">
        <div className="lines-head">
          <p className="small">Use the <Chevron /> to view more details about that row, including potential remark codes, claim adjustment remark codes or reimbursement policies.</p>
          <button className="btn-outline sm" onClick={() => alert('Table customization is fixed in this demo.')}>⊕ Customize table</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl lines" id="line-items">
            <thead>
              <tr>
                <th><a href="#" onClick={(e) => { e.preventDefault(); setOpen(Object.fromEntries(c.lines.map((l) => [l.line, true]))) }}>Show All</a></th>
                <th>Line #</th><th>Date of service</th><th>Service code</th><th>Revenue code</th><th>Modifier</th><th>Billed amount</th><th>Paid amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="proc-row"><td colSpan={8}>PROCESSED DATE: {c.processed ?? 'NOT YET PROCESSED'}</td></tr>
              {c.lines.map((l) => (
                <Fragment key={l.line}>
                  <tr>
                    <td><button className="chev" onClick={() => setOpen((o) => ({ ...o, [l.line]: !o[l.line] }))} aria-label="Toggle details"><Chevron up={!!open[l.line]} /></button></td>
                    <td>{l.line}</td>
                    <td>{l.dosFrom} - {l.dosTo}</td>
                    <td>{l.code}</td>
                    <td>{l.revenue}</td>
                    <td>{l.modifier || '--'}</td>
                    <td>{money(l.billed)}</td>
                    <td>{money(l.paid)}</td>
                  </tr>
                  {open[l.line] && (
                    <tr className="detail-row">
                      <td colSpan={8}>
                        <div className="adj-grid">
                          <div><div className="lbl">Allowed amount</div>{money(l.allowed)}</div>
                          {l.adjustments.map((a, i) => (
                            <div key={i}><div className="lbl">Adjustment {a.grp}{a.rsn}</div>{money(a.amount)}</div>
                          ))}
                        </div>
                        {l.remarks.length > 0 && (
                          <>
                            <a className="remark-h" href="#" onClick={(e) => e.preventDefault()}>REMARK CODES</a>
                            {l.remarks.map((r) => <div key={r} className="small">{r}: {CODES[r]}</div>)}
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="box" id="sec-payments">
        <h2 className="h2">Payments</h2>
        <div className="kv-grid">
          <div><div className="lbl">Payment method</div>{c.paymentMethod ?? '--'}</div>
          <div><div className="lbl">Check / EFT number</div>{c.paid > 0 ? c.checkNumber : '--'}</div>
          <div><div className="lbl">Payment amount</div>{money(c.paid)}</div>
          <div><div className="lbl">Payment date</div>{c.remitDates[0] && c.paid > 0 ? c.remitDates[0] : '--'}</div>
        </div>
        <div className="docs" id="sec-docs">
          <div className="doc-col">
            <div className="doc-h">Letters</div>
            {c.letters.length ? c.letters.map((l) => <div key={l.date} className="small">{l.date} – {l.title}</div>) : <div className="small">There are no letters associated with the claim at this time.</div>}
          </div>
          <div className="doc-col">
            <div className="doc-h">Remittance advice documents <Info /></div>
            {c.remitDates.length ? (
              c.remitDates.map((d) => (
                <div key={d} className="remit-row">
                  <a href="#" className="remit-link" onClick={(e) => { e.preventDefault(); openPra(c, d) }}>{d}</a>
                  <button className="linkbtn" title="Download" onClick={() => downloadPra(c, d)} aria-label="Download remittance"><Download size={14} /></button>
                </div>
              ))
            ) : (
              <div className="small" id="no-remit">No remittance advice is available yet. The claim has not been processed.</div>
            )}
          </div>
        </div>
      </section>

      <section className="box" id="sec-act">
        <h2 className="h2 act"><Pencil /> Act on claim</h2>
        <p className="small">Training Tips: <a href="#" onClick={(e) => e.preventDefault()}>Guide to submit Reconsideration and Appeal/Dispute requests <Ext /></a></p>
        <div className="act-btns">
          <button className="btn-outline" onClick={() => alert('Reconsideration submission is disabled in this demo.')}>Submit a reconsideration</button>
          <button className="btn-outline" onClick={() => alert('Appeals are disabled in this demo.')}>File an appeal / dispute</button>
          <button className="btn-outline" onClick={() => alert('Attachments are disabled in this demo.')}>Upload attachments</button>
        </div>
      </section>
    </div>
  )
}
