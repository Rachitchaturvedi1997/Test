// Stand-in mark (not the official logo asset).
export default function Logo({ dark = false, height = 34, essentials = false }: { dark?: boolean; height?: number; essentials?: boolean }) {
  const text = dark ? '#ffffff' : '#5a5f66'
  return (
    <svg height={height} viewBox={`0 0 ${essentials ? 250 : 170} 44`} role="img" aria-label="Availity">
      <g fill="none" strokeWidth="5" strokeLinejoin="round">
        <rect x="6" y="12" width="20" height="20" rx="6" stroke="#f7941d" transform="rotate(-25 16 22)" />
        <rect x="20" y="12" width="20" height="20" rx="6" stroke="#fbb040" transform="rotate(25 30 22)" />
      </g>
      <text x="50" y="31" fontFamily="'Open Sans', Arial, sans-serif" fontSize="25" fontWeight="600" fill={text}>Availity</text>
      <text x="152" y="17" fontFamily="Arial" fontSize="7" fill={text}>®</text>
      {essentials && <text x="164" y="30" fontFamily="'Open Sans', Arial, sans-serif" fontSize="12" letterSpacing="1.5" fill="#c9ccd1">ESSENTIALS</text>}
    </svg>
  )
}
