import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// HTTPS: uses these cert files when they exist (override with SSL_CERT / SSL_KEY env vars).
const certfile = process.env.SSL_CERT || '/var/www/html/SSL/star_zuqocrm_com_bundle.crt'
const keyfile = process.env.SSL_KEY || '/var/www/html/SSL/private.key'

function loadHttps() {
  if (!fs.existsSync(certfile) || !fs.existsSync(keyfile)) return undefined
  try {
    return { cert: fs.readFileSync(certfile), key: fs.readFileSync(keyfile) }
  } catch (e) {
    console.warn(`[ssl] cannot read cert/key (${(e as Error).message}); run with sudo. Falling back to http.`)
    return undefined
  }
}
const https = loadHttps()
if (https) console.log(`[ssl] HTTPS enabled with ${certfile}`)

export default defineConfig({
  plugins: [react()],
  server: { port: 5180, https, allowedHosts: true },
  preview: { port: 5180, https, allowedHosts: true },
})
