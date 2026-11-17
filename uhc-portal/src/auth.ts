export const DEMO_USER = {
  username: 'sam@zuqo.ai',
  password: 'zuqo123',
  firstName: 'Sam',
  displayName: 'Sam Zuqo',
}

/**
 * Phone confirmation (call or text), like the real portal.
 * The code is "delivered" to the demo phone page (/demo-phone), which a person checks
 * and reads out — so this step needs a human, as in the reference document.
 * Codes change every 5 minutes; the previous code stays valid too.
 */
export const PHONE_SECRET = 'KVEEGRDFNVXVGZLDOJSXIMJS'
export const PHONE_STEP = 300
export const PHONE_NUMBER = '(559) 555-0148'
export const PHONE_MASKED = '(***) ***-0148'

const S_KEY = 'uhc.session'
type Stage = 'none' | 'password' | 'authenticated'
function safe<T>(fn: () => T, fallback: T): T {
  try { return fn() } catch { return fallback }
}
export const auth = {
  stage: (): Stage => safe(() => (sessionStorage.getItem(S_KEY) as Stage) || 'none', 'none'),
  setStage: (s: Stage) => safe(() => sessionStorage.setItem(S_KEY, s), undefined),
  logout: () => safe(() => sessionStorage.removeItem(S_KEY), undefined),
  userExists: (u: string) => u.trim().toLowerCase() === DEMO_USER.username,
  checkPassword: (u: string, p: string) => u.trim().toLowerCase() === DEMO_USER.username && p === DEMO_USER.password,
}
