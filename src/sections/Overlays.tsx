import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, BellRing, CalendarDays, Clock, Heart, MapPin, MessageCircle, ShieldCheck, TriangleAlert, Users, Zap, Droplets, CheckCircle2 } from 'lucide-react'
import { ALERTS, EVENTS, GROUP_NOISE, POSES, POSTS, SOCIETY, VERSE, type Post } from '../data/content'
import { audio } from '../audio/engine'

const ease = [0.22, 1, 0.36, 1] as const
const spring = { type: 'spring', stiffness: 90, damping: 20, mass: 1 } as const

/** Absolute layer centred on the phone. 1em = one tenth of the phone width. */
function Layer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 ${className}`} style={{ fontSize: 'clamp(23px, 2.3vw, 35px)' }}>
      {children}
    </div>
  )
}

/** Positions a child relative to the phone centre, in phone-tenths. */
function At({ x, y, children, z = 0, className = '' }: { x: number | string; y: number; z?: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={`absolute ${className}`} style={{ left: typeof x === 'number' ? `${x}em` : x, top: `${y}em`, zIndex: z }}>
      <div className="text-[13px]">{children}</div>
    </div>
  )
}

/** left edge for a card of width w (px) whose near edge sits x phone-tenths from centre, on side dir */
const L = (dir: number, x: number, w: number) => (dir > 0 ? `${x}em` : `calc(${-x}em - ${w}px)`)

function useOnce(cond: boolean, fn: () => void) {
  const done = useRef(false)
  useEffect(() => {
    if (cond && !done.current) { done.current = true; fn() }
    if (!cond) done.current = false
  }, [cond, fn])
}

/* ---------------- Posts ---------------- */

export function PostCard({ p, compact = false, expanded = false }: { p: Post; compact?: boolean; expanded?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-[22px] bg-white text-ink shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] ring-1 ring-black/5 ${expanded ? 'w-[340px]' : compact ? 'w-[270px]' : 'w-[300px]'}`}>
      <div className="flex items-center gap-2.5 px-4 pb-2 pt-3.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white" style={{ background: `linear-gradient(135deg, ${p.art[0]}, ${p.art[1]})` }}>
          {p.author.split(' ').map((w) => w[0]).slice(0, 2).join('')}
        </span>
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-1 text-[12.5px] font-semibold">{p.author}<BadgeCheck size={13} className="text-[#4F8F6D]" /></div>
          <div className="text-[11px] text-black/45">{p.role} · {p.time}</div>
        </div>
      </div>
      <div className="px-4">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-black/45">{p.kicker}</div>
        <div className="mt-0.5 text-[14.5px] font-semibold leading-snug tracking-[-0.01em]" style={{ textWrap: 'balance' }}>{p.head}</div>
        {!compact && <p className="mt-1 text-[12px] leading-relaxed text-black/60">{p.body}</p>}
      </div>
      {p.img && !compact && <img src={p.img} alt="" className={`mt-3 w-full object-cover ${expanded ? 'h-[170px]' : 'h-[110px]'}`} />}
      <div className="flex items-center gap-4 px-4 py-3 text-[11.5px] text-black/55">
        <span className="inline-flex items-center gap-1"><Heart size={13} /> {p.likes}</span>
        <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {p.comments}</span>
        <span className="ml-auto rounded-full bg-lime px-2.5 py-1 text-[10.5px] font-semibold text-ink">Help out</span>
      </div>
    </div>
  )
}

function NoiseOverlay({ sub }: { sub: number }) {
  const shown = Math.min(GROUP_NOISE.length, Math.floor((sub / 0.45) * GROUP_NOISE.length))
  const calm = sub > 0.48
  const feed = sub > 0.72
  const spots = [
    [6, -12], [10, -9.4], [5.8, -6.6], [10.4, -3.8], [6.2, -1], [9.4, 1.8], [5.6, 4.6], [10.2, 7.2], [6, 9.8], [9.2, 12.4], [-5, -14.6], [0.5, 15.2],
  ]
  return (
    <Layer>
      <AnimatePresence>
        {!calm && (
          <At x={5.8} y={-15.2} key="hdr">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, filter: 'blur(8px)' }} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-bone/70 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" /> Society Group · <span className="tabular-nums">{120 + shown * 61}</span> unread
            </motion.div>
          </At>
        )}
        {!calm && GROUP_NOISE.slice(0, shown).map((t, i) => (
          <At key={t + i} x={spots[i][0]} y={spots[i][1]}>
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 0.9 - (shown - i) * 0.04, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.6, delay: i * 0.02 } }}
              transition={{ duration: 0.5, ease }}
              className={`max-w-[210px] rounded-2xl px-3 py-2 text-[12px] leading-snug shadow-lg ${i % 3 === 1 ? 'rounded-tr-sm bg-[#2c3a2a] text-[#dfe9d6]' : 'rounded-tl-sm bg-[#242320] text-bone/80'}`}
            >
              {t}
              <span className="ml-2 text-[9.5px] text-bone/35">{`9:${String(10 + i * 3).padStart(2, '0')}`}</span>
            </motion.div>
          </At>
        ))}
      </AnimatePresence>
      <LayoutGroup>
        {calm && POSTS.slice(0, 3).map((p, i) => (
          <motion.div
            key={p.id}
            layout
            className="absolute"
            initial={{ opacity: 0, y: 60, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ ...spring, delay: feed ? 0 : i * 0.25 }}
            style={feed
              ? { left: '5.8em', top: `${-9 + i * 6}em`, zIndex: 3 - i }
              : { left: `${5.4 + i * 0.9}em`, top: `${-3 - i * 1.1}em`, zIndex: 3 - i, scale: 1 - i * 0.06, opacity: 1 - i * 0.2 }}
          >
            <div className="text-[13px]"><PostCard p={p} compact /></div>
          </motion.div>
        ))}
      </LayoutGroup>
    </Layer>
  )
}

function PostsOverlay({ sub }: { sub: number }) {
  const focus = sub > 0.5
  return (
    <Layer>
      <LayoutGroup>
        {POSTS.map((p, i) => {
          const isHero = p.id === 'd1'
          if (focus && !isHero) {
            return (
              <motion.div key={p.id} className="absolute" animate={{ opacity: 0.18, filter: 'blur(6px)', scale: 0.85 }} transition={{ duration: 0.9, ease }}
                style={{ left: L(-1, 3 + i * 0.8, 270), top: `${-9 + i * 4.8}em` }}>
                <div className="text-[13px]"><PostCard p={p} compact /></div>
              </motion.div>
            )
          }
          return (
            <motion.div
              key={p.id}
              layout
              className="absolute"
              initial={{ opacity: 0, x: 60, rotateY: -20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, rotateY: 0, filter: 'blur(0px)' }}
              transition={{ ...spring, delay: i * 0.12 }}
              style={focus ? { left: L(-1, 2, 340), top: '-7.5em', zIndex: 10 } : { left: L(-1, 3 + (i % 2) * 1.4, 270), top: `${-10.5 + i * 4.9}em`, zIndex: 4 - i }}
            >
              <div className="text-[13px]"><PostCard p={p} compact={!focus} expanded={focus} /></div>
            </motion.div>
          )
        })}
      </LayoutGroup>
    </Layer>
  )
}

/* ---------------- Alerts ---------------- */

const sevStyle = { high: 'bg-[#ff6b4a] text-white', med: 'bg-saffron text-ink', low: 'bg-lime text-ink' } as const
const alertIcon = { a1: Zap, a2: Droplets, a3: CheckCircle2 } as const

function AlertsOverlay({ sub }: { sub: number }) {
  const count = sub < 0.08 ? 0 : sub < 0.2 ? 1 : sub < 0.32 ? 2 : 3
  const organised = sub > 0.55
  const last = useRef(0)
  useEffect(() => {
    if (count > last.current) audio.sfx('notify')
    last.current = count
  }, [count])
  return (
    <Layer>
      <LayoutGroup>
        {!organised && ALERTS.slice(0, count).map((a, i) => {
          const Icon = alertIcon[a.id]
          return (
            <motion.div
              key={a.id}
              layoutId={`alert-${a.id}`}
              className="absolute"
              style={{ left: `${2.6 + i * 0.6}em`, top: `${-9 + i * 3.4}em`, zIndex: 10 - i }}
              initial={{ opacity: 0, y: -40, scale: 0.92, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={spring}
            >
              <div className="flex w-[290px] gap-3 rounded-[20px] border border-white/10 bg-[#1d1c1a]/85 p-3.5 text-[13px] text-bone shadow-2xl backdrop-blur-xl">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime text-ink"><Icon size={17} /></span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-bone/50">MOHOLLA · Alert nearby <span className="ml-auto">{a.time}</span></div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-[12px] leading-snug text-bone/60">{a.body}</div>
                </div>
              </div>
            </motion.div>
          )
        })}
        {organised && (
          <motion.div className="absolute" style={{ left: '1.6em', top: '-7.5em' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="w-[340px] rounded-[24px] bg-white p-4 text-[13px] text-ink shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
              <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold"><BellRing size={17} /> Alerts near you</div>
              <div className="flex flex-col gap-2">
                {ALERTS.map((a) => {
                  const Icon = alertIcon[a.id]
                  return (
                    <motion.div key={a.id} layoutId={`alert-${a.id}`} transition={spring} className="flex gap-3 rounded-2xl bg-[#f4f3ef] p-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white"><Icon size={15} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold">{a.title}</span>
                          <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sevStyle[a.sev]}`}>{a.status}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-black/50">{a.time} · {a.confirms} neighbours confirmed</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </LayoutGroup>
    </Layer>
  )
}

/* ---------------- Events ---------------- */

function EventsOverlay({ sub }: { sub: number }) {
  const open = sub > 0.52
  const hero = EVENTS[2]
  return (
    <Layer>
      <LayoutGroup>
        {!open && EVENTS.map((e, i) => (
          <motion.div
            key={e.id}
            layoutId={`ev-${e.id}`}
            className="absolute"
            style={{ left: i % 2 === 0 ? 'calc(-2.4em - 170px)' : 'calc(-2.4em - 354px)', top: `${-7 + Math.floor(i / 2) * 5.6}em`, transformPerspective: 800 }}
            initial={{ opacity: 0, rotateX: -80, y: -20 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ ...spring, delay: i * 0.14 }}
          >
            <div className="w-[170px] overflow-hidden rounded-[20px] bg-white text-[13px] text-ink shadow-2xl">
              <div className="flex items-end justify-between px-3.5 pb-2 pt-3" style={{ background: `linear-gradient(135deg, ${e.art[0]}, ${e.art[1]})` }}>
                <span className="font-display text-[34px] leading-none text-white">{e.day}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">{e.mon}</span>
              </div>
              <div className="px-3.5 py-2.5">
                <div className="truncate font-semibold">{e.title}</div>
                <div className="text-[11px] text-black/50">{e.time} · {e.going} going</div>
              </div>
            </div>
          </motion.div>
        ))}
        {open && (
          <motion.div layoutId={`ev-${hero.id}`} className="absolute" style={{ left: L(-1, 2, 330), top: '-8em', zIndex: 5 }} transition={spring}>
            <div className="w-[330px] overflow-hidden rounded-[24px] bg-white text-[13px] text-ink shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
              <div className="flex items-end justify-between px-5 pb-4 pt-5" style={{ background: `linear-gradient(135deg, ${hero.art[0]}, ${hero.art[1]})` }}>
                <div className="text-white">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75">Event · {hero.host}</div>
                  <div className="mt-1 text-[20px] font-semibold leading-tight">{hero.title}</div>
                </div>
                <div className="text-right text-white">
                  <div className="font-display text-[46px] leading-none">{hero.day}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75">{hero.mon}</div>
                </div>
              </div>
              <motion.div className="flex flex-col gap-2.5 px-5 py-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}>
                <div className="flex items-center gap-2 text-black/65"><Clock size={14} /> {hero.time}</div>
                <div className="flex items-center gap-2 text-black/65"><MapPin size={14} /> {hero.place}</div>
                <div className="flex items-center gap-2 text-black/65"><ShieldCheck size={14} /> Hosted by {hero.host}</div>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['#E97C4B', '#4F8F6D', '#8B7BB5', '#C9963F'].map((c) => <span key={c} className="h-7 w-7 rounded-full ring-2 ring-white" style={{ background: c }} />)}
                  </div>
                  <span className="text-[12px] text-black/60"><b className="text-ink">{hero.going}</b> neighbours going</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-lime px-3 py-1.5 text-[11.5px] font-semibold"><CalendarDays size={13} /> Going</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </LayoutGroup>
    </Layer>
  )
}

/* ---------------- Society ---------------- */

function SocietyOverlay({ sub }: { sub: number }) {
  const step = sub < 0.15 ? 0 : sub < 0.4 ? 1 : sub < 0.62 ? 2 : 3
  return (
    <Layer>
      {step >= 1 && (
        <At x={2} y={-10} z={3}>
          <motion.div initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} transition={spring}
            className="w-[300px] rounded-[24px] bg-white p-4 text-ink shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lime text-[15px] font-bold">A</span>
              <div className="leading-tight">
                <div className="text-[14px] font-semibold">{SOCIETY.name}</div>
                <div className="text-[11.5px] text-black/50">{SOCIETY.area} · {SOCIETY.members} members</div>
              </div>
            </div>
            <div className="mt-3 flex flex-col divide-y divide-black/5">
              {SOCIETY.roster.map((r) => (
                <div key={r.name} className="flex items-center gap-2.5 py-2 text-[12.5px]">
                  <Users size={14} className="text-black/40" /> {r.name}
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${r.role === 'secretary' ? 'bg-ink text-lime' : 'bg-black/5 text-black/60'}`}>{r.role}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </At>
      )}
      {step >= 2 && (
        <At x={3.2} y={1.4} z={4}>
          <motion.div initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={spring}
            className="w-[290px] rounded-[20px] border border-[#ff6b4a]/30 bg-[#1d1c1a]/90 p-3.5 text-bone shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#ff8a6e]"><TriangleAlert size={13} /> Society alert · {SOCIETY.alert.time}</div>
            <div className="mt-1 text-[14px] font-semibold">{SOCIETY.alert.head}</div>
            <div className="text-[12px] text-bone/60">{SOCIETY.alert.body}</div>
          </motion.div>
        </At>
      )}
      {step >= 3 && (
        <At x={4.4} y={6.8} z={5}>
          <motion.div initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={spring}
            className="w-[270px] rounded-[20px] bg-white p-3.5 text-ink shadow-2xl">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-black/45">Inside our gates · {SOCIETY.post.author}</div>
            <div className="mt-0.5 text-[14px] font-semibold">{SOCIETY.post.head}</div>
            <div className="text-[12px] text-black/55">{SOCIETY.post.body}</div>
          </motion.div>
        </At>
      )}
    </Layer>
  )
}

/* ---------------- Mesh ---------------- */

function MeshOverlay() {
  const nodes = [
    [-15, -8], [-19, 3], [-11, 11], [12, -11], [17, -2], [14, 9], [-6, -16], [4, 16],
  ]
  return (
    <Layer>
      <motion.svg
        className="absolute overflow-visible"
        style={{ left: '-24em', top: '-20em', width: '48em', height: '40em' }}
        viewBox="-24 -20 48 40"
        initial={{ opacity: 0, scale: 1.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease }}
      >
        {nodes.map(([x, y], i) => {
          const [nx, ny] = nodes[(i + 3) % nodes.length]
          return (
            <g key={i}>
              <motion.line x1={0} y1={0} x2={x} y2={y} stroke="#D4F56B" strokeOpacity={0.35} strokeWidth={0.06} strokeDasharray="0.3 0.35"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.3 + i * 0.12, ease }} />
              <motion.line x1={x} y1={y} x2={nx} y2={ny} stroke="#F2A65A" strokeOpacity={0.18} strokeWidth={0.05}
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 1 + i * 0.1, ease }} />
              <motion.circle r={0.18} fill="#D4F56B"
                initial={{ cx: 0, cy: 0, opacity: 0 }}
                animate={{ cx: [0, x], cy: [0, y], opacity: [0, 1, 0] }}
                transition={{ duration: 2.4, delay: 1.5 + i * 0.3, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }} />
              <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.5 + i * 0.12 }} style={{ originX: `${x}px`, originY: `${y}px` }}>
                <rect x={x - 0.55} y={y - 1} width={1.1} height={2} rx={0.25} fill="#121110" stroke="#D4F56B" strokeOpacity={0.7} strokeWidth={0.06} />
                <circle cx={x} cy={y - 0.1} r={0.12} fill="#D4F56B" />
              </motion.g>
            </g>
          )
        })}
      </motion.svg>
      <At x={9} y={12.5}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="whitespace-nowrap text-[11px] uppercase tracking-[0.16em] text-lime/70">
          up to 7 hops · no internet · end-to-end encrypted
        </motion.div>
      </At>
    </Layer>
  )
}

/* ---------------- Spiritual ---------------- */

function SpiritualOverlay() {
  return (
    <Layer>
      <At x={3} y={-4}>
        <motion.div initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 2.2, ease }}
          className="w-[300px] rounded-[24px] border border-saffron/20 bg-[#1b1512]/80 p-5 text-bone backdrop-blur-xl">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-saffron">Thursday · Vishnu Morning Verse</div>
          <p className="mt-3 font-display text-[19px] leading-[1.45] text-bone/90">शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ।<br />विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ॥</p>
          <p className="mt-2 text-[12px] text-bone/50">ॐ नमो भगवते वासुदेवाय ।</p>
        </motion.div>
      </At>
    </Layer>
  )
}

/* ---------------- Yoga ---------------- */

function YogaOverlay() {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const seq = [4000, 2000, 6000]
    let i = 0
    let t: number
    const run = () => { t = window.setTimeout(() => { i = (i + 1) % 3; setPhase(i); run() }, seq[i]) }
    run()
    return () => clearTimeout(t)
  }, [])
  const scale = phase === 2 ? 0.92 : 1.12
  const dur = [4, 2, 6][phase]
  return (
    <Layer>
      {[0, 1, 2].map((r) => (
        <motion.div key={r} className="absolute rounded-full border border-lime/20"
          style={{ left: `${-(9 + r * 3)}em`, top: `${-(9 + r * 3)}em`, width: `${(9 + r * 3) * 2}em`, height: `${(9 + r * 3) * 2}em` }}
          animate={{ scale, opacity: phase === 2 ? 0.25 : 0.7 - r * 0.15 }}
          transition={{ duration: dur, ease: 'easeInOut' }} />
      ))}
      <At x={-3.5} y={13.5}>
        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.8 }}
            className="w-[7em] whitespace-nowrap text-center text-[12px] uppercase tracking-[0.22em] text-lime/80">
            {['Breathe in', 'Hold', 'Breathe out'][phase]}
          </motion.div>
        </AnimatePresence>
      </At>
      <At x={L(-1, 13, 220)} y={-3}>
        <div className="flex w-[220px] flex-wrap gap-1.5">
          {POSES.map((p, i) => (
            <motion.span key={p} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.8 }}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-bone/70">{p}</motion.span>
          ))}
        </div>
      </At>
    </Layer>
  )
}

/* ---------------- Geeta ---------------- */

function GeetaOverlay({ sub }: { sub: number }) {
  return (
    <Layer>
      <AnimatePresence>
        {sub > 0.45 && (
          <At x={3.4} y={1} key="v">
            <motion.div initial={{ opacity: 0, x: 30, filter: 'blur(12px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 1.8, ease }}
              className="w-[280px] rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-bone backdrop-blur-xl">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-lime/80">Verse of the day · {VERSE.ref}</div>
              <p className="mt-3 font-display text-[18px] leading-[1.5] text-bone/90">{VERSE.sa[0]}<br />{VERSE.sa[1]}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-bone/60">{VERSE.en}</p>
            </motion.div>
          </At>
        )}
      </AnimatePresence>
    </Layer>
  )
}

export function Overlay({ id, sub }: { id: string; sub: number }) {
  useOnce(id === 'mesh', () => audio.sfx('transition'))
  return (
    <AnimatePresence mode="wait">
      <motion.div key={id} className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.6 }}>
        {id === 'noise' && <NoiseOverlay sub={sub} />}
        {id === 'posts' && <PostsOverlay sub={sub} />}
        {id === 'alerts' && <AlertsOverlay sub={sub} />}
        {id === 'events' && <EventsOverlay sub={sub} />}
        {id === 'society' && <SocietyOverlay sub={sub} />}
        {id === 'mesh' && <MeshOverlay />}
        {id === 'spiritual' && <SpiritualOverlay />}
        {id === 'yoga' && <YogaOverlay />}
        {id === 'geeta' && <GeetaOverlay sub={sub} />}
      </motion.div>
    </AnimatePresence>
  )
}

