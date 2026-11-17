type P = { size?: number }
const svg = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
)
export const Search = ({ size = 15 }: P) => svg(size, <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>)
export const Chevron = ({ size = 12, up = false }: P & { up?: boolean }) => svg(size, <path d={up ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />)
export const Right = ({ size = 12 }: P) => svg(size, <path d="m9 6 6 6-6 6" />)
export const Left = ({ size = 12 }: P) => svg(size, <path d="m15 6-6 6 6 6" />)
export const User = ({ size = 16 }: P) => svg(size, <><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="10" r="3" /><path d="M6.5 18.5c1.3-2.3 3.2-3.5 5.5-3.5s4.2 1.2 5.5 3.5" /></>)
export const Calendar = ({ size = 16 }: P) => svg(size, <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4m8-4v4" /></>)
export const Ext = ({ size = 12 }: P) => svg(size, <><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v6H4V6h6" /></>)
export const Eye = ({ size = 17, off = false }: P & { off?: boolean }) =>
  svg(size, <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{off && <path d="m3 3 18 18" />}</>)
export const Copy = ({ size = 14 }: P) => svg(size, <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>)
export const Bookmark = ({ size = 14, filled = false }: P & { filled?: boolean }) => svg(size, <path d="M6 3h12v18l-6-4-6 4Z" fill={filled ? 'currentColor' : 'none'} />)
export const Printer = ({ size = 14 }: P) => svg(size, <><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></>)
export const Download = ({ size = 15 }: P) => svg(size, <><path d="M12 4v11m-5-5 5 5 5-5" /><path d="M5 20h14" /></>)
export const Filter = ({ size = 15 }: P) => svg(size, <path d="M3 5h18M6 12h12M10 19h4" />)
export const Columns = ({ size = 15 }: P) => svg(size, <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M9 4v16M15 4v16" /></>)
export const Pencil = ({ size = 22 }: P) => svg(size, <><path d="M4 20l4-1L19 8l-3-3L5 16Z" fill="currentColor" /></>)
export const Info = ({ size = 13 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="10" fill="#196ecf" /><path d="M12 11v6m0-9.5v.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
)
export const Sort = ({ size = 10 }: P) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 10 14" aria-hidden><path d="M5 1 9 5H1Z" fill="#8a94a6" /><path d="M5 13 1 9h8Z" fill="#8a94a6" /></svg>
)
export const Shield = ({ size = 22 }: P) => svg(size, <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z" /><path d="m9 12 2 2 4-4" /></>)
export const Phone = ({ size = 22 }: P) => svg(size, <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />)
export const Message = ({ size = 22 }: P) => svg(size, <path d="M4 5h16v11H8l-4 4Z" />)
export const Chat = ({ size = 16 }: P) => svg(size, <path d="M4 5h16v11H8l-4 4Z" fill="currentColor" />)
export const Finger = ({ size = 44 }: P) =>
  svg(size, <><path d="M8 20c-1-2-1.5-4.5-1.5-7a5.5 5.5 0 0 1 11 0v1" /><path d="M12 13v2c0 2 .5 4 1.5 6" /><path d="M9.5 13a2.5 2.5 0 0 1 5 0c0 3 .5 5.5 2 7.5" /><path d="M4 9a9 9 0 0 1 16 0" /></>)
