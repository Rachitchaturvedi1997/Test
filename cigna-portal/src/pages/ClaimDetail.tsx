import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { type HistoryItem, REMARK_CODES, allRemittances, findClaim, flags, money } from '../data'
import StatusBadge from '../components/StatusBadge'
import RemitTable from '../components/RemitTable'
import { Chevron, Flag, Help, Info, InfoFilled, Printer } from '../components/Icons'

type DTab = 'payment' | 'supporting' | 'recon' | 'corr'

function HistoryTable({ items, empty }: { items: HistoryItem[]; empty: string }) {
  if (!items.length) return <div className="empty">{empty}</div>
  return (
    <div className="table-wrap">
      <table className="grid">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((h, i) => (
            <tr key={i}>
              <td className="num">{h.date}</td>
              <td>{h.type}</td>
              <td>{h.description}</td>
              <td>{h.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ClaimDetail() {
  const { claimNumber = '' } = useParams()
  const claim = findClaim(claimNumber)
  const [tab, setTab] = useState<DTab>('payment')
  const [useful, setUseful] = useState(false)
  const [coverage, setCoverage] = useState(false)
  const [flagged, setFlagged] = useState(flags.get())

  if (!claim) {
    return (
      <div className="page">
        <h1 className="page-title">Claim not found</h1>
        <p>
          We couldn't find claim <span className="mono">{claimNumber}</span>. <Link to="/app/claim/search">Back to claims search</Link>
        </p>
      </div>
    )
  }

  const c = claim
  const remits = c.remittance ? allRemittances().filter((r) => r.trackingNumber === c.remittance!.trackingNumber) : []
  const sum = (k: 'charged' | 'allowed' | 'notCovered' | 'deductible' | 'copay' | 'coveredBalance' | 'planPaid' | 'patientCoins' | 'patientResp') =>
    c.procedures.reduce((a, p) => a + p[k], 0)
  const remarkCodes = [...new Set(c.procedures.flatMap((p) => p.remarkCodes))]

  return (
    <div className="page" id="claim-detail" data-claim={c.claimNumber}>
      <button onClick={() => history.back()} className="link" style={{ fontSize: 13, fontWeight: 500 }}>
        ← Back
      </button>
      <h1 className="page-title" style={{ marginBottom: 18 }}>
        Claim {c.claimNumber}
        <button className={`flag-btn ${flagged.has(c.claimNumber) ? 'on' : ''}`} onClick={() => setFlagged(new Set(flags.toggle(c.claimNumber)))} aria-label="Flag claim">
          <Flag size={24} filled={flagged.has(c.claimNumber)} />
        </button>
      </h1>
      <StatusBadge status={c.status} lg />

      <div className="toolbar">
        <button onClick={() => setUseful((u) => !u)}>
          USEFUL LINKS <Chevron size={12} up={useful} />
        </button>
        <span className="sep">|</span>
        <button onClick={() => window.print()} aria-label="Print">
          <Printer />
        </button>
        <span className="sep">|</span>
        <button aria-label="Help" onClick={() => alert('Claim detail help (demo).')}>
          <Help />
        </button>
        {useful && (
          <div className="useful">
            <Link to="/app/info/reconsideration">Request a Reconsideration</Link>
            <Link to="/app/info/submit-claim">How to Submit a Claim</Link>
            <Link to="/app/info/claim-coding-edits">View Claim Coding Edits</Link>
            <Link to="/app/reports/remittance">Remittance Reports</Link>
          </div>
        )}
      </div>

      <div className="dtabs" role="tablist">
        <button className={tab === 'payment' ? 'on' : ''} onClick={() => setTab('payment')}>
          Patient and Payment Information
        </button>
        <button className={tab === 'supporting' ? 'on' : ''} onClick={() => setTab('supporting')}>
          Supporting Information ({c.supporting.length})
        </button>
        <button className={tab === 'recon' ? 'on' : ''} onClick={() => setTab('recon')}>
          Reconsideration History ({c.reconsideration.length})
        </button>
        <button className={tab === 'corr' ? 'on' : ''} onClick={() => setTab('corr')}>
          Correspondence History ({c.correspondence.length})
        </button>
      </div>

      {tab === 'supporting' && <HistoryTable items={c.supporting} empty="There is no supporting information for this claim." />}
      {tab === 'recon' && <HistoryTable items={c.reconsideration} empty="There is no reconsideration history for this claim." />}
      {tab === 'corr' && <HistoryTable items={c.correspondence} empty="There is no correspondence history for this claim." />}

      {tab === 'payment' && (
        <>
          <div className="section-h">Patient and Payment Information</div>
          <div className="two-col">
            <div>
              <div className="sub-h">Claim Information</div>
              <div className="kv" id="claim-info">
                <div className="k">Claim/Reference Number:</div>
                <div className="v">{c.claimNumber}</div>
                <div className="k">Patient Name:</div>
                <div className="v" style={{ fontFamily: 'var(--sans)' }}>
                  {c.patient.firstName} {c.patient.lastName}
                  <a href="#" onClick={(e) => { e.preventDefault(); setCoverage(true) }}>
                    View Coverage
                  </a>
                </div>
                <div className="k">Provider Generated Patient Account Number:</div>
                <div className="v">{c.providerAccountNumber}</div>
                <div className="k">Service Providers:</div>
                <div className="v" style={{ fontFamily: 'var(--sans)' }}>{c.provider.renderingName}</div>
                <div className="k">Date Received:</div>
                <div className="v">{c.received}</div>
                <div className="k">Date Processed:</div>
                <div className="v">{c.processed ?? '--'}</div>
                <div className="k">Claim Status:</div>
                <div className="v">
                  <StatusBadge status={c.status} />
                </div>
              </div>
            </div>
            <div>
              <div className="sub-h">
                Payment Information <span style={{ color: 'var(--blue)', display: 'inline-flex' }}><Info size={14} /></span>
              </div>
              <div className="kv" id="payment-info">
                <div className="k">Claim amount due</div>
                <div className="v">{money(c.amountDue)}</div>
                <div className="k">Claim amount paid:</div>
                <div className="v">{money(c.amountPaid)}</div>
                <div className="k">Total provider payment</div>
                <div className="v">{money(c.amountPaid)}</div>
                <div className="k">Patient responsibility:</div>
                <div className="v">{money(c.patientResponsibility)}</div>
              </div>
            </div>
          </div>

          <div className="block">
            <div className="sub-h">Payment Details</div>
            <div className="info-note">
              <InfoFilled /> Payments that indicate a paid amount greater than the paid amount listed in the details above indicate a bulk payment made to the provider that includes payments for other claims .
            </div>
            <div className="table-wrap">
              <table className="grid" id="payment-details">
                <thead>
                  <tr>
                    <th>Payee's Name</th>
                    <th>Payee's Address</th>
                    <th>Payment Amount</th>
                    <th>Remittance Tracking Number</th>
                    <th>Payment Status</th>
                    <th>Payment Issued</th>
                    <th>Payment Cleared</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {c.payment ? (
                    <tr>
                      <td>{c.payment.payeeName}</td>
                      <td>
                        {c.payment.payeeAddress.map((l) => (
                          <div key={l}>{l}</div>
                        ))}
                      </td>
                      <td className="num">{money(c.payment.amount)}</td>
                      <td className="num">--</td>
                      <td>{c.payment.status}</td>
                      <td className="num">{c.payment.issued}</td>
                      <td className="num">{c.payment.cleared}</td>
                      <td>{c.payment.method}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={8} className="empty">
                        {c.status === 'DENIED' ? 'No payment was issued for this claim.' : 'Payment information will be available once the claim has been processed.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="block">
            <div className="sub-h" style={{ fontSize: 17 }}>Procedures</div>
            <div className="table-wrap">
              <table className="grid" id="procedures">
                <thead>
                  <tr>
                    <th>Procedure Code</th>
                    <th>Dates Of Service</th>
                    <th>Place Of Service</th>
                    <th>Amount Charged</th>
                    <th>Allowed Amount</th>
                    <th className="shade">Amount Not Covered</th>
                    <th>Deductible/Copay Applied</th>
                    <th>Covered Balance</th>
                    <th>Plan Coinsurance Paid</th>
                    <th>Patient Coinsurance</th>
                    <th className="shade">Patient Responsibility</th>
                  </tr>
                </thead>
                <tbody>
                  {c.procedures.map((p, i) => (
                    <tr key={i}>
                      <td className="num">{p.code}</td>
                      <td className="num">
                        {p.dosFrom}-<br />
                        {p.dosTo}
                      </td>
                      <td className="num">{p.pos}</td>
                      <td className="num">{money(p.charged)}</td>
                      <td className="num">{money(p.allowed)}</td>
                      <td className="num shade">{money(p.notCovered)}</td>
                      <td className="num">
                        {money(p.deductible)} / {money(p.copay)}
                      </td>
                      <td className="num">{money(p.coveredBalance)}</td>
                      <td className="num">
                        {p.planPct}%=
                        <br />
                        {money(p.planPaid)}
                      </td>
                      <td className="num">
                        {p.patientPct}%=
                        <br />
                        {money(p.patientCoins)}
                      </td>
                      <td className="num shade">{money(p.patientResp)}</td>
                    </tr>
                  ))}
                  <tr className="total">
                    <td>Totals</td>
                    <td></td>
                    <td></td>
                    <td className="num">{money(sum('charged'))}</td>
                    <td className="num">{money(sum('allowed'))}</td>
                    <td className="num shade">{money(sum('notCovered'))}</td>
                    <td className="num">
                      {money(sum('deductible'))} / {money(sum('copay'))}
                    </td>
                    <td className="num">{money(sum('coveredBalance'))}</td>
                    <td className="num">{money(sum('planPaid'))}</td>
                    <td className="num">{money(sum('patientCoins'))}</td>
                    <td className="num shade">{money(sum('patientResp'))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="block">
            <div className="sub-h">Explanation of Remark Codes</div>
            <div style={{ borderBottom: '1px solid #999' }}>
              {remarkCodes.map((code) => (
                <div key={code} style={{ padding: '6px 0', fontSize: 13 }}>
                  <span className="mono" style={{ fontWeight: 600, marginRight: 14 }}>{code}</span>
                  {REMARK_CODES[code]}
                </div>
              ))}
            </div>
            <p className="small-note" style={{ marginTop: 20 }}>
              This information reflects our data when the claim was processed . It may not reflect the final patient coinsurance due to other pending claims processing activities .
            </p>
          </div>

          <div className="block">
            <div className="sub-h">Remittance Reports</div>
            {remits.length ? (
              <RemitTable rows={remits} />
            ) : (
              <div className="empty">No remittance reports are available for this claim yet.</div>
            )}
          </div>
        </>
      )}

      {coverage && (
        <div className="modal-bg" onClick={() => setCoverage(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setCoverage(false)} aria-label="Close">
              ×
            </button>
            <h3>Coverage</h3>
            <div className="kv">
              <div className="k">Patient</div>
              <div>{c.patient.firstName} {c.patient.lastName}</div>
              <div className="k">Patient ID</div>
              <div className="mono">{c.patient.id}</div>
              <div className="k">Date of birth</div>
              <div className="mono">{c.patient.dob}</div>
              <div className="k">Relationship</div>
              <div>{c.patient.relationship}</div>
              <div className="k">Group number</div>
              <div className="mono">{c.patient.group}</div>
              <div className="k">Plan</div>
              <div>{c.patient.plan}</div>
              <div className="k">Coverage status</div>
              <div><span className="badge">Active</span> 01/01/2026 – 12/31/2026</div>
              <div className="k">Address</div>
              <div>{c.patient.address}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
