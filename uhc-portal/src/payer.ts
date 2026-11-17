import { PAYERS } from './data'
const KEY = 'uhc.payer'
export const getPayer = () => {
  try { return PAYERS.find((p) => p.id === localStorage.getItem(KEY)) ?? PAYERS[0] } catch { return PAYERS[0] }
}
export const setPayer = (id: string) => { try { localStorage.setItem(KEY, id) } catch { /* ignore */ } }
