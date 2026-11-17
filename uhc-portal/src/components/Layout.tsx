import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { Chat, Chevron, Ext, Right, Search, User } from './Icons'
import { auth, DEMO_USER } from '../auth'
import { PAYERS, PROVIDER } from '../data'
import { getPayer, setPayer } from '../payer'

function useOutside(close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [close])
  return ref
}

type L = { label: string; to?: string; desc?: string; ext?: boolean }
const CLAIMS_MENU: { title: string; items: L[] }[] = [
  {
    title: 'Claims Tasks',
    items: [
      { label: 'Look up a Claim', to: '/claims' },
      { label: 'Search PRA', to: '/info/search-pra', desc: 'Search, view, and/or print Provider Remittance Advice (PRA) documents. Depending on payer and/or the line of business, results may return Explanation of Benefits (EOB), Provider Remittance Advice (PRA), Electronic Remittance Advice (ERA), or Explanation of Payment (EOP).' },
      { label: 'Submit a Claim', to: '/info/submit-a-claim', desc: 'Electronically submit professional and facility claims with or without documentation and track their submission status. This is an ideal tool for organizations that do not use Electronic Data Interchange (EDI).' },
      { label: 'Claims Research Project', to: '/info/claims-research-project', desc: 'This lets you search and submit a reconsideration request for multiple claims with the same reason for denial.' },
    ],
  },
  {
    title: 'Payment Tools',
    items: [
      { label: 'Direct Connect', ext: true, desc: 'Direct Connect is a web-based platform that helps providers and UnitedHealthcare communicate effectively, automate workflows and drive overpayment resolutions.' },
      { label: 'Fee Schedule Lookup', to: '/info/fee-schedule-lookup', desc: 'Allows participating providers to look up contracted rates of Commercial plans for CPT and HCPC codes, for a specific physician/healthcare professional name and product.' },
      { label: 'HBMA Find a Medical Biller', ext: true, desc: 'This helps identify medical billing companies by specialty and certification.' },
      { label: 'InstaMed Payments', ext: true, desc: 'UnitedHealthcare members can pay you via the myuhc.com member portal as soon as claims are adjudicated. Allow patients to pay how they want.' },
    ],
  },
  {
    title: '',
    items: [
      { label: 'Office Ally', ext: true, desc: 'Our programs allow patients, providers and IPAs/Health Plans to interact in real time, providing immediate communication between all parties.' },
      { label: 'Optum Pay', ext: true, desc: 'This transforms the payment process by moving the claims and electronic remittance data with the electronic payment.' },
      { label: 'Optum Recovery', ext: true, desc: 'Allows providers to use electronic bank transfer for resolving overpayments.' },
      { label: 'Claim Estimator', ext: true, desc: 'Allows you to predetermine patient benefits, allowable service bundling, and claim financials. (Not available for all policies.)' },
    ],
  },
]
const SIMPLE: Record<string, L[]> = {
  'Clinical & Pharmacy': [{ label: 'Clinical Programs', to: '/info/clinical-programs' }, { label: 'Pharmacy Resources', to: '/info/pharmacy-resources' }],
  'Documents & Reporting': [{ label: 'Document Vault', to: '/info/document-vault' }, { label: 'Search PRA', to: '/info/search-pra' }, { label: 'Reports', to: '/info/reports' }],
}

function MegaMenu() {
  const [open, setOpen] = useState(false)
  const ref = useOutside(() => setOpen(false))
  const loc = useLocation()
  useEffect(() => { setOpen(false) }, [loc.pathname])
  return (
    <div className="nav-item" ref={ref}>
      <button className={open ? 'boxed' : ''} onClick={() => setOpen((o) => !o)} data-menu="Claims & Payments" aria-expanded={open}>
        Claims &amp; Payments <Chevron up={open} />
      </button>
      {open && (
        <div className="mega" role="menu">
          {CLAIMS_MENU.map((col, i) => (
            <div key={i} className="mega-col">
              {col.title && <h4>{col.title}</h4>}
              {!col.title && <h4>&nbsp;</h4>}
              {col.items.map((it) => (
                <div key={it.label} className="mega-item">
                  {it.to ? (
                    <Link to={it.to} className={it.label === 'Look up a Claim' ? 'boxed-link' : ''} id={it.label === 'Look up a Claim' ? 'menu-lookup' : undefined}>
                      {it.label}
                    </Link>
                  ) : (
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('External tool - not available in the demo.') }}>
                      {it.label} {it.ext && <Ext />}
                    </a>
                  )}
                  {it.desc && <p>{it.desc}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SimpleMenu({ label, items, utility }: { label: string; items: L[]; utility?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useOutside(() => setOpen(false))
  const loc = useLocation()
  useEffect(() => { setOpen(false) }, [loc.pathname])
  return (
    <div className={utility ? 'util-item' : 'nav-item'} ref={ref}>
      <button onClick={() => setOpen((o) => !o)}>
        {label} <Chevron up={open} />
      </button>
      {open && (
        <div className="drop">
          {items.map((i) => (
            <Link key={i.label} to={i.to ?? '#'}>{i.label}</Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const nav = useNavigate()
  const loc = useLocation()
  const [payer, setP] = useState(getPayer())
  const [payerOpen, setPayerOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useOutside(() => setUserOpen(false))
  const [q, setQ] = useState('')
  useEffect(() => { window.scrollTo(0, 0) }, [loc.pathname])
  const logout = () => {
    auth.logout()
    nav('/login')
  }
  return (
    <>
      <div className="util">
        <SimpleMenu utility label="Training & Support" items={[{ label: 'Training', to: '/info/training' }, { label: 'Contact Us', to: '/info/contact-us' }]} />
        <SimpleMenu utility label="Practice Management" items={[{ label: 'Manage Users', to: '/info/manage-users' }, { label: 'Practice Profile', to: '/info/practice-profile' }]} />
        <Link to="/info/trackit" className="util-link">TrackIt <span className="count">2</span></Link>
        <div className="util-item" ref={userRef}>
          <button onClick={() => setUserOpen((o) => !o)} id="user-menu">
            <User /> {DEMO_USER.firstName} <Chevron up={userOpen} />
          </button>
          {userOpen && (
            <div className="drop right">
              <div className="drop-info">{DEMO_USER.displayName}<br /><small>{DEMO_USER.username}</small></div>
              <a href="#" onClick={(e) => { e.preventDefault(); logout() }} id="logout">Sign Out</a>
            </div>
          )}
        </div>
      </div>
      <header className="header">
        <Link to="/claims" aria-label="Home"><Logo /></Link>
        <form className="hsearch" onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav(`/info/search?q=${encodeURIComponent(q)}`) }}>
          <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          <Search />
        </form>
        <span className="spacer" />
        <div className="ctx">
          <div className="ctx-l">Payer</div>
          <button className="ctx-v" onClick={() => setPayerOpen(true)} id="payer-switch">
            {payer.id.replace('-CP', '')} - {payer.name} <Right />
          </button>
        </div>
        <div className="ctx">
          <div className="ctx-l">Provider</div>
          <button className="ctx-v" onClick={() => alert(`TIN ${PROVIDER.tin} · NPI ${PROVIDER.npi}`)}>
            {PROVIDER.name} <Right />
          </button>
        </div>
      </header>
      <nav className="nav">
        <Link to="/info/eligibility" className="nav-link">Eligibility</Link>
        <MegaMenu />
        <Link to="/info/referrals" className="nav-link">Referrals</Link>
        <Link to="/info/prior-authorizations" className="nav-link">Prior Authorizations</Link>
        <SimpleMenu label="Clinical & Pharmacy" items={SIMPLE['Clinical & Pharmacy']} />
        <SimpleMenu label="Documents & Reporting" items={SIMPLE['Documents & Reporting']} />
        <Link to="/info/additional-tools" className="nav-link">Additional Tools</Link>
      </nav>
      <main>
        <Outlet />
      </main>
      <footer className="footer">© 2026 Demo environment. All data shown is fictional test data. Not affiliated with or endorsed by UnitedHealthcare or Optum.</footer>
      <button className="side-tab" onClick={() => alert('Feedback is disabled in this demo.')}>Feedback</button>
      <button className="chat-btn" onClick={() => alert('Chat is not available in the demo.')}><Chat /> Chat</button>
      {payerOpen && (
        <div className="modal-bg" onClick={() => setPayerOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setPayerOpen(false)}>×</button>
            <h3>Select a payer</h3>
            {PAYERS.map((p) => (
              <label key={p.id} className="payer-opt">
                <input type="radio" name="payer" checked={payer.id === p.id} onChange={() => { setPayer(p.id); setP(p); setPayerOpen(false) }} />
                {p.id.replace('-CP', '')} - {p.name}
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
