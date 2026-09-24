import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { MONTAGE } from '../data/chapters'
import { S } from '../data/content'
import { Phone, type Cut } from '../components/Phone'
import { audio } from '../audio/engine'

const CUTS: Cut[] = ['zoom', 'switch', 'zoom', 'rotate', 'morph', 'reveal']
const POSES = [
  { ry: -18, rz: -3, s: 1 }, { ry: 14, rz: 2, s: 1.08 }, { ry: 0, rz: 0, s: 1.18 }, { ry: -24, rz: 4, s: 0.96 },
  { ry: 20, rz: -2, s: 1.05 }, { ry: -8, rz: 0, s: 1.14 },
]
const ALL = [...MONTAGE, { word: 'All in one place.', src: S('20_liquid_shell') }]
const LENS = { 'Live Geeta': { z: 1.8, ox: 50, oy: 64 } } as Record<string, { z: number; ox: number; oy: number }>

/** Fast cut sequence through every feature, driven by scroll. */
export function Montage() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.3 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setI(Math.min(ALL.length - 1, Math.max(0, Math.floor(v * ALL.length)))))
  useEffect(() => { if (inView) audio.setIntensity(1) }, [inView])
  const prev = useRef(0)
  useEffect(() => {
    if (i === prev.current) return
    audio.sfx(i === ALL.length - 1 || i % 3 === 0 ? 'impact' : 'swipe')
    prev.current = i
  }, [i])
  const item = ALL[i]
  const pose = POSES[i % POSES.length]
  const last = i === ALL.length - 1

  return (
    <section ref={ref} id="montage" className="relative" style={{ height: `${ALL.length * 55}vh` }}>
      <div className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden bg-night">
        {/* the giant word behind the phone */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={item.word}
            className={`pointer-events-none absolute inset-0 grid place-items-center px-4 text-center font-display uppercase leading-[0.85] ${last ? 'text-bone' : 'text-bone/[0.14]'}`}
            style={{ fontSize: last ? 'clamp(44px, 9vw, 150px)' : 'clamp(64px, 17vw, 300px)' }}
            initial={{ opacity: 0, scale: 1.25, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {item.word}
          </motion.div>
        </AnimatePresence>

        {/* flash on each cut */}
        <motion.div key={`f${i}`} className="pointer-events-none absolute inset-0 bg-lime mix-blend-overlay" initial={{ opacity: 0.18 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />

        <motion.div
          style={{ perspective: 1400 }}
          animate={{ opacity: last ? 0 : 1, y: last ? 60 : 0, scale: last ? 0.9 : 1 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div animate={{ rotateY: pose.ry, rotateZ: pose.rz, scale: pose.s }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}>
            <Phone src={item.src} cut={CUTS[i % CUTS.length]} duration={0.5} lens={LENS[item.word]} width="clamp(200px, 20vw, 300px)" glow={0.8} />
          </motion.div>
        </motion.div>

        <div className="absolute bottom-[110px] left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
          {ALL.map((_, k) => (
            <motion.span key={k} className="h-[3px] rounded-full bg-lime" animate={{ width: k === i ? 22 : 6, opacity: k <= i ? 0.9 : 0.2 }} />
          ))}
        </div>
        {last && (
          <motion.p className="absolute bottom-[150px] px-4 text-center text-[15px] text-bone/60" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            Posts, alerts, events, your society, spiritual corner, yoga and live Geeta.
          </motion.p>
        )}
      </div>
    </section>
  )
}
