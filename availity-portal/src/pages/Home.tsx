import { Link } from 'react-router-dom'
import { DEMO_USER } from '../auth'
import { Mail, Monitor } from '../components/Icons'

const APPS = [
  { abbr: 'EB', label: 'Eligibility and Benefits Inquiry', color: '#e2582a', to: '/info/eligibility-and-benefits-inquiry' },
  { abbr: 'CS', label: 'Claim Status', color: '#3b3f45', to: '/claim-status', id: 'app-claim-status' },
  { abbr: 'A&R', label: 'Authorizations & Referrals', color: '#c8312f', to: '/info/authorizations-and-referrals' },
  { abbr: 'RV', label: 'Remittance Viewer', color: '#1b6f8a', to: '/remittance-viewer' },
]

const NEWS = [
  { title: 'ANTHEM - ICR System Outage', date: '11/09/2026', alert: true, body: 'The Anthem Interactive Care Reviewer will undergo maintenance and be unavailable from 6 PM CT on Friday until 6 AM CT on Saturday.' },
  { title: 'AETNA - Claim Status enhancements', date: '11/02/2026', body: 'Claim Status results now include remittance tracking details and links to the Remittance Viewer.' },
  { title: 'Humana - New attachment requirements', date: '10/21/2026', body: 'Effective 12/01/2026 medical records for select cardiology services must be submitted through Attachments - New.' },
  { title: 'Blue Shield of California - Holiday schedule', date: '10/14/2026', body: 'Payment cycles during the holiday weeks will run one business day earlier.' },
]

export default function Home() {
  return (
    <div className="home-grid">
      <div>
        <section className="panel">
          <h2 className="panel-h">
            <span className="nbox">N</span> Notification Center
          </h2>
          <p className="muted" style={{ padding: '4px 14px 12px', borderTop: '1px solid #e4e4e4', margin: 0, paddingTop: 10 }}>
            You have no notifications.
          </p>
        </section>
        <h3 className="sec-title">My Top Applications</h3>
        <div className="apps">
          {APPS.map((a) => (
            <Link key={a.label} to={a.to} className="app-tile" id={a.id}>
              <span className="app-ico" style={{ background: a.color }}>{a.abbr}</span>
              <span>{a.label}</span>
            </Link>
          ))}
        </div>
        <section className="panel">
          <h2 className="panel-h">
            News and Announcements <span className="new-alert">NEW ALERT</span>
          </h2>
          {NEWS.map((n) => (
            <div key={n.title} className="news">
              <div className="news-h">
                <b>{n.alert && <span className="alert-tri">▲</span>} {n.title}</b>
                <span>{n.date}</span>
              </div>
              <p>{n.body}</p>
            </div>
          ))}
        </section>
      </div>
      <aside>
        <section className="panel side">
          <h2 className="panel-h">Messaging</h2>
          <div className="msg">
            <span className="msg-ico"><Monitor /></span>
            <div>
              <a href="#" onClick={(e) => e.preventDefault()}>Unread</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Pending</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Recently Resolved</a>
            </div>
          </div>
        </section>
        <section className="panel side">
          <h2 className="panel-h"><span className="dc-ico"><Mail /></span> Digital Correspondence</h2>
          <div style={{ padding: '0 14px 12px' }}>
            <a className="side-link" href="#" onClick={(e) => e.preventDefault()}>Attachments</a>
            <a className="side-link" href="#" onClick={(e) => e.preventDefault()}>Correspondence Inbox</a>
          </div>
        </section>
        <section className="panel side">
          <h2 className="panel-h" style={{ fontSize: 17 }}>My Account Dashboard</h2>
          <div style={{ padding: '0 14px 14px', fontSize: 12 }}>
            <b>{DEMO_USER.displayName}</b>
            <br />
            {DEMO_USER.email}
            <br />
            {DEMO_USER.role}
            <br />
            <a className="side-link" href="#" onClick={(e) => e.preventDefault()}>Edit profile</a>
          </div>
        </section>
      </aside>
    </div>
  )
}
