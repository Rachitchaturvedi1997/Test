import { Link, useParams } from 'react-router-dom'
export default function InfoPage() {
  const { slug = '' } = useParams()
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <div className="page">
      <h1 className="h1">{title}</h1>
      <p>This section is not populated in the demo environment. Claims & Payments › Look up a Claim is fully functional with dummy data.</p>
      <Link to="/claims">Go to Look up a claim →</Link>
    </div>
  )
}
