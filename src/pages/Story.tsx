import { motion } from 'framer-motion'

const ROWS: [string, string][] = [
  ['An announcement from the secretary sinks under forty good-mornings.', 'Alerts go straight to the people who need them, with a status that says when it is fixed.'],
  ['“Anyone has a plumber number?” gets asked every week.', 'Posts in Chaupal stay searchable, with the recommendations neighbours already gave.'],
  ['Event plans live across three polls and a forwarded image.', 'One event card with the date, the place, the host and who is going.'],
  ['The society roster is a spreadsheet only one person has.', 'Your society has its own space, members and a secretary everyone can see.'],
  ['When the network drops, the group goes quiet.', 'Offline mesh passes messages phone to phone over Bluetooth.'],
  ['Morning shlokas arrive as blurry forwards.', 'Spiritual Corner has the day’s aarti verse, live devotional radio and a Gita verse daily.'],
]

const LANGS = ['English', 'हिन्दी', 'বাংলা', 'తెలుగు', 'मराठी', 'தமிழ்', 'اردو', 'ગુજરાતી', 'ಕನ್ನಡ', 'ଓଡ଼ିଆ', 'മലയാളം', 'ਪੰਜਾਬੀ', 'অসমীয়া', 'मैथिली', 'संस्कृतम्', 'کٲشُر', 'नेपाली', 'कोंकणी', 'سنڌي', 'डोगरी', 'মৈতৈলোন্', 'बड़ो', 'ᱥᱟᱱᱛᱟᱲᱤ']

export function Story() {
  return (
    <main className="mx-auto max-w-[1180px] px-4 pb-40 pt-32 sm:px-8">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-4xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-lime">Why Moholla</div>
        <h1 className="mt-4 font-display text-[clamp(40px,6.4vw,100px)] leading-[0.95] text-bone" style={{ textWrap: 'balance' }}>
          <span className="italic text-bone/55">Why keep sending everything</span> to a society group?
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-bone/60">
          Group chats were built for friends, not for three hundred flats. Moholla gives the people who share your gate, your lift and your water tank a place of their own.
        </p>
      </motion.header>

      <section className="mt-24">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 md:grid-cols-2">
          <div className="bg-night p-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/40">In the group</div>
          <div className="hidden bg-night p-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-lime md:block">In Moholla</div>
          {ROWS.map(([a, b], i) => (
            <motion.div key={i} className="contents" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8 }}>
              <div className="bg-night p-6 text-[15px] leading-relaxed text-bone/45 line-through decoration-bone/20">{a}</div>
              <div className="bg-[#12110f] p-6 text-[15px] leading-relaxed text-bone/90">{b}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-28 grid gap-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="font-display text-[clamp(32px,4vw,60px)] leading-none text-bone">23 languages.</h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-bone/55">Every neighbour reads Moholla in the language they think in, from Kannada to Santali.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LANGS.map((l, i) => (
            <motion.span key={l} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03, duration: 0.6 }}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[15px] text-bone/80">{l}</motion.span>
          ))}
        </div>
      </section>
    </main>
  )
}
