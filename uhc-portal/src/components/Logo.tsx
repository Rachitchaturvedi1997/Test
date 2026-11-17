// Stand-in wordmark (not the official logo asset).
export default function Logo({ height = 36 }: { height?: number }) {
  return (
    <svg height={height} viewBox="0 0 120 40" role="img" aria-label="United Healthcare">
      <g fill="none" stroke="#002677" strokeWidth="2.4">
        <path d="M4 6v15a10 10 0 0 0 20 0V6" />
        <path d="M9 6v15a5 5 0 0 0 10 0V6" />
      </g>
      <path d="M13 6h2v16h-2z" fill="#002677" />
      <text x="32" y="17" fontFamily="'Source Serif 4', Georgia, serif" fontSize="14" fill="#002677" fontWeight="600">United</text>
      <text x="32" y="33" fontFamily="'Source Serif 4', Georgia, serif" fontSize="14" fill="#002677" fontWeight="600">Healthcare</text>
    </svg>
  )
}
