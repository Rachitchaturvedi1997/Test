// Prints the current Google Authenticator code for the demo account.
// Usage: npm run totp            (uses the demo secret)
//        npm run totp -- SECRET  (any base32 secret)
import { createHmac } from 'node:crypto'

const secret = process.argv[2] || 'KZXW6YTBNRSWG3DFOJUGC3TU'
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
let bits = 0, value = 0
const bytes = []
for (const ch of secret.toUpperCase().replace(/=+$/, '')) {
  value = (value << 5) | B32.indexOf(ch)
  bits += 5
  if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 0xff); bits -= 8 }
}
const counter = Math.floor(Date.now() / 30000)
const msg = Buffer.alloc(8)
msg.writeBigUInt64BE(BigInt(counter))
const h = createHmac('sha1', Buffer.from(bytes)).update(msg).digest()
const o = h[19] & 0xf
const code = (((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 1e6
console.log(String(code).padStart(6, '0'), `(valid ~${30 - (Math.floor(Date.now() / 1000) % 30)}s)`)
