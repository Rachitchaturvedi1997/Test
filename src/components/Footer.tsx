import { Wordmark } from './Logo'

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-night px-4 pb-36 pt-16 sm:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <Wordmark />
          <p className="max-w-sm text-[14px] leading-relaxed text-bone/50">Help, news, buy-sell, events and a quiet corner for the soul, all from the people on your street.</p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[14px] text-bone/70">
          <a href="#" className="hover:text-bone">The film</a>
          <a href="#screens" className="hover:text-bone">Inside the app</a>
          <a href="#story" className="hover:text-bone">Why Moholla</a>
        </nav>
        <div className="text-[12px] text-bone/40">Moholla 4.2.0 for Android · made for neighbours</div>
      </div>
    </footer>
  )
}
