import { useMemo, useState } from 'react'
import { allRemittances } from '../data'
import RemitTable from '../components/RemitTable'

export default function RemittanceReports() {
  const all = useMemo(() => allRemittances(), [])
  const [tin, setTin] = useState('all')
  const tins = [...new Set(all.map((r) => r.tin))]
  const rows = tin === 'all' ? all : all.filter((r) => r.tin === tin)
  return (
    <div className="page">
      <h1 className="page-title">Remittance Reports</h1>
      <div className="fld" style={{ marginBottom: 20 }}>
        <label htmlFor="tin-filter">Tax Identification Number (TIN)</label>
        <select id="tin-filter" value={tin} onChange={(e) => setTin(e.target.value)} style={{ width: 240 }}>
          <option value="all">All TINs</option>
          {tins.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <RemitTable rows={rows} />
    </div>
  )
}
