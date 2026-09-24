import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Film, type FilmHandle } from './sections/Film'
import { Montage } from './sections/Montage'
import { Finale } from './sections/Finale'
import { Dock } from './components/Dock'
import { Footer } from './components/Footer'
import { SoundToggle } from './components/SoundToggle'
import { Wordmark } from './components/Logo'
import { Screens } from './pages/Screens'
import { Story } from './pages/Story'
import type { DockId } from './data/chapters'

type Route = 'film' | 'screens' | 'story'
const readRoute = (): Route => {
  const h = window.location.hash.replace('#', '')
  return h === 'screens' || h === 'story' ? h : 'film'
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [phase, setPhase] = useState(0)
  const [dock, setDock] = useState<DockId | null>('home')
  const film = useRef<FilmHandle>(null)
  const pending = useRef<string | null>(null)

  useEffect(() => {
    const on = () => { setRoute(readRoute()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  // cinematic opening: dark -> light -> logo -> phone -> title -> copy -> dock
  useEffect(() => {
    if (window.scrollY > 40) { setPhase(6); return }
    const t = [300, 1000, 2300, 3300, 4300, 5000].map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms))
    return () => t.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (route === 'film' && pending.current) {
      const id = pending.current
      pending.current = null
      requestAnimationFrame(() => film.current?.go(id))
    }
  }, [route])

  const go = useCallback((chapter: string) => {
    if (route !== 'film') { pending.current = chapter; window.location.hash = ''; return }
    film.current?.go(chapter)
  }, [route])
  const onDock = useCallback((d: DockId | null) => setDock(d), [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-night text-bone">
        <motion.header
          className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 bg-gradient-to-b from-night via-night/70 to-transparent px-4 pb-6 sm:px-8"
          style={{ paddingTop: 'calc(18px + env(safe-area-inset-top, 0px))' }}
          initial={{ opacity: 0, y: -12 }}
          animate={phase >= 4 || route !== 'film' ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <a href="#" aria-label="Moholla home"><Wordmark /></a>
          <nav className="flex items-center gap-1 sm:gap-2">
            {([['film', 'The film', ''], ['screens', 'Inside the app', '#screens'], ['story', 'Why Moholla', '#story']] as const).map(([r, label, href]) => (
              <a key={r} href={href || '#'} className={`relative hidden rounded-full px-3.5 py-2 text-[13px] transition sm:block ${route === r ? 'text-bone' : 'text-bone/55 hover:text-bone'}`}>
                {route === r && <motion.span layoutId="top-active" className="absolute inset-0 rounded-full bg-white/[0.07]" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                <span className="relative">{label}</span>
              </a>
            ))}
            <SoundToggle />
          </nav>
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.div key={route} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            {route === 'film' && (
              <>
                <Film ref={film} phase={phase} onDock={onDock} />
                <Montage />
                <Finale />
              </>
            )}
            {route === 'screens' && <Screens />}
            {route === 'story' && <Story />}
            <Footer />
          </motion.div>
        </AnimatePresence>

        <Dock active={route === 'film' ? dock : null} onGo={go} show={phase >= 6 || route !== 'film'} />
      </div>
    </MotionConfig>
  )
}
