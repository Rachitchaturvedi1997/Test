import { Link, useParams, useSearchParams } from 'react-router-dom'
import { MENUS } from '../components/Layout'

const titleFor = (slug: string) => {
  for (const m of MENUS) for (const i of m.items) if (i.to.endsWith(`/${slug}`)) return i.label
  return slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
}

export default function InfoPage() {
  const { slug = '' } = useParams()
  const [q] = useSearchParams()
  const title = slug === 'search' ? 'Search Resources' : titleFor(slug)
  return (
    <div className="page">
      <h1 className="page-title">{title}</h1>
      {slug === 'search' && <p>Results for “{q.get('q')}”: no resources found in the demo environment.</p>}
      <p style={{ maxWidth: 640, lineHeight: 1.6 }}>
        This section is part of the portal navigation but is not populated in the demo environment. Claims search, claim details, remittance
        reports and patient search are fully functional with dummy data.
      </p>
      <p>
        <Link to="/app/claim/search">Go to Claims search →</Link>
      </p>
    </div>
  )
}
