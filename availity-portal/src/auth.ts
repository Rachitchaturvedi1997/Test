export const DEMO_USER = {
  username: 'sam@zuqo.ai',
  password: 'zuqo123',
  displayName: 'SAM ZUQO',
  firstName: 'Sam',
  email: 'sam@zuqo.ai',
  role: 'Biller/ Billing Specialist',
}

/** Fixed demo secret so automation can also generate codes (npm run totp). */
export const TOTP_SECRET = 'IFWGC2LMNF2HSRDFNVXUCMBS'
export const TOTP_ISSUER = 'Availity Demo'
export const otpauthUri = () =>
  `otpauth://totp/${encodeURIComponent(TOTP_ISSUER)}:${encodeURIComponent(DEMO_USER.username)}?secret=${TOTP_SECRET}&issuer=${encodeURIComponent(TOTP_ISSUER)}&algorithm=SHA1&digits=6&period=30`

const S_KEY = 'av.session'
const ENROLL_KEY = 'av.mfaEnrolled'
type Stage = 'none' | 'password' | 'authenticated'
function safe<T>(fn: () => T, fallback: T): T {
  try { return fn() } catch { return fallback }
}
export const auth = {
  stage: (): Stage => safe(() => (sessionStorage.getItem(S_KEY) as Stage) || 'none', 'none'),
  setStage: (s: Stage) => safe(() => sessionStorage.setItem(S_KEY, s), undefined),
  logout: () => safe(() => { sessionStorage.removeItem(S_KEY); sessionStorage.removeItem('av.lastSearch') }, undefined),
  checkPassword: (u: string, p: string) => u.trim().toLowerCase() === DEMO_USER.username && p === DEMO_USER.password,
  isEnrolled: () => safe(() => localStorage.getItem(ENROLL_KEY) === '1', false),
  setEnrolled: (v: boolean) => safe(() => (v ? localStorage.setItem(ENROLL_KEY, '1') : localStorage.removeItem(ENROLL_KEY)), undefined),
}
