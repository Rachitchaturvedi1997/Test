import type { AvStatus } from '../data'
export default function StatusPill({ status, onClick }: { status: AvStatus; onClick?: () => void }) {
  const cls = `pill pill-${status.toLowerCase()}`
  return onClick ? (
    <button className={cls} onClick={onClick} data-status={status}>{status}</button>
  ) : (
    <span className={cls} data-status={status}>{status}</span>
  )
}
