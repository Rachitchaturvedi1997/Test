import type { ClaimStatus } from '../data'
import { Check, Clock, XCircle } from './Icons'

export default function StatusBadge({ status, lg }: { status: ClaimStatus; lg?: boolean }) {
  const cls = status.toLowerCase().replace(' ', '-')
  const Icon = status === 'PROCESSED' ? Check : status === 'DENIED' ? XCircle : Clock
  return (
    <span className={`badge ${cls} ${lg ? 'lg' : ''}`} data-status={status}>
      <Icon size={lg ? 15 : 12} /> {status}
    </span>
  )
}
