export const DEMO_USER = {
  username: 'sam@zuqo.ai',
  password: 'zuqo123',
  displayName: 'Sam Zuqo',
  firstName: 'Sam',
}

/** Fixed demo secret so automation can also generate codes (see README / npm run totp). */
export const TOTP_SECRET = 'KZXW6YTBNRSWG3DFOJUGC3TU'
export const TOTP_ISSUER = 'CignaforHCP Demo'
export const otpauthUri = () =>
  `otpauth://totp/${encodeURIComponent(TOTP_ISSUER)}:${encodeURIComponent(DEMO_USER.username)}?secret=${TOTP_SECRET}&issuer=${encodeURIComponent(TOTP_ISSUER)}&algorithm=SHA1&digits=6&period=30`

const S_KEY = 'hcp.session'
const ENROLL_KEY = 'hcp.mfaEnrolled'

type Stage = 'none' | 'password' | 'authenticated'

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn() } catch { return fallback }
}

export const auth = {
  stage(): Stage {
    return safe(() => (sessionStorage.getItem(S_KEY) as Stage) || 'none', 'none')
  },
  setStage(s: Stage) {
    safe(() => sessionStorage.setItem(S_KEY, s), undefined)
  },
  logout() {
    safe(() => sessionStorage.removeItem(S_KEY), undefined)
  },
  checkPassword(u: string, p: string) {
    return u.trim().toLowerCase() === DEMO_USER.username && p === DEMO_USER.password
  },
  userExists(u: string) {
    return u.trim().toLowerCase() === DEMO_USER.username
  },
  isEnrolled() {
    return safe(() => localStorage.getItem(ENROLL_KEY) === '1', false)
  },
  setEnrolled(v: boolean) {
    safe(() => (v ? localStorage.setItem(ENROLL_KEY, '1') : localStorage.removeItem(ENROLL_KEY)), undefined)
  },
}
