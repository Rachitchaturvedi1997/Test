/** The Moholla mark: an ink roof-"M" on the lime tile (same geometry as the app's LogoMark). */
export function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 108 108" className={className} aria-hidden>
      <rect width="108" height="108" rx="28" fill="#D4F56B" />
      <path d="M36,72 L36,49.7 L54,36 L72,49.7 L72,72 M54,72 L54,54.7" fill="none" stroke="#0B0B0C" strokeWidth="6.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={26} />
      <span className="font-sans text-[15px] font-semibold tracking-[-0.01em] text-bone">Moholla</span>
    </span>
  )
}
