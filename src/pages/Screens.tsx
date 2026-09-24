import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { S } from '../data/content'
import { Phone } from '../components/Phone'

const GROUPS: { title: string; note: string; items: [string, string][] }[] = [
  { title: 'Every day', note: 'Home, local news and alerts for your area, in light or dark.', items: [['03_home', 'Home'], ['03b_home_news', 'News'], ['03c_home_alerts', 'Alerts'], ['04_home_dark', 'Home · dark'], ['20_liquid_shell', 'Glass tab bar']] },
  { title: 'Community', note: 'Chaupal for posts, Haat for buying and lending, messages, Baithak voice circles and the offline mesh.', items: [['05_explore', 'Explore'], ['07_chaupal', 'Chaupal'], ['08_haat', 'Haat'], ['14_messages', 'Messages'], ['15_baithak', 'Baithak'], ['16_call', 'Voice note'], ['13_offline_mesh', 'Offline mesh'], ['06_explore_amoled_saffron', 'AMOLED · saffron']] },
  { title: 'Your society', note: 'Join with your flat and society, then manage how Moholla looks and speaks to you.', items: [['02_onboarding_address', 'Where do you live?'], ['11_you', 'You'], ['12_appearance', 'Appearance']] },
  { title: 'Spiritual & yoga', note: 'Spiritual Corner, meditation, guided breath and a voice-led yoga coach.', items: [['09_spiritual', 'Spiritual Corner'], ['10_meditation', 'Meditation Corner'], ['23_meditation_player', 'Pranayama'], ['24_meditation_player_sleep', 'Yoga Nidra'], ['29_coach_today', 'Today'], ['30_coach_yoga', 'Poses'], ['33_pose_session', 'Pose session'], ['31_coach_breathe', '4-7-8 breathing'], ['32_coach_progress', 'Progress'], ['34_all_poses', 'All poses']] },
  { title: 'First open', note: 'The splash, the handwritten intro, the welcome and the tour.', items: [['22_intro_splash', 'Splash'], ['22_intro_handwriting', 'Intro'], ['26_welcome', 'Welcome'], ['27_tour', 'Tour'], ['27b_tour_page3', 'Tour · spiritual'], ['01_login', 'Sign in']] },
]

export function Screens() {
  const [open, setOpen] = useState<string | null>(null)
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-40 pt-32 sm:px-8">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-3xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-lime">Inside the app · v4.2.0</div>
        <h1 className="mt-4 font-display text-[clamp(44px,7vw,110px)] uppercase leading-[0.9] text-bone"><span className="italic text-bone/55">Every</span> screen.</h1>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-bone/60">Captured straight from Moholla for Android. Nothing here is a mock-up.</p>
      </motion.header>
      <div className="mt-20 flex flex-col gap-24">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-4">
              <h2 className="font-display text-[clamp(28px,3vw,44px)] text-bone">{g.title}</h2>
              <p className="max-w-md text-[14px] text-bone/50">{g.note}</p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
              {g.items.map(([f, label], i) => (
                <motion.button
                  key={f}
                  onClick={() => setOpen(f)}
                  className="group flex flex-col items-center gap-4 text-left focus-visible:outline-none"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.9, delay: (i % 5) * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div layoutId={`shot-${f}`} className="w-full max-w-[210px] transition-transform duration-500 group-hover:-translate-y-2 group-focus-visible:-translate-y-2">
                    <Phone src={S(f)} width="100%" glow={0.2} />
                  </motion.div>
                  <span className="text-[13px] text-bone/70 group-hover:text-bone">{label}</span>
                </motion.button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div layoutId={`shot-${open}`} className="w-[min(380px,78vw,42svh)]" transition={{ type: 'spring', stiffness: 160, damping: 24 }}>
              <Phone src={S(open)} width="100%" glow={0.7} />
            </motion.div>
            <button className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-bone" aria-label="Close" onClick={() => setOpen(null)}><X size={18} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
