import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CARC, ORGANIZATION, findClaim, money, payerById } from '../data'
import StatusPill from '../components/StatusPill'
import { Clip, Cloud, Csv, Printer, Viewer, Warn } from '../components/Icons'
import { clearSearch, uuid } from '../search'
import { downloadRemit, openRemit } from '../pdf'

function KV({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="kv2">
      {rows.map(([k, v]) => (
        <div className="kv-row" key={k}>
          <span className="k">{k}</span>
          <span className="v">{v}</span>
        </div>
      ))}
    </div>
  )
}

export default function ClaimDetail() {
  const { claimNumber = '' } = useParams()
  const nav = useNavigate()
  const c = findClaim(claimNumber)
  const [modal, setModal] = useState<null | 'elig' | 'remit' | 'dispute' | 'attach'>(null)
  const tx = useMemo(() => ({ id: uuid(), at: new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(' at', '') }), [])

  if (!c) {
    return (
      <div className="cs-page">
        <h1 className="app-title">Claim not found</h1>
        <Link to="/claim-status">Return to Claim Status</Link>
      </div>
    )
  }
  const payer = payerById(c.payerId)
  const m = c.member
  const setToPay = c.status === 'PAID' && !c.remitAvailable

  const exportOne = () => {
    const rows = [
      ['Claim Number', c.claimNumber], ['Status', c.status], ['Status Code', c.statusCode], ['Patient', `${m.lastName}, ${m.firstName}`], ['Member ID', m.memberId],
      ['DOB', m.dob], ['Service Dates', `${c.dosFrom} - ${c.dosTo}`], ['Billed', c.billed.toFixed(2)], ['Paid', c.paid.toFixed(2)], ['Finalized', c.finalized ?? ''],
      ['Check/EFT', c.checkNumber ?? ''], ['Payment Date', c.paymentDate ?? ''],
    ]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')], { type: 'text/csv' }))
    a.download = `claim-${c.claimNumber}.csv`
    a.click()
  }

  return (
    <div className="cs-page" id="claim-detail" data-claim={c.claimNumber}>
      <div className="detail-top">
        <div className="crumbs">
          <Link to="/home">Home</Link> › <Link to="/claim-status">Select</Link> › <Link to="/claim-status">Search</Link> › <Link to="/claim-status">Results</Link> › Details
        </div>
        <div className="small">Need Help? <a href="#" onClick={(e) => e.preventDefault()}>Learn More</a></div>
      </div>
      <div className="detail-title">
        <h1 className="app-title"><span className="cs-badge green">CS</span> Claim Status</h1>
        <button className="btn-gray" onClick={() => alert('Thanks for your feedback!')}>Give Feedback</button>
      </div>
      <div className="tx-bar">
        <div className="small">
          <b>Customer ID</b> {ORGANIZATION.customerId} &nbsp; <b>Exchange Date</b> {tx.at}
          <br />
          <b>Transaction ID</b> &nbsp; {tx.id}
        </div>
        <div className="tx-actions">
          <button className="btn-plain" onClick={exportOne}>Export to CSV <Csv /></button>
          <button className="btn-plain" onClick={() => window.print()}>Print Page <Printer /></button>
          <button className="btn-plain" onClick={() => nav('/claim-status')} id="return-results">Return to Results</button>
          <button className="btn-blue" onClick={() => { clearSearch(); nav('/claim-status') }}>New Search</button>
          <button className="btn-plain" onClick={() => nav('/claim-status')}>Edit Search</button>
        </div>
      </div>

      <div className="card">
        <div className="card-top">
          <span className="payer-brand" style={{ color: payer.color }}>{payer.display}</span>
          <div className="card-actions">
            <button onClick={() => setModal('elig')}>Verify Eligibility ☑</button>
            <button onClick={() => (c.remitAvailable ? openRemit(c) : setModal('remit'))} id="view-remit">View Remittance Advice <Cloud /></button>
            <button className="boxed" onClick={() => setModal('remit')} id="remit-viewer">Remittance Viewer <Viewer /></button>
            <button onClick={() => setModal('dispute')}>Dispute Claim <Warn /></button>
            <button onClick={() => setModal('attach')}>Send Attachments <Clip /></button>
          </div>
        </div>

        <h3 className="card-h">Patient Information</h3>
        <div className="two">
          <KV rows={[['Patient', `${m.lastName}, ${m.firstName} ${m.middle}`.trim()], ['DOB', m.dob], ['Member ID', m.memberId], ['Patient Account Number', c.patientAccount], ['Group Number', m.group]]} />
          <KV rows={[['Gender', m.gender], ['Subscriber Relationship', m.relationship], ['Subscriber', `${m.subLast}, ${m.subFirst} ${m.subMiddle}`.trim()], ['Subscriber Member ID', m.memberId], ['Funding Arrangement', m.funding]]} />
        </div>

        <h3 className="card-h">Claim Information</h3>
        <div className="two">
          <KV
            rows={[
              ['Claim Number', <span className="hl" key="cn">{c.claimNumber}</span>],
              ['Status', <StatusPill status={c.status} key="s" />],
              ['Status Category', `${c.statusCode} ${c.statusText}`],
              ['Received Date', c.received],
              ['Finalized Date', c.finalized ?? '--'],
              ['Service Dates', `${c.dosFrom} - ${c.dosTo}`],
            ]}
          />
          <KV
            rows={[
              ['Billed Amount', money(c.billed)],
              ['Paid Amount', money(c.paid)],
              ['Patient Responsibility', money(c.patientResp)],
              ['Payment Method', c.paymentMethod ?? '--'],
              ['Check/EFT Number', c.checkNumber ?? '--'],
              ['Payment Date', c.paymentDate ?? '--'],
            ]}
          />
        </div>
        {setToPay && (
          <div className="notice" id="set-to-pay">
            <b>Set to pay:</b> this claim is finalized as paid, but the remittance has not been posted yet. Check the Remittance Viewer again after the payment date.
          </div>
        )}

        <h3 className="card-h">Provider Information</h3>
        <div className="two">
          <KV rows={[['Billing Provider', c.provider.name], ['Provider NPI', c.provider.npi]]} />
          <KV rows={[['Provider Tax ID', c.provider.tin], ['Payer', `${payer.name} (${payer.id})`]]} />
        </div>

        <h3 className="card-h">Service Lines</h3>
        <table className="tbl lines" id="service-lines">
          <thead>
            <tr>
              <th>Line</th><th>Service Dates</th><th>Procedure Code</th><th>Modifier</th><th>Units</th><th className="r">Billed</th><th className="r">Allowed</th>
              <th className="r">Deductible</th><th className="r">Copay</th><th className="r">Coinsurance</th><th className="r">Paid</th><th>Status</th><th>Adjustment Codes</th>
            </tr>
          </thead>
          <tbody>
            {c.lines.map((l) => (
              <tr key={l.line}>
                <td>{l.line}</td>
                <td>{l.dosFrom} - {l.dosTo}</td>
                <td title={l.description}>{l.code}</td>
                <td>{l.modifier || '--'}</td>
                <td>{l.units}</td>
                <td className="r">{money(l.billed)}</td>
                <td className="r">{money(l.allowed)}</td>
                <td className="r">{money(l.deductible)}</td>
                <td className="r">{money(l.copay)}</td>
                <td className="r">{money(l.coinsurance)}</td>
                <td className="r">{money(l.paid)}</td>
                <td>{l.status}</td>
                <td>{l.carc.map((code) => <div key={code} title={CARC[code]}>{code}</div>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {c.lines.some((l) => l.carc.length) && (
          <div className="carc">
            {[...new Set(c.lines.flatMap((l) => l.carc))].map((code) => (
              <div key={code}><b>{code}</b> {CARC[code]}</div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setModal(null)} aria-label="Close">×</button>
            {modal === 'elig' && (
              <>
                <h3>Eligibility and Benefits</h3>
                <KV rows={[['Member', `${m.lastName}, ${m.firstName}`], ['Member ID', m.memberId], ['Plan', m.plan], ['Group', m.group], ['Coverage Status', 'Active Coverage'], ['Plan Dates', '01/01/2026 - 12/31/2026']]} />
              </>
            )}
            {modal === 'remit' && (
              <>
                <h3>Remittance Viewer</h3>
                {c.remitAvailable ? (
                  <>
                    <KV rows={[['Payer', payer.name], ['Check/EFT Number', c.checkNumber ?? ''], ['Payment Date', c.paymentDate ?? ''], ['Payment Amount', money(c.paid)], ['Claim Number', c.claimNumber]]} />
                    <div className="form-actions">
                      <button className="btn-blue" onClick={() => openRemit(c)} id="remit-view-pdf">View PDF</button>
                      <button className="btn-plain" onClick={() => downloadRemit(c)} id="remit-download">Download</button>
                    </div>
                  </>
                ) : (
                  <p id="remit-unavailable">
                    {c.status === 'PAID'
                      ? 'No remittance was found for this claim. The payment has not been posted yet (Set to pay). Please check again after the payment date.'
                      : `A remittance is not available because this claim is ${c.status.toLowerCase()}.`}
                  </p>
                )}
              </>
            )}
            {modal === 'dispute' && (
              <>
                <h3>Dispute Claim</h3>
                <p>Disputes can be submitted within 180 days of the finalized date. This action is disabled in the demo environment.</p>
              </>
            )}
            {modal === 'attach' && (
              <>
                <h3>Send Attachments</h3>
                <p>Attachments are disabled in the demo environment.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
