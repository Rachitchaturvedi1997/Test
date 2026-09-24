import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { S } from '../data/content'
import { Phone } from '../components/Phone'
import { audio } from '../audio/engine'

const SEQ = [S('22_intro_splash'), S('22_intro_handwriting'), S('26_welcome')]

/** The app's real opening sequence, then the camera pushes in and fades to dark. */
export function Finale() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [stage, setStage] = useState(0)
  useMotionValueEvent(p, 'change', (v) => setStage(v < 0.2 ? 0 : v < 0.4 ? 1 : v < 0.62 ? 2 : v < 0.78 ? 3 : v < 0.88 ? 4 : 5))
  useEffect(() => {
    if (stage === 1) audio.setIntensity(0.25)
    if (stage === 3) audio.setIntensity(0.08)
    if (stage === 4) audio.finale()
  }, [stage])

  const scale = useSpring(useTransform(p, [0, 0.55, 0.8], [0.9, 1, 2.8]), { stiffness: 50, damping: 20 })
  const fade = useTransform(p, (v) => Math.min(1, Math.max(0, (v - 0.66) / 0.14)))
  const src = SEQ[Math.min(2, stage)]

  return (
    <section ref={ref} id="finale" className="relative" style={{ height: '340vh' }}>
      <div className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden bg-night">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(40% 50% at 50% 50%, rgba(212,245,107,0.10), transparent 70%)' }} />
        <motion.div style={{ scale }}>
          <Phone src={src} cut="fade" duration={1.4} width="clamp(210px, 21vw, 320px)" glow={0.7} />
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-0 bg-[#050505]" style={{ opacity: fade }} />
        <div className="absolute inset-0 grid place-items-center px-4 text-center">
          <AnimatePresence>
            {stage >= 4 && (
              <motion.div key="t" className="flex flex-col items-center gap-5" exit={{ opacity: 0 }}>
                <motion.h2 className="font-display text-[clamp(56px,11vw,190px)] uppercase leading-none tracking-[0.02em] text-bone"
                  initial={{ opacity: 0, letterSpacing: '0.3em', filter: 'blur(18px)' }} animate={{ opacity: 1, letterSpacing: '0.02em', filter: 'blur(0px)' }}
                  transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}>
                  Moholla
                </motion.h2>
                <motion.p className="font-display text-[clamp(22px,2.6vw,40px)] italic text-bone/75" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 1.4 }}>
                  Meet your neighbours.
                </motion.p>
                {stage >= 5 && (
                  <motion.p className="text-[12px] font-semibold uppercase tracking-[0.34em] text-lime" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6 }}>
                    Your community. Your place.
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
