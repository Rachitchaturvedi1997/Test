/**
 * A small generative soundtrack built with the Web Audio API, so the site needs
 * no audio files. Warm pad + felt-piano arpeggio + sub bass + restrained
 * percussion. `setIntensity` (0..1) opens the filter and adds layers, so the
 * music builds with the story and resolves at the end.
 */

type Sfx = 'click' | 'swipe' | 'notify' | 'transition' | 'impact'

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

// D major, warm voicings: Dmaj9 · Bm11 · Gmaj7(#11) · Asus4
const CHORDS = [
  { root: 38, notes: [62, 66, 69, 73, 76] },
  { root: 35, notes: [59, 62, 66, 69, 76] },
  { root: 31, notes: [59, 62, 66, 67, 73] },
  { root: 33, notes: [57, 62, 64, 69, 71] },
]

class Engine {
  ctx: AudioContext | null = null
  master!: GainNode
  music!: GainNode
  fx!: GainNode
  padFilter!: BiquadFilterNode
  reverb!: ConvolverNode
  intensity = 0.2
  target = 0.2
  timer: number | null = null
  nextTime = 0
  step = 0
  bpm = 84
  on = false
  padVoices: { osc: OscillatorNode[]; gain: GainNode }[] = []

  private init() {
    if (this.ctx) return
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 3
    this.master.connect(comp).connect(ctx.destination)

    this.reverb = ctx.createConvolver()
    this.reverb.buffer = this.impulse(3.8, 2.6)
    const wet = ctx.createGain()
    wet.gain.value = 0.42
    this.reverb.connect(wet).connect(this.master)

    this.music = ctx.createGain()
    this.music.gain.value = 0.8
    this.music.connect(this.master)
    this.music.connect(this.reverb)

    this.fx = ctx.createGain()
    this.fx.gain.value = 0.55
    this.fx.connect(this.master)
    this.fx.connect(this.reverb)

    this.padFilter = ctx.createBiquadFilter()
    this.padFilter.type = 'lowpass'
    this.padFilter.frequency.value = 700
    this.padFilter.Q.value = 0.6
    this.padFilter.connect(this.music)
  }

  private impulse(seconds: number, decay: number) {
    const ctx = this.ctx!
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
    return buf
  }

  private noise(seconds: number) {
    const ctx = this.ctx!
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    return src
  }

  async start() {
    this.init()
    const ctx = this.ctx!
    if (ctx.state === 'suspended') await ctx.resume()
    this.on = true
    const t = ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setValueAtTime(this.master.gain.value, t)
    this.master.gain.linearRampToValueAtTime(0.9, t + 2.5)
    if (this.timer == null) {
      this.nextTime = t + 0.1
      this.timer = window.setInterval(() => this.schedule(), 25)
    }
  }

  stop() {
    if (!this.ctx) return
    this.on = false
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setValueAtTime(this.master.gain.value, t)
    this.master.gain.linearRampToValueAtTime(0, t + 0.8)
    window.setTimeout(() => {
      if (!this.on && this.timer != null) {
        clearInterval(this.timer)
        this.timer = null
        this.padVoices.forEach((v) => v.osc.forEach((o) => o.stop()))
        this.padVoices = []
      }
    }, 900)
  }

  setIntensity(v: number) {
    this.target = Math.max(0, Math.min(1, v))
  }

  private schedule() {
    const ctx = this.ctx!
    // ease intensity toward target
    this.intensity += (this.target - this.intensity) * 0.02
    this.padFilter.frequency.setTargetAtTime(420 + this.intensity * 2600, ctx.currentTime, 0.4)
    const sixteenth = 60 / this.bpm / 4
    while (this.nextTime < ctx.currentTime + 0.12) {
      this.tick(this.step, this.nextTime, sixteenth)
      this.nextTime += sixteenth
      this.step++
    }
  }

  private tick(step: number, t: number, sx: number) {
    const bar = Math.floor(step / 16)
    const inBar = step % 16
    const chord = CHORDS[Math.floor(bar / 2) % CHORDS.length]
    const I = this.intensity

    // pad: new chord every two bars
    if (inBar === 0 && bar % 2 === 0) this.pad(chord.notes, t, sx * 32)

    // sub bass
    if (inBar === 0 || (I > 0.55 && inBar === 10)) this.bass(chord.root, t, inBar === 0 ? sx * 9 : sx * 5, 0.22 + I * 0.18)

    // felt piano arpeggio: density grows with intensity
    const pattern = I < 0.25 ? [0, 8] : I < 0.5 ? [0, 6, 10] : I < 0.8 ? [0, 3, 6, 10, 12] : [0, 2, 4, 6, 8, 10, 12, 14]
    if (pattern.includes(inBar)) {
      const n = chord.notes[(inBar / 2 + bar) % chord.notes.length] + (inBar % 4 === 2 && I > 0.6 ? 12 : 0)
      this.piano(n, t, 0.05 + (1 - I) * 0.03)
    }

    // restrained percussion
    if (I > 0.45 && (inBar === 0 || inBar === 8)) this.kick(t, 0.5 + I * 0.35)
    if (I > 0.72 && inBar % 4 === 2) this.hat(t, 0.05 + I * 0.04)
    if (I > 0.85 && inBar === 12) this.snap(t)
  }

  private pad(notes: number[], t: number, dur: number) {
    const ctx = this.ctx!
    notes.forEach((n, i) => {
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.028 - i * 0.003, t + 2.2)
      g.gain.setValueAtTime(0.028 - i * 0.003, t + dur - 1.5)
      g.gain.linearRampToValueAtTime(0, t + dur + 1.8)
      g.connect(this.padFilter)
      const oscs = [-7, 6].map((det) => {
        const o = ctx.createOscillator()
        o.type = 'sawtooth'
        o.frequency.value = midi(n)
        o.detune.value = det
        o.connect(g)
        o.start(t)
        o.stop(t + dur + 2)
        return o
      })
      const s = ctx.createOscillator()
      s.type = 'sine'
      s.frequency.value = midi(n - 12)
      s.connect(g)
      s.start(t)
      s.stop(t + dur + 2)
      oscs.push(s)
    })
  }

  private bass(n: number, t: number, dur: number, vol: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = midi(n)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.04)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    o.connect(g).connect(this.music)
    o.start(t)
    o.stop(t + dur + 0.1)
  }

  private piano(n: number, t: number, vol: number) {
    const ctx = this.ctx!
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.setValueAtTime(3200, t)
    f.frequency.exponentialRampToValueAtTime(600, t + 1.2)
    f.connect(this.music)
    ;[1, 2, 3].forEach((h, i) => {
      const o = ctx.createOscillator()
      o.type = i === 0 ? 'triangle' : 'sine'
      o.frequency.value = midi(n) * h
      const g = ctx.createGain()
      const v = vol / (h * h)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(v, t + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0008, t + 2.4 / h)
      o.connect(g).connect(f)
      o.start(t)
      o.stop(t + 2.6)
    })
  }

  private kick(t: number, vol: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.frequency.setValueAtTime(110, t)
    o.frequency.exponentialRampToValueAtTime(38, t + 0.28)
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol * 0.5, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
    o.connect(g).connect(this.music)
    o.start(t)
    o.stop(t + 0.5)
  }

  private hat(t: number, vol: number) {
    const ctx = this.ctx!
    const n = this.noise(0.08)
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 7000
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    n.connect(f).connect(g).connect(this.music)
    n.start(t)
  }

  private snap(t: number) {
    const ctx = this.ctx!
    const n = this.noise(0.2)
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 1800
    f.Q.value = 0.8
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.12, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    n.connect(f).connect(g).connect(this.music)
    n.start(t)
  }

  /** A final resolving chord, held long. */
  finale() {
    if (!this.ctx || !this.on) return
    const t = this.ctx.currentTime + 0.05
    this.target = 0.05
    ;[50, 57, 62, 66, 69, 74].forEach((n, i) => this.piano(n, t + i * 0.09, 0.07))
    this.bass(26, t, 6, 0.3)
  }

  sfx(kind: Sfx) {
    if (!this.ctx || !this.on) return
    const ctx = this.ctx
    const t = ctx.currentTime + 0.01
    if (kind === 'click') {
      const o = ctx.createOscillator()
      o.frequency.setValueAtTime(1800, t)
      o.frequency.exponentialRampToValueAtTime(900, t + 0.04)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.09, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
      o.connect(g).connect(this.fx)
      o.start(t)
      o.stop(t + 0.08)
    }
    if (kind === 'swipe' || kind === 'transition') {
      const long = kind === 'transition'
      const n = this.noise(long ? 1.4 : 0.5)
      const f = ctx.createBiquadFilter()
      f.type = 'bandpass'
      f.Q.value = 1.4
      f.frequency.setValueAtTime(long ? 300 : 900, t)
      f.frequency.exponentialRampToValueAtTime(long ? 2400 : 3800, t + (long ? 1.1 : 0.35))
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(long ? 0.1 : 0.06, t + (long ? 0.6 : 0.12))
      g.gain.linearRampToValueAtTime(0, t + (long ? 1.3 : 0.45))
      n.connect(f).connect(g).connect(this.fx)
      n.start(t)
    }
    if (kind === 'notify') {
      ;[88, 93].forEach((n, i) => {
        const o = ctx.createOscillator()
        o.type = 'sine'
        o.frequency.value = midi(n)
        const g = ctx.createGain()
        const s = t + i * 0.11
        g.gain.setValueAtTime(0, s)
        g.gain.linearRampToValueAtTime(0.06, s + 0.01)
        g.gain.exponentialRampToValueAtTime(0.001, s + 0.9)
        o.connect(g).connect(this.fx)
        o.start(s)
        o.stop(s + 1)
      })
    }
    if (kind === 'impact') {
      const o = ctx.createOscillator()
      o.frequency.setValueAtTime(70, t)
      o.frequency.exponentialRampToValueAtTime(30, t + 0.9)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.35, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2)
      o.connect(g).connect(this.fx)
      o.start(t)
      o.stop(t + 1.3)
      const n = this.noise(0.6)
      const f = ctx.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = 900
      const ng = ctx.createGain()
      ng.gain.setValueAtTime(0.08, t)
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
      n.connect(f).connect(ng).connect(this.fx)
      n.start(t)
    }
  }
}

export const audio = new Engine()
