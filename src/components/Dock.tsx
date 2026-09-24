import { motion } from 'framer-motion'
import { Building2, CalendarDays, Flower2, House, UsersRound } from 'lucide-react'
import { DOCK, type DockId } from '../data/chapters'
import { audio } from '../audio/engine'

const ICONS: Record<DockId, typeof House> = {
  home: House, community: UsersRound, events: CalendarDays, spiritual: Flower2, society: Building2,
}

export function Dock({ active, onGo, show }: { active: DockId | null; onGo: (chapter: string) => void; show: boolean }) {
  return (
    <motion.nav
      aria-label="Chapters"
      initial={{ opacity: 0, y: 40, filter: 'blur(12px)', scale: 0.94 }}
      animate={show ? { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 } : { opacity: 0, y: 40, filter: 'blur(12px)', scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 1 }}
      className="fixed inset-x-0 z-50 mx-auto flex w-max max-w-[calc(100vw-24px)] items-center gap-0.5 rounded-full border border-white/10 bg-[#171614]/60 p-1.5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl backdrop-saturate-150"
      style={{ bottom: 'calc(18px + env(safe-area-inset-bottom, 0px))' }}
    >
      {DOCK.map((d) => {
        const Icon = ICONS[d.id]
        const on = active === d.id
        return (
          <button
            key={d.id}
            onClick={() => { audio.sfx('click'); onGo(d.chapter) }}
            className="relative flex items-center gap-2 rounded-full px-3 py-2.5 text-[12.5px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime sm:px-4"
            aria-current={on ? 'true' : undefined}
          >
            {on && (
              <motion.span
                layoutId="dock-active"
                className="absolute inset-0 rounded-full bg-lime shadow-[0_6px_24px_-6px_rgba(212,245,107,0.6)]"
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              />
            )}
            <Icon size={17} strokeWidth={1.9} className={`relative z-10 transition-colors ${on ? 'text-ink' : 'text-bone/70'}`} />
            <span className={`relative z-10 hidden transition-colors md:inline ${on ? 'text-ink' : 'text-bone/70'}`}>{d.label}</span>
          </button>
        )
      })}
    </motion.nav>
  )
}
