import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion'
import type { Lens } from '../data/chapters'

export type Cut = 'fade' | 'zoom' | 'rotate' | 'morph' | 'reveal' | 'switch'

const cuts: Record<Cut, { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  zoom: { initial: { opacity: 0, scale: 1.25, filter: 'blur(10px)' }, animate: { opacity: 1, scale: 1, filter: 'blur(0px)' }, exit: { opacity: 0, scale: 0.9, filter: 'blur(6px)' } },
  rotate: { initial: { opacity: 0, rotateY: -35, scale: 0.95 }, animate: { opacity: 1, rotateY: 0, scale: 1 }, exit: { opacity: 0, rotateY: 35, scale: 0.95 } },
  morph: { initial: { opacity: 0, borderRadius: '50%', scale: 0.6 }, animate: { opacity: 1, borderRadius: '0%', scale: 1 }, exit: { opacity: 0, scale: 1.1 } },
  reveal: { initial: { clipPath: 'inset(100% 0% 0% 0%)' }, animate: { clipPath: 'inset(0% 0% 0% 0%)' }, exit: { opacity: 0 } },
  switch: { initial: { x: '100%' }, animate: { x: '0%' }, exit: { x: '-30%', opacity: 0.4 } },
}

/**
 * A realistic phone. The screenshot inside is always rendered crisp: glass,
 * reflections and depth-of-field happen on layers around it, never on it.
 */
export function Phone({
  src, lens = { z: 1, ox: 50, oy: 50 }, cut = 'fade', width = 'clamp(230px, 23vw, 350px)', glow = 0.5, duration = 0.9, className = '',
}: {
  src: string; lens?: Lens; cut?: Cut; width?: string; glow?: number; duration?: number; className?: string
}) {
  // translate so the focal point sits in the middle of the screen, clamped to edges
  const ty = Math.min(0, Math.max(100 - 100 * lens.z, 50 - lens.oy * lens.z))
  const tx = Math.min(0, Math.max(100 - 100 * lens.z, 50 - lens.ox * lens.z))
  const c = cuts[cut]
  return (
    <div className={`relative ${className}`} style={{ width, transformStyle: 'preserve-3d' }}>
      {/* edge light behind the device */}
      <motion.div
        className="pointer-events-none absolute -inset-[18%] rounded-[40%]"
        animate={{ opacity: glow }}
        transition={{ duration: 1.6 }}
        style={{ background: 'radial-gradient(closest-side, rgba(212,245,107,0.22), rgba(242,166,90,0.10) 55%, transparent 75%)', filter: 'blur(30px)' }}
      />
      {/* frame */}
      <div
        className="relative rounded-[15%/7%] p-[3.2%]"
        style={{
          aspectRatio: '1078 / 2399',
          background: 'linear-gradient(145deg, #3a3834 0%, #151412 30%, #0a0a09 60%, #2b2926 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.10) inset, 0 1px 0 1px rgba(255,255,255,0.06), 0 60px 120px -30px rgba(0,0,0,0.85), 0 30px 60px -20px rgba(0,0,0,0.6)',
        }}
      >
        {/* side buttons */}
        <span className="absolute -right-[1.4%] top-[22%] h-[9%] w-[1.4%] rounded-r bg-[#2a2825]" />
        <span className="absolute -right-[1.4%] top-[34%] h-[14%] w-[1.4%] rounded-r bg-[#2a2825]" />
        <div className="relative h-full w-full overflow-hidden rounded-[12%/5.6%] bg-black" style={{ perspective: 900 }}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={src}
              className="absolute inset-0 overflow-hidden"
              initial={c.initial}
              animate={c.animate}
              exit={c.exit}
              transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.img
                src={src}
                alt=""
                draggable={false}
                className="block h-full w-full select-none object-cover"
                style={{ originX: 0, originY: 0 }}
                initial={false}
                animate={{ scale: lens.z, x: `${tx}%`, y: `${ty}%` }}
                transition={{ duration: 2.2, ease: [0.25, 0.8, 0.25, 1] }}
              />
            </motion.div>
          </AnimatePresence>
          {/* punch-hole camera */}
          <span className="absolute left-1/2 top-[1.3%] h-[2.2%] w-[4.9%] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />
          {/* glass reflection: very light, stays off the UI's legibility */}
          <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 22%, transparent 38%, transparent 78%, rgba(255,255,255,0.05) 100%)' }} />
        </div>
        {/* bezel highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-[15%/7%]" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.08), inset 2px 2px 3px rgba(255,255,255,0.12)' }} />
      </div>
      {/* contact shadow */}
      <div className="pointer-events-none absolute -bottom-[7%] left-[10%] right-[10%] h-[6%] rounded-[50%] bg-black/70 blur-2xl" />
    </div>
  )
}
