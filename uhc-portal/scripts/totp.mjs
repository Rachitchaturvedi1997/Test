// Prints the current UHC phone-confirmation code (same code the /demo-phone page shows).
// Codes change every 5 minutes.
import { createHmac } from 'node:crypto'

const secret = process.argv[2] || 'KVEEGRDFNVXVGZLDOJSXIMJS'
const step = 300
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
let bits = 0, value = 0
const bytes = []
for (const ch of secret.toUpperCase().replace(/=+$/, '')) {
  value = (value << 5) | B32.indexOf(ch)
  bits += 5
  if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 0xff); bits -= 8 }
}
const counter = Math.floor(Date.now() / 1000 / step)
const msg = Buffer.alloc(8)
msg.writeBigUInt64BE(BigInt(counter))
const h = createHmac('sha1', Buffer.from(bytes)).update(msg).digest()
const o = h[19] & 0xf
const code = (((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 1e6
console.log(String(code).padStart(6, '0'), `(valid ~${step - (Math.floor(Date.now() / 1000) % step)}s, previous code also accepted)`)
