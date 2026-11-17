// RFC 6238 TOTP (SHA-1, 6 digits, 30s) — pure JS so it also works on plain http hosts.

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Decode(input: string): Uint8Array {
  const clean = input.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase()
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const ch of clean) {
    const idx = B32.indexOf(ch)
    if (idx < 0) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return new Uint8Array(out)
}

function rotl(n: number, s: number) {
  return (n << s) | (n >>> (32 - s))
}

function sha1(msg: Uint8Array): Uint8Array {
  const ml = msg.length
  const withPad = new Uint8Array(((ml + 9 + 63) >> 6) << 6)
  withPad.set(msg)
  withPad[ml] = 0x80
  const dv = new DataView(withPad.buffer)
  dv.setUint32(withPad.length - 4, (ml * 8) >>> 0)
  dv.setUint32(withPad.length - 8, Math.floor((ml * 8) / 2 ** 32))
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0
  const w = new Uint32Array(80)
  for (let off = 0; off < withPad.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4)
    for (let i = 16; i < 80; i++) w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1)
    let a = h0, b = h1, c = h2, d = h3, e = h4
    for (let i = 0; i < 80; i++) {
      let f: number, k: number
      if (i < 20) { f = (b & c) | (~b & d); k = 0x5a827999 }
      else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1 }
      else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc }
      else { f = b ^ c ^ d; k = 0xca62c1d6 }
      const t = (rotl(a, 5) + f + e + k + w[i]) >>> 0
      e = d; d = c; c = rotl(b, 30) >>> 0; b = a; a = t
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0
  }
  const out = new Uint8Array(20)
  const odv = new DataView(out.buffer)
  ;[h0, h1, h2, h3, h4].forEach((h, i) => odv.setUint32(i * 4, h))
  return out
}

function hmacSha1(key: Uint8Array, msg: Uint8Array): Uint8Array {
  let k = key.length > 64 ? sha1(key) : key
  const kp = new Uint8Array(64)
  kp.set(k)
  const ipad = new Uint8Array(64 + msg.length)
  const opad = new Uint8Array(64 + 20)
  for (let i = 0; i < 64; i++) {
    ipad[i] = kp[i] ^ 0x36
    opad[i] = kp[i] ^ 0x5c
  }
  ipad.set(msg, 64)
  opad.set(sha1(ipad), 64)
  return sha1(opad)
}

export function totp(secret: string, time = Date.now(), step = 30, digits = 6): string {
  const counter = Math.floor(time / 1000 / step)
  const msg = new Uint8Array(8)
  const dv = new DataView(msg.buffer)
  dv.setUint32(0, Math.floor(counter / 2 ** 32))
  dv.setUint32(4, counter >>> 0)
  const h = hmacSha1(base32Decode(secret), msg)
  const o = h[19] & 0xf
  const bin = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]
  return String(bin % 10 ** digits).padStart(digits, '0')
}

/** Accepts the current code plus one 30s step either side (clock drift). */
export function verifyTotp(secret: string, code: string, window = 1): boolean {
  const c = code.replace(/\s+/g, '')
  if (!/^\d{6}$/.test(c)) return false
  for (let i = -window; i <= window; i++) {
    if (totp(secret, Date.now() + i * 30000) === c) return true
  }
  return false
}

export function secondsRemaining(step = 30) {
  return step - (Math.floor(Date.now() / 1000) % step)
}
