import { Link, useParams } from 'react-router-dom'
export default function InfoPage() {
  const { slug = '' } = useParams()
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <div className="cs-page">
      <h1 className="app-title">{title}</h1>
      <p>This application is not populated in the demo environment. Claim Status and Remittance Viewer are fully functional with dummy data.</p>
      <Link to="/claim-status">Go to Claim Status →</Link>
    </div>
  )
}
