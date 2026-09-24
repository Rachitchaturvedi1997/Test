import { motion } from 'framer-motion'
import { sound, useSound } from './hooks'

export function SoundToggle() {
  const on = useSound()
  return (
    <button
      onClick={() => sound.set(!on)}
      className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[12px] font-medium tracking-[0.08em] text-bone/80 uppercase backdrop-blur-xl transition hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime"
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
    >
      <span className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="w-[2px] rounded-full bg-lime"
            animate={on ? { height: ['30%', '100%', '45%', '80%', '30%'] } : { height: '30%' }}
            transition={on ? { duration: 1.2 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 } : { duration: 0.3 }}
          />
        ))}
      </span>
      {on ? 'Sound on' : 'Sound'}
    </button>
  )
}
