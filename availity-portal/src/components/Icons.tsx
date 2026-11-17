type P = { size?: number }
const svg = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
)
export const Home = ({ size = 14 }: P) => svg(size, <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></>)
export const Bell = ({ size = 14 }: P) => svg(size, <><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>)
export const Heart = ({ size = 14 }: P) => svg(size, <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />)
export const Help = ({ size = 14 }: P) => svg(size, <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6m0 3v.1" /></>)
export const Lock = ({ size = 13 }: P) => svg(size, <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>)
export const Chevron = ({ size = 11 }: P) => svg(size, <path d="m6 9 6 6 6-6" />)
export const Search = ({ size = 13 }: P) => svg(size, <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>)
export const Eye = ({ size = 17, off = false }: P & { off?: boolean }) =>
  svg(size, <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{off && <path d="m3 3 18 18" />}</>)
export const Info = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="10" fill="#1a5fb4" /><path d="M12 11v6m0-9.5v.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
)
export const Q = ({ size = 13 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="10" fill="#1a5fb4" /><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.5m0 2.9v.1" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" /></svg>
)
export const Check = ({ size = 13 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="10" fill="#f47b20" /><path d="m7.5 12.5 3 3 6-6.5" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" /></svg>
)
export const Monitor = ({ size = 26 }: P) => svg(size, <><rect x="3" y="4" width="18" height="12" rx="1" /><path d="M8 20h8M12 16v4" /></>)
export const Mail = ({ size = 15 }: P) => svg(size, <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m3 7 9 6 9-6" /></>)
export const Calendar = ({ size = 16 }: P) => svg(size, <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4m8-4v4" /></>)
export const Csv = ({ size = 13 }: P) => svg(size, <><path d="M6 3h9l4 4v14H6Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>)
export const Printer = ({ size = 13 }: P) => svg(size, <><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></>)
export const Cloud = ({ size = 13 }: P) => svg(size, <><path d="M7 18a4 4 0 0 1-.5-8 6 6 0 0 1 11.5 1.5A3.5 3.5 0 0 1 17.5 18Z" /><path d="M12 11v6m-3-3 3 3 3-3" /></>)
export const Warn = ({ size = 13 }: P) => svg(size, <><path d="M12 3 2 20h20Z" /><path d="M12 9v5m0 3v.1" /></>)
export const Clip = ({ size = 13 }: P) => svg(size, <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7" />)
export const Viewer = ({ size = 13 }: P) => svg(size, <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 13h8M8 16h5" /></>)
export const Shield = ({ size = 16 }: P) => svg(size, <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z" /><path d="m9 12 2 2 4-4" /></>)
export const Phone = ({ size = 16 }: P) => svg(size, <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>)
