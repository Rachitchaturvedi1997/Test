type P = { size?: number; className?: string }
const svg = (size: number, children: React.ReactNode, vb = '0 0 24 24') => (
  <svg width={size} height={size} viewBox={vb} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
)
export const Search = ({ size = 16 }: P) => svg(size, <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>)
export const Chevron = ({ size = 14, up = false }: P & { up?: boolean }) =>
  svg(size, <path d={up ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />)
export const User = ({ size = 16 }: P) => svg(size, <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>)
export const Eye = ({ size = 18, off = false }: P & { off?: boolean }) =>
  svg(size, <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{off && <path d="m3 3 18 18" />}</>)
export const Flag = ({ size = 18, filled = false }: P & { filled?: boolean }) =>
  svg(size, <path d="M5 21V4m0 0h11l-2 4 2 4H5" fill={filled ? 'currentColor' : 'none'} />)
export const Check = ({ size = 13 }: P) => svg(size, <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>)
export const Clock = ({ size = 13 }: P) => svg(size, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const XCircle = ({ size = 13 }: P) => svg(size, <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></>)
export const Calendar = ({ size = 18 }: P) => svg(size, <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4m8-4v4M7 14h2m3 0h2m3 0h0M7 17h2m3 0h2" /></>)
export const Folder = ({ size = 40 }: P) => svg(size, <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M3 10h18" /></>)
export const Info = ({ size = 16 }: P) => svg(size, <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-9.5v.5" /></>)
export const InfoFilled = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="10" fill="#222" /><path d="M12 11v6m0-9.5v.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
)
export const Printer = ({ size = 18 }: P) => svg(size, <><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></>)
export const Help = ({ size = 18 }: P) => svg(size, <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6m0 3v.1" /></>)
export const Arrow = ({ size = 14, left = false }: P & { left?: boolean }) => svg(size, <path d={left ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'} />)
export const Mail = ({ size = 56 }: P) =>
  svg(size, <><path d="M4 10 12 4l8 6v10H4Z" /><path d="m4 10 8 6 8-6" /><path d="M8 8h8M8 11h8" /></>)
export const Envelope = ({ size = 18, open = false }: P & { open?: boolean }) =>
  svg(size, open ? <><path d="M3 10 12 4l9 6v10H3Z" /><path d="m3 10 9 6 9-6" /></> : <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /><path d="M7 15h4" /></>)
export const Download = ({ size = 16 }: P) => svg(size, <><path d="M12 4v11m-5-5 5 5 5-5" /><path d="M5 20h14" /></>)
export const Shield = ({ size = 18 }: P) => svg(size, <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z" /><path d="m9 12 2 2 4-4" /></>)
