import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { CHAPTERS, type Cam, type Chapter, type DockId } from '../data/chapters'
import { Phone, type Cut } from '../components/Phone'
import { LogoMark } from '../components/Logo'
import { Overlay } from './Overlays'
import { useMedia } from '../components/hooks'
import { audio } from '../audio/engine'

const N = CHAPTERS.length
const BEHIND = new Set(['mesh', 'yoga'])
const ease = [0.22, 1, 0.36, 1] as const
const CUTS: Record<string, Cut> = { hero: 'fade', noise: 'fade', posts: 'zoom', alerts: 'fade', events: 'reveal', society: 'morph', mesh: 'rotate', spiritual: 'zoom', yoga: 'switch', geeta: 'fade' }

export type FilmHandle = { go: (id: string) => void }

function useCamValue(p: MotionValue<number>, key: keyof Cam, mobile: boolean) {
  const { stops, vals } = useMemo(() => {
    const stops: number[] = []
    const vals: number[] = []
    CHAPTERS.forEach((c, i) => {
      const cam = mobile ? c.camMobile : c.cam
      stops.push(i === 0 ? 0 : (i + 0.18) / N, (i + 0.82) / N)
      vals.push(cam[key], cam[key])
    })
    return { stops, vals }
  }, [key, mobile])
  const raw = useTransform(p, stops, vals)
  return useSpring(raw, { stiffness: 55, damping: 20, mass: 1 })
}

/** Title that arrives word by word, like a title card. */
function Title({ ch, delay = 0, hero }: { ch: Chapter; delay?: number; hero?: boolean }) {
  const words = [...ch.title[0].split(' ').map((w) => ({ w, light: true })), { w: '\n', light: false }, ...ch.title[1].split(' ').map((w) => ({ w, light: false }))]
  let k = 0
  return (
    <h2 className={`font-display uppercase leading-[0.9] tracking-[-0.015em] text-bone ${hero ? 'text-[clamp(52px,8.4vw,150px)]' : 'text-[clamp(36px,4.1vw,78px)]'}`} style={{ textWrap: 'balance' }}>
      {words.map((x, i) => {
        if (x.w === '\n') return <br key={i} />
        const d = delay + k++ * 0.11
        return (
          <motion.span
            key={i}
            className={`mr-[0.22em] inline-block ${x.light ? 'italic text-bone/55' : ''}`}
            initial={{ opacity: 0, y: '0.35em', filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: '-0.2em', filter: 'blur(10px)', transition: { duration: 0.45, delay: i * 0.03 } }}
            transition={{ duration: 1.1, delay: d, ease }}
          >
            {x.w}
          </motion.span>
        )
      })}
    </h2>
  )
}

function ChapterText({ ch, phase, mobile }: { ch: Chapter; phase: number; mobile: boolean }) {
  const hero = ch.id === 'hero'
  if (hero && phase < 4) return null
  const base = hero ? 0 : 0.15
  const lines = mobile ? ch.lines.slice(0, 1) : ch.lines
  return (
    <motion.div className="flex flex-col gap-5" exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.2 } }}>
      <motion.div
        className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-lime"
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, delay: base }}
      >
        <span className="h-px w-8 bg-lime/60" />
        {ch.label}
      </motion.div>
      <Title ch={ch} delay={base + 0.1} hero={hero} />
      <div className="flex max-w-[30rem] flex-col gap-3">
        {lines.map((l, i) => (
          <motion.p
            key={l}
            className={i === 0 ? 'text-[clamp(16px,1.35vw,21px)] font-medium text-bone/90' : 'text-[15px] leading-relaxed text-bone/55'}
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 1, delay: (hero ? 1.0 : base + 0.6) + i * 0.18, ease }}
          >
            {l}
          </motion.p>
        ))}
        {ch.caption && !mobile && (
          <motion.p className="text-[12px] text-dust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1.4 }}>
            {ch.caption}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

export const Film = forwardRef<FilmHandle, { phase: number; onDock: (d: DockId | null) => void }>(function Film({ phase, onDock }, handle) {
  const ref = useRef<HTMLDivElement>(null)
  const mobile = useMedia('(max-width: 767px)')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [pos, setPos] = useState({ i: 0, sub: 0 })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const c = Math.min(N - 0.0001, Math.max(0, v * N))
    const i = Math.floor(c)
    const sub = Math.round((c - i) * 50) / 50
    setPos((p) => (p.i === i && p.sub === sub ? p : { i, sub }))
  })

  useImperativeHandle(handle, () => ({
    go(id: string) {
      const i = CHAPTERS.findIndex((c) => c.id === id)
      const el = ref.current
      if (i < 0 || !el) return
      const top = el.offsetTop + ((i + (i === 0 ? 0 : 0.35)) / N) * (el.offsetHeight - window.innerHeight)
      window.scrollTo({ top, behavior: 'smooth' })
    },
  }))

  const ch = CHAPTERS[pos.i]
  const sIdx = Math.min(ch.screens.length - 1, Math.floor(pos.sub * ch.screens.length))
  const lens = ch.lens[Math.min(ch.lens.length - 1, Math.floor(pos.sub * ch.lens.length))]

  useEffect(() => { onDock(ch.dock); audio.setIntensity(ch.intensity) }, [ch, onDock])
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    audio.sfx(ch.id === 'alerts' || ch.id === 'geeta' ? 'transition' : 'swipe')
  }, [ch.id])
  useEffect(() => { if (sIdx > 0) audio.sfx('swipe') }, [sIdx])

  const x = useCamValue(scrollYProgress, 'x', mobile)
  const y = useCamValue(scrollYProgress, 'y', mobile)
  const s = useCamValue(scrollYProgress, 's', mobile)
  const rx = useCamValue(scrollYProgress, 'rx', mobile)
  const ry = useCamValue(scrollYProgress, 'ry', mobile)
  const rz = useCamValue(scrollYProgress, 'rz', mobile)
  const xv = useTransform(x, (v) => `${v}vw`)
  const yv = useTransform(y, (v) => `${v}vh`)

  // environment light follows the chapter's mood
  const moodStops = useMemo(() => CHAPTERS.flatMap((_, i) => [i === 0 ? 0 : (i + 0.1) / N, (i + 0.9) / N]), [])
  const moodVals = useMemo(() => CHAPTERS.flatMap((c) => [c.mood, c.mood]), [])
  const mood = useSpring(useTransform(scrollYProgress, moodStops, moodVals), { stiffness: 40, damping: 20 })
  const dark = useTransform(mood, (m) => 1 - m)
  const glowX = useTransform(x, (v) => `${50 + v}%`)

  const intro = phase
  const textSide = mobile ? 'top' : ch.side

  return (
    <section ref={ref} id="film" className="relative" style={{ height: `${N * 150}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* environment */}
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: intro >= 1 ? 1 : 0 }} transition={{ duration: 2.4, ease: 'easeOut' }}>
          <motion.div className="absolute inset-0" style={{ opacity: mood, background: 'radial-gradient(60% 55% at var(--gx) 45%, rgba(242,166,90,0.20), rgba(212,245,107,0.06) 45%, transparent 70%)', ['--gx' as string]: glowX }} />
          <div className="absolute inset-x-0 bottom-0 h-[45%]" style={{ background: 'radial-gradient(50% 60% at 50% 100%, rgba(242,166,90,0.10), transparent 70%)' }} />
          <motion.div className="absolute inset-0 bg-black" style={{ opacity: useTransform(dark, [0, 1], [0, 0.55]) }} />
        </motion.div>
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.07]" />

        {/* huge Sanskrit behind the Geeta chapter */}
        <AnimatePresence>
          {ch.id === 'geeta' && (
            <motion.div key="skt" className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden"
              initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 3, ease }}>
              <div className="whitespace-nowrap text-center font-display text-[11vw] leading-[1.1] text-bone/[0.045]">
                उद्धरेदात्मनाऽऽत्मानं<br />नात्मानमवसादयेत्
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* intro logo */}
        <AnimatePresence>
          {intro >= 2 && intro < 4 && (
            <motion.div key="logo" className="absolute inset-0 z-30 grid place-items-center"
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(16px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)', transition: { duration: 0.9 } }} transition={{ duration: 1.2, ease }}>
              <div className="flex flex-col items-center gap-4">
                <LogoMark size={64} />
                <span className="text-[13px] font-semibold uppercase tracking-[0.5em] text-bone/80">Moholla</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* camera rig */}
        <motion.div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ x: xv, y: yv, scale: s }}>
          {!mobile && intro >= 5 && BEHIND.has(ch.id) && <Overlay id={ch.id} sub={pos.sub} />}
          <motion.div
            className="absolute left-0 top-0"
            initial={{ opacity: 0, y: '40vh', filter: 'blur(20px)' }}
            animate={intro >= 3 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 2.2, ease }}
            style={{ perspective: 1400 }}
          >
            <motion.div style={{ rotateX: rx, rotateY: ry, rotateZ: rz, x: '-50%', y: '-50%', transformStyle: 'preserve-3d' }}>
              <motion.div animate={{ y: [0, -10, 0], rotateZ: [0, 0.4, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
                <Phone src={ch.screens[sIdx]} lens={lens} cut={CUTS[ch.id]} glow={0.35 + ch.mood * 0.6} />
              </motion.div>
            </motion.div>
          </motion.div>
          {!mobile && intro >= 5 && !BEHIND.has(ch.id) && <Overlay id={ch.id} sub={pos.sub} />}
        </motion.div>

        {/* chapter text */}
        <div
          className={`absolute z-20 ${textSide === 'top' ? 'inset-x-4 top-[calc(76px+env(safe-area-inset-top,0px))]' : textSide === 'left' ? 'left-[5vw] top-1/2 -translate-y-1/2' : 'right-[5vw] top-1/2 -translate-y-1/2'}`}
          style={{ width: mobile ? undefined : ch.id === 'hero' ? 'min(52vw, 820px)' : 'min(34vw, 520px)' }}
        >
          <AnimatePresence mode="wait">
            <ChapterText key={ch.id} ch={ch} phase={intro} mobile={mobile} />
          </AnimatePresence>
        </div>

        {/* film progress rail */}
        <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 lg:flex" aria-hidden>
          {CHAPTERS.map((c, i) => (
            <motion.span key={c.id} className="block w-[2px] rounded-full bg-bone" animate={{ height: i === pos.i ? 28 : 10, opacity: i === pos.i ? 0.9 : 0.2 }} transition={{ duration: 0.5, ease }} />
          ))}
        </div>

        {/* scroll cue */}
        <AnimatePresence>
          {pos.i === 0 && pos.sub < 0.1 && intro >= 5 && (
            <motion.div className="absolute bottom-[104px] left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-bone/40 md:flex"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.8, duration: 1 }}>
              Scroll
              <span className="relative block h-10 w-px overflow-hidden bg-bone/15">
                <motion.span className="absolute left-0 top-0 block h-4 w-px bg-lime" animate={{ y: [-16, 40] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
})
