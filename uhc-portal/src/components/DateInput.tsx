import { useRef } from 'react'
import { Calendar } from './Icons'

export function normalizeDate(v: string): string | null {
  const s = v.trim()
  let m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (m) return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return `${m[2]}/${m[3]}/${m[1]}`
  m = s.match(/^(\d{2})(\d{2})(\d{4})$/)
  if (m) return `${m[1]}/${m[2]}/${m[3]}`
  return null
}

export default function DateInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const picker = useRef<HTMLInputElement>(null)
  const iso = (() => {
    const n = normalizeDate(value)
    if (!n) return ''
    const [mm, dd, yy] = n.split('/')
    return `${yy}-${mm}-${dd}`
  })()
  return (
    <div className="date-in">
      <input
        id={id}
        name={id}
        placeholder="MM/DD/YYYY"
        value={value}
        onChange={(e) => {
          let v = e.target.value.replace(/[^\d/]/g, '')
          if (/^\d{3,}$/.test(v)) v = v.replace(/^(\d{2})(\d{0,2})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join('/'))
          onChange(v.slice(0, 10))
        }}
      />
      <button type="button" aria-label="Open calendar" onClick={() => picker.current?.showPicker?.()}>
        <Calendar />
      </button>
      <input
        ref={picker}
        type="date"
        tabIndex={-1}
        value={iso}
        onChange={(e) => {
          const n = normalizeDate(e.target.value)
          if (n) onChange(n)
        }}
      />
    </div>
  )
}
