// Simple stand-in wordmark (not the official logo asset).
export default function Logo({ size = 1 }: { size?: number }) {
  const w = 120 * size
  return (
    <svg width={w} height={w * 0.5} viewBox="0 0 120 60" role="img" aria-label="cigna healthcare">
      <g fill="#36d17b">
        <ellipse cx="60" cy="6" rx="2.4" ry="3.6" />
        <ellipse cx="53" cy="9" rx="2.2" ry="3.4" transform="rotate(-30 53 9)" />
        <ellipse cx="67" cy="9" rx="2.2" ry="3.4" transform="rotate(30 67 9)" />
        <ellipse cx="48" cy="15" rx="2" ry="3.2" transform="rotate(-55 48 15)" />
        <ellipse cx="72" cy="15" rx="2" ry="3.2" transform="rotate(55 72 15)" />
        <ellipse cx="56" cy="15" rx="1.9" ry="3" transform="rotate(-15 56 15)" />
        <ellipse cx="64" cy="15" rx="1.9" ry="3" transform="rotate(15 64 15)" />
        <ellipse cx="60" cy="20" rx="1.8" ry="2.6" />
      </g>
      <text x="60" y="43" textAnchor="middle" fontFamily="Outfit, Arial, sans-serif" fontSize="27" fontWeight="600" fill="#0033ff" letterSpacing="-0.5">cigna</text>
      <text x="82" y="54" textAnchor="middle" fontFamily="Outfit, Arial, sans-serif" fontSize="7" fill="#0033ff">healthcare</text>
    </svg>
  )
}
