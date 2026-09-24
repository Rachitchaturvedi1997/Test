import { useEffect, useState, useSyncExternalStore } from 'react'
import { audio } from '../audio/engine'

export function useMedia(query: string) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return m
}

// tiny global store for the sound toggle
let soundOn = false
const subs = new Set<() => void>()
export const sound = {
  get: () => soundOn,
  async set(v: boolean) {
    soundOn = v
    if (v) await audio.start()
    else audio.stop()
    subs.forEach((f) => f())
  },
  sub(f: () => void) {
    subs.add(f)
    return () => { subs.delete(f) }
  },
}
export function useSound() {
  return useSyncExternalStore(sound.sub, sound.get, sound.get)
}
