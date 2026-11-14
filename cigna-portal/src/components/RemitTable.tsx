import { useState } from 'react'
import { type Claim, type Remittance, money, remitRead } from '../data'
import { downloadRemittancePdf, openRemittancePdf } from '../pdf'
import { Download, Envelope } from './Icons'

export default function RemitTable({ rows }: { rows: (Remittance & { claims: Claim[] })[] }) {
  const [read, setRead] = useState(remitRead.get())
  const [type, setType] = useState('all')
  const shown = type === 'all' || type === 'remit' ? rows : []
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 16px' }}>
        <select className="select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Report type">
          <option value="all">All Report Types</option>
          <option value="remit">Remittance Report</option>
          <option value="adj">Adjustment Report</option>
        </select>
      </div>
      <div className="table-wrap">
        <table className="grid remit-table">
          <thead>
            <tr>
              <th>Remittance Tracking Number</th>
              <th>Tax Identification Number</th>
              <th>Payment Date</th>
              <th>Deposit Amount</th>
              <th>Product Type</th>
              <th>Report Type</th>
              <th>Number of Pages</th>
              <th>Unread or Read</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={9} className="empty">
                  No reports available for the selected report type.
                </td>
              </tr>
            )}
            {shown.map((r) => {
              const isRead = read.has(r.trackingNumber)
              return (
                <tr key={r.trackingNumber} data-tracking={r.trackingNumber}>
                  <td className="num" style={{ fontWeight: 600 }}>{r.trackingNumber}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{r.tin}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{r.paymentDate}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{money(r.depositAmount)}</td>
                  <td>{r.productType}</td>
                  <td>{r.reportType}</td>
                  <td>{r.pages}</td>
                  <td>
                    <button
                      className="read-btn"
                      title={isRead ? 'Mark as unread' : 'Mark as read'}
                      onClick={() => setRead(new Set(remitRead.toggle(r.trackingNumber)))}
                    >
                      <Envelope open={isRead} />
                    </button>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    1-{r.pages}{' '}
                    <button
                      className="pdf-link view-pdf"
                      onClick={() => {
                        setRead(new Set(remitRead.mark(r.trackingNumber)))
                        openRemittancePdf(r, r.claims)
                      }}
                    >
                      View PDF
                    </button>
                    <button
                      className="read-btn download-pdf"
                      title="Download PDF"
                      style={{ marginLeft: 8, verticalAlign: 'middle' }}
                      onClick={() => {
                        setRead(new Set(remitRead.mark(r.trackingNumber)))
                        downloadRemittancePdf(r, r.claims)
                      }}
                    >
                      <Download />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="small-note">You are viewing all available reports .</p>
      <p className="small-note">
        You can mark your remittance reports as 'read' or 'unread' by clicking on the read <Envelope size={13} open /> or unread <Envelope size={13} /> icons .
      </p>
      <p className="small-note">
        To view a report you may need to download and install <a href="https://get.adobe.com/reader/" target="_blank" rel="noreferrer">Adobe Reader</a>
      </p>
    </>
  )
}
