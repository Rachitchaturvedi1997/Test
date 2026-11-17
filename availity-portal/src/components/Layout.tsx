import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { Bell, Chevron, Heart, Help, Home, Lock, Search } from './Icons'
import { auth, DEMO_USER } from '../auth'

type Item = { label: string; to: string }
export const MENUS: { label: string; items: Item[] }[] = [
  {
    label: 'Patient Registration',
    items: [
      { label: 'Eligibility and Benefits Inquiry', to: '/info/eligibility-and-benefits-inquiry' },
      { label: 'Authorizations & Referrals', to: '/info/authorizations-and-referrals' },
      { label: 'Care Reports', to: '/info/care-reports' },
    ],
  },
  {
    label: 'Claims & Payments',
    items: [
      { label: 'Claim Status', to: '/claim-status' },
      { label: 'Remittance Viewer', to: '/remittance-viewer' },
      { label: 'Claims & Encounters', to: '/info/claims-and-encounters' },
      { label: 'Appeals', to: '/info/appeals' },
      { label: 'Attachments - New', to: '/info/attachments' },
    ],
  },
  {
    label: 'My Providers',
    items: [
      { label: 'Enrollments Center', to: '/info/enrollments-center' },
      { label: 'Express Entry', to: '/info/express-entry' },
      { label: 'Provider Directory', to: '/info/provider-directory' },
    ],
  },
  {
    label: 'Payer Spaces',
    items: [
      { label: 'Aetna', to: '/info/payer-space-aetna' },
      { label: 'Anthem Blue Cross', to: '/info/payer-space-anthem' },
      { label: 'Blue Shield of California', to: '/info/payer-space-blue-shield' },
      { label: 'Humana', to: '/info/payer-space-humana' },
    ],
  },
  {
    label: 'More',
    items: [
      { label: 'Fee Schedule Listing', to: '/info/fee-schedule-listing' },
      { label: 'Medical Attachments', to: '/info/medical-attachments' },
    ],
  },
  {
    label: 'Reporting',
    items: [
      { label: 'Reporting Dashboard', to: '/info/reporting-dashboard' },
      { label: 'Remittance Viewer', to: '/remittance-viewer' },
    ],
  },
]

function useOutside(close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [close])
  return ref
}

function Drop({ label, items, top }: { label: React.ReactNode; items: Item[]; top?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useOutside(() => setOpen(false))
  const loc = useLocation()
  useEffect(() => { setOpen(false) }, [loc.pathname])
  return (
    <div className={top ? 'top-drop' : 'nav2-item'} ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} data-menu={typeof label === 'string' ? label : undefined}>
        {label} <Chevron />
      </button>
      {open && (
        <div className="drop" role="menu">
          {items.map((i) => (
            <Link key={i.label} to={i.to} role="menuitem">
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
  const [kw, setKw] = useState('')
  useEffect(() => { window.scrollTo(0, 0) }, [loc.pathname])
  const logout = () => {
    auth.logout()
    nav('/login')
  }
  return (
    <>
      <div className="topbar">
        <Link to="/home" className="brand" aria-label="Home">
          <Logo dark essentials height={26} />
        </Link>
        <Link to="/home" className="top-link">
          <Home /> Home
        </Link>
        <Link to="/info/notifications" className="top-link">
          <Bell /> Notifications
        </Link>
        <Drop
          top
          label={
            <>
              <Heart /> My Favorites
            </>
          }
          items={[
            { label: 'Claim Status', to: '/claim-status' },
            { label: 'Remittance Viewer', to: '/remittance-viewer' },
          ]}
        />
        <span className="spacer" />
        <span className="top-link region">California</span>
        <Drop
          top
          label={
            <>
              <Help /> Help and Training
            </>
          }
          items={[
            { label: 'Get Help', to: '/info/get-help' },
            { label: 'Find Training', to: '/info/find-training' },
          ]}
        />
        <Drop
          top
          label={`${DEMO_USER.firstName}'s Account`}
          items={[
            { label: 'My Account Dashboard', to: '/home' },
            { label: 'Edit Profile', to: '/info/edit-profile' },
          ]}
        />
        <button className="top-link" onClick={logout} id="logout">
          <Lock /> Logout
        </button>
      </div>
      <div className="nav2">
        {MENUS.map((m) => (
          <Drop key={m.label} label={m.label} items={m.items} />
        ))}
        <span className="spacer" />
        <form
          className="kw"
          onSubmit={(e) => {
            e.preventDefault()
            if (kw.trim()) nav(`/info/search?q=${encodeURIComponent(kw)}`)
          }}
        >
          <input placeholder="Keyword Search" value={kw} onChange={(e) => setKw(e.target.value)} aria-label="Keyword Search" />
          <Search />
        </form>
      </div>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">© 2026 Demo environment. All data shown is fictional test data. Not affiliated with or endorsed by Availity or any payer.</footer>
    </>
  )
}
