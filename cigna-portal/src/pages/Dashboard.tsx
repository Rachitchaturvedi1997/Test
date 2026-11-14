import { useState } from 'react'
import { Link } from 'react-router-dom'
import { claims, flags, money } from '../data'
import { DEMO_USER } from '../auth'
import StatusBadge from '../components/StatusBadge'
import { Arrow, Chevron, Flag, Mail } from '../components/Icons'

const SLIDES = [
  {
    title: 'CignaforHCP . com enhancements make it easier to upload and track status of pended claim attachments',
    body: 'New updates can help users avoid unnecessary repeat uploads , simplify follow-up , and provide the information needed to move pended claims toward resolution more efficiently .',
    hue: '#f6e7da',
  },
  {
    title: 'View remittance reports and payment details in one place',
    body: 'Remittance reports are now linked directly from each claim detail page so you can download the EFT summary needed to post payments faster .',
    hue: '#dfe9ff',
  },
  {
    title: 'Reconsideration status now available online',
    body: 'Track the status of submitted claim reconsiderations and appeals right from the claim detail page , including correspondence history .',
    hue: '#dff5e7',
  },
]

const UPDATES = [
  { d: '11/10/26', t: 'Updated reimbursement policy: Evaluation and management services' },
  { d: '10/28/26', t: 'Reminder: Annual provider directory attestation due' },
  { d: '10/14/26', t: 'New prior authorization requirements for cardiac imaging' },
  { d: '09/14/26', t: 'CignaforHCP.com scheduled maintenance completed' },
  { d: '08/30/26', t: 'Claim coding edit updates effective 10/01/26' },
]

export function Leaves() {
  return (
    <svg className="leaves" viewBox="0 0 900 640" preserveAspectRatio="xMaxYMin slice" aria-hidden>
      <g fill="#2fd27a">
        <path d="M150 -10 C 210 40, 230 110, 190 170 C 140 130, 120 60, 150 -10Z" />
        <path d="M330 -20 C 400 30, 420 110, 370 170 C 320 120, 300 50, 330 -20Z" />
        <path d="M520 -30 C 600 10, 620 110, 560 170 C 500 120, 480 40, 520 -30Z" />
        <path d="M720 -20 C 790 20, 820 110, 760 170 C 700 120, 690 40, 720 -20Z" />
        <path d="M60 520 C 120 560, 140 620, 110 680 L 30 680 C 20 620, 30 560, 60 520Z" />
        <path d="M420 540 C 480 570, 500 630, 470 690 L 380 690 C 380 630, 390 570, 420 540Z" />
        <path d="M800 470 C 870 510, 900 590, 870 660 L 780 660 C 760 590, 770 520, 800 470Z" />
      </g>
    </svg>
  )
}

function SlideArt({ i, hue }: { i: number; hue: string }) {
  return (
    <svg viewBox="0 0 400 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="360" fill={hue} />
      <circle cx={300 - i * 40} cy="90" r="70" fill="#fff" opacity=".5" />
      <rect x="70" y="190" width="260" height="150" rx="10" fill="#2b2f3a" />
      <rect x="82" y="202" width="236" height="120" rx="4" fill="#e9eefc" />
      <rect x="96" y="216" width="120" height="10" rx="3" fill="#0033ff" />
      <rect x="96" y="236" width="200" height="6" rx="3" fill="#b9c4ee" />
      <rect x="96" y="250" width="170" height="6" rx="3" fill="#b9c4ee" />
      <rect x="96" y="276" width="70" height="26" rx="13" fill="#36d17b" />
      <rect x="40" y="338" width="320" height="10" rx="5" fill="#1d212a" />
      <circle cx="200" cy="120" r="44" fill="#8a5a44" />
      <path d="M140 200 C 150 160, 250 160, 260 200Z" fill="#1d1d1d" />
      <path d="M152 112 C 150 60, 250 60, 248 112 C 240 80, 160 80, 152 112Z" fill="#1d1d1d" />
    </svg>
  )
}

export default function Dashboard() {
  const [slide, setSlide] = useState(0)
  const [tab, setTab] = useState<'recent' | 'flagged'>('recent')
  const [flagged, setFlagged] = useState(flags.get())
  const s = SLIDES[slide]
  const list = tab === 'recent' ? claims.slice(0, 20) : claims.filter((c) => flagged.has(c.claimNumber))

  return (
    <>
      <section className="hero">
        <Leaves />
        <h1>Welcome , {DEMO_USER.firstName}</h1>
        <div className="featured-label">Featured updates</div>
        <div className="carousel-ctrls">
          <button className="circle-btn" onClick={() => setSlide((slide + SLIDES.length - 1) % SLIDES.length)} aria-label="Previous">
            <Arrow left />
          </button>
          <button className="circle-btn on" onClick={() => setSlide((slide + 1) % SLIDES.length)} aria-label="Next">
            <Arrow />
          </button>
        </div>
        <div className="carousel">
          <div className="copy">
            <h2>{s.title}</h2>
            <p>{s.body}</p>
            <button className="btn-primary" onClick={() => alert('Opens the announcement (demo).')}>
              Learn more
            </button>
            <div className="dots">
              {SLIDES.map((_, i) => (
                <span key={i} className={i === slide ? 'on' : ''} />
              ))}
            </div>
          </div>
          <div className="art">
            <SlideArt i={slide} hue={s.hue} />
          </div>
        </div>
      </section>

      <section className="dash-grid">
        <div className="card">
          <div className="card-h">
            <h3>Claims</h3>
            <Link to="/app/claim/search" className="link" style={{ fontSize: 13 }}>
              Search claims →
            </Link>
          </div>
          <div className="tabs-mini">
            <button className={tab === 'recent' ? 'on' : ''} onClick={() => setTab('recent')}>
              Recent
            </button>
            <button className={tab === 'flagged' ? 'on' : ''} onClick={() => setTab('flagged')}>
              Flagged
            </button>
          </div>
          <div className="claim-list" id="dashboard-claims">
            {list.length === 0 && <div className="empty">You have no flagged claims. Use the flag icon to keep track of claims.</div>}
            {list.map((c) => (
              <div className="claim-row" key={c.claimNumber} data-claim={c.claimNumber}>
                <div>
                  <Link className="claim-num" to={`/app/claim/detail/${c.claimNumber}?tin=${c.provider.tin}&claimCompositeKey=${c.compositeKey}`}>
                    {c.claimNumber}
                  </Link>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                    <button
                      className={`flag-btn ${flagged.has(c.claimNumber) ? 'on' : ''}`}
                      onClick={() => setFlagged(new Set(flags.toggle(c.claimNumber)))}
                      aria-label="Flag claim"
                    >
                      <Flag filled={flagged.has(c.claimNumber)} />
                    </button>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
                <div>
                  <div className="lbl">Patient name</div>
                  <div className="val">
                    {c.patient.firstName}
                    <br />
                    {c.patient.lastName}
                  </div>
                </div>
                <div>
                  <div className="lbl">Patient ID</div>
                  <div className="val mono">{c.patient.id}</div>
                </div>
                <div>
                  <div className="lbl">Submitted amount</div>
                  <div className="val mono">{money(c.submitted)}</div>
                </div>
                <div>
                  <div className="lbl">Date(s) of service</div>
                  <div className="val mono">
                    {c.dosFrom}-
                    <br />
                    {c.dosTo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-h">
              <h3>Messages</h3>
              <span className="link" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                All <Chevron size={12} />
              </span>
            </div>
            <div className="empty" style={{ borderTop: '1px solid var(--line)' }}>
              <Mail />
              <p style={{ fontStyle: 'italic' }}>There are no new messages .</p>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
              <Link to="/app/info/message-center" className="link" style={{ fontWeight: 500, fontSize: 13 }}>
                Go to message center →
              </Link>
            </div>
          </div>
          <div className="card">
            <div className="card-h">
              <h3>Latest Updates</h3>
            </div>
            <ul className="updates">
              {UPDATES.map((u) => (
                <li key={u.d}>
                  <div className="d">{u.d}</div>
                  {u.t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
