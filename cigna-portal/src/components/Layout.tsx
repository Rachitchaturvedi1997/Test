import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { Chevron, Search, User } from './Icons'
import { auth, DEMO_USER } from '../auth'

type Menu = { label: string; base: string; items: { label: string; to: string }[] }

export const MENUS: Menu[] = [
  {
    label: 'Patients',
    base: '/app/patient',
    items: [
      { label: 'Search Patients', to: '/app/patient/search' },
      { label: 'Precertification Requests', to: '/app/info/precertification' },
      { label: 'Patient Cost Estimator', to: '/app/info/cost-estimator' },
    ],
  },
  {
    label: 'Claims',
    base: '/app/claim',
    items: [
      { label: 'Search Claims', to: '/app/claim/search' },
      { label: 'How to Submit a Claim', to: '/app/info/submit-claim' },
      { label: 'View Claim Coding Edits', to: '/app/info/claim-coding-edits' },
    ],
  },
  {
    label: 'Reports',
    base: '/app/reports',
    items: [
      { label: 'Remittance Reports', to: '/app/reports/remittance' },
      { label: 'Claim Reports', to: '/app/info/claim-reports' },
    ],
  },
  {
    label: 'Working With Cigna',
    base: '/app/working',
    items: [
      { label: 'Update Provider Directory', to: '/app/info/provider-directory' },
      { label: 'Credentialing', to: '/app/info/credentialing' },
      { label: 'Fee Schedules', to: '/app/info/fee-schedules' },
    ],
  },
  {
    label: 'Resources',
    base: '/app/resources',
    items: [
      { label: 'Forms Center', to: '/app/info/forms-center' },
      { label: 'Reimbursement Policies', to: '/app/info/reimbursement-policies' },
      { label: 'Training & Education', to: '/app/info/training' },
    ],
  },
]

function NavItem({ menu }: { menu: Menu }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const active = menu.items.some((i) => loc.pathname.startsWith(i.to)) || loc.pathname.startsWith(menu.base)
  return (
    <div className={`nav-item ${active ? 'active' : ''}`} ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} data-menu={menu.label}>
        {menu.label} <Chevron size={13} up={open} />
      </button>
      {open && (
        <div className="dropdown" role="menu">
          {menu.items.map((i) => (
            <Link key={i.to} to={i.to} role="menuitem">
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const nav = useNavigate()
  const loc = useLocation()
  const [userOpen, setUserOpen] = useState(false)
  const [q, setQ] = useState('')
  const logout = () => {
    auth.logout()
    nav('/login')
  }
  useEffect(() => {
    window.scrollTo(0, 0)
    setUserOpen(false)
  }, [loc.pathname])
  return (
    <>
      <header className="topbar">
        <Link to="/app/dashboard" aria-label="Dashboard">
          <Logo />
        </Link>
        <div className="right">
          <form
            className="search-res"
            onSubmit={(e) => {
              e.preventDefault()
              if (q.trim()) nav(`/app/info/search?q=${encodeURIComponent(q.trim())}`)
            }}
          >
            <input placeholder="Search Resources" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search Resources" />
            <Search />
          </form>
          <button className="top-link" onClick={logout} id="logout">
            Logout
          </button>
          <div style={{ position: 'relative' }}>
            <button className="top-link" onClick={() => setUserOpen((o) => !o)}>
              <User /> {DEMO_USER.displayName} <Chevron size={13} up={userOpen} />
            </button>
            {userOpen && (
              <div className="user-menu">
                <div>
                  <b>{DEMO_USER.displayName}</b>
                  <br />
                  <span style={{ color: '#666' }}>{DEMO_USER.username}</span>
                </div>
                <button onClick={() => nav('/app/info/profile')}>Profile &amp; Settings</button>
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <nav className="nav">
        <div className={`nav-item ${loc.pathname === '/app/dashboard' ? 'active' : ''}`}>
          <Link to="/app/dashboard">Dashboard</Link>
        </div>
        {MENUS.map((m) => (
          <NavItem key={m.label} menu={m} />
        ))}
      </nav>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <span>© 2026 Demo environment. All data shown is fictional test data. Not affiliated with or endorsed by Cigna.</span>
        <span>Privacy · Terms of Use · Accessibility</span>
      </footer>
      <button className="feedback-tab" onClick={() => alert('Thanks! Feedback is disabled in this demo.')}>
        Feedback
      </button>
    </>
  )
}
