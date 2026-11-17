import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { type Claim, money, parseDate } from '../data'
import { getPayer } from '../payer'
import { CRITERIA, dateWindow, fromParams, runSearch, toParams } from '../search'
import { Columns, Download, Ext, Filter, Left, Right, Search, Sort } from '../components/Icons'

type Col = { key: string; label: string; get: (c: Claim) => string | number; render?: (c: Claim) => React.ReactNode }

export default function Results() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const q = fromParams(params)
  const payer = getPayer()
  const { rows, otherPayer } = useMemo(() => runSearch(q, payer.id), [params.toString(), payer.id]) // eslint-disable-line
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: 'processed', dir: -1 })
  const [size, setSize] = useState(10)
  const [page, setPage] = useState(1)
  const win = dateWindow(q)
  const qs = toParams(q)

  const cols: Col[] = [
    { key: 'processed', label: 'Processed date', get: (c) => (c.processed ? parseDate(c.processed).getTime() : 0), render: (c) => c.processed ?? '--' },
    { key: 'name', label: 'Patient name (last, first)', get: (c) => `${c.member.lastName}, ${c.member.firstName}`, render: (c) => `${c.member.lastName}, ${c.member.firstName}` },
    { key: 'claim', label: 'Claim number', get: (c) => c.claimNumber, render: (c) => <Link className="claim-link" to={`/claims/summary/${c.claimNumber}?${qs}`}>{c.claimNumber}</Link> },
    { key: 'dos', label: 'First service date', get: (c) => parseDate(c.dosFrom).getTime(), render: (c) => c.dosFrom },
    { key: 'billed', label: 'Billed amount', get: (c) => c.billed, render: (c) => money(c.billed) },
    { key: 'paid', label: 'Paid amount', get: (c) => c.paid, render: (c) => money(c.paid) },
    { key: 'mid', label: 'Member ID', get: (c) => c.member.id, render: (c) => c.member.id },
    { key: 'acct', label: 'Patient account number', get: (c) => c.patientAccount, render: (c) => c.patientAccount },
    { key: 'status', label: 'Status', get: (c) => c.status, render: (c) => <span className={`st st-${c.status.replace(' ', '').toLowerCase()}`}>{c.status}</span> },
  ]
  const filtered = rows
    .filter((c) => !filter || JSON.stringify([c.claimNumber, c.member.firstName, c.member.lastName, c.member.id, c.patientAccount, c.status]).toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const col = cols.find((x) => x.key === sort.key)!
      const va = col.get(a), vb = col.get(b)
      return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir
    })
  const pages = Math.max(1, Math.ceil(filtered.length / size))
  const cur = Math.min(page, pages)
  const shown = filtered.slice((cur - 1) * size, cur * size)

  const csv = () => {
    const head = cols.map((c) => c.label)
    const body = filtered.map((c) => [c.processed ?? '', `${c.member.lastName}, ${c.member.firstName}`, c.claimNumber, c.dosFrom, c.billed.toFixed(2), c.paid.toFixed(2), c.member.id, c.patientAccount, c.status].map((v) => `"${v}"`).join(','))
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([[head.join(','), ...body].join('\n')], { type: 'text/csv' }))
    a.download = 'claims-results.csv'
    a.click()
  }

  return (
    <div className="page">
      <div className="crumbs-row">
        <div className="crumbs"><Link to="/claims">Home</Link> › <Link to={`/claims?${qs}`}>Claims</Link> › Claims search results</div>
        <button className="linkbtn" onClick={csv}><Ext /> Export to CSV</button>
      </div>
      <section className="box crit">
        <div className="crit-grid">
          <div><div className="lbl">Search criteria</div>{CRITERIA.find((x) => x.id === q.criteria)?.label}</div>
          {q.memberId && <div><div className="lbl">Member ID</div>{q.memberId}</div>}
          {q.first && <div><div className="lbl">Member name</div>{q.first} {q.last}</div>}
          {q.dob && <div><div className="lbl">Date of birth</div>{q.dob}</div>}
          {q.acct && <div><div className="lbl">Account / claim number</div>{q.acct}</div>}
          {win && <div><div className="lbl">First service date</div>{win[0]}</div>}
          {win && <div><div className="lbl">Last service date</div>{win[1]}</div>}
          <div><Link to={`/claims?${qs}`}>Edit search</Link> · <Link to="/claims">New search</Link></div>
        </div>
      </section>

      <section className="box">
        <h2 className="h2">Claims results</h2>
        <div className="res-tools">
          <div className="tsearch">
            <input placeholder="Search" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1) }} aria-label="Filter results" />
            <Search />
          </div>
          <span className="spacer" />
          <button className="linkbtn" onClick={() => alert('Use the search box to filter results.')}><Filter /> Filter results</button>
          <button className="linkbtn" onClick={() => alert('Table settings are fixed in this demo.')}><Columns /> Table settings</button>
          <button className="linkbtn" onClick={csv} id="download"><Download /> Download</button>
        </div>
        <div className="pager">
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1) }} aria-label="Rows per page">
            {[10, 25, 50].map((n) => <option key={n}>{n}</option>)}
          </select>
          <button onClick={() => setPage(cur - 1)} disabled={cur <= 1} aria-label="Previous page"><Left /></button>
          <span>{cur} of {pages}</span>
          <button onClick={() => setPage(cur + 1)} disabled={cur >= pages} aria-label="Next page"><Right /></button>
        </div>
        <div className="small right">Result {filtered.length ? `${(cur - 1) * size + 1}-${(cur - 1) * size + shown.length}` : 0} of {filtered.length}</div>
        <div className="tbl-wrap">
          <table className="tbl" id="results-table">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c.key} onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? (s.dir === 1 ? -1 : 1) : 1 }))}>
                    <span>{c.label}{c.key === 'status' && <><br /><a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Finalized: processed. Pending: additional information needed. In Process: under review. Denied: not payable.') }}>Definitions ›</a></>}</span>
                    <Sort />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.claimNumber} data-claim={c.claimNumber}>
                  {cols.map((col) => <td key={col.key}>{col.render ? col.render(c) : col.get(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty" id="no-results">
            No claims were found for your search criteria.
            {otherPayer && <> Claims for this member were found under payer <b>{otherPayer}</b>. Switch the payer at the top of the page and search again.</>}
            <div style={{ marginTop: 10 }}><button className="btn-outline" onClick={() => nav(`/claims?${qs}`)}>Edit search</button></div>
          </div>
        )}
      </section>
    </div>
  )
}
