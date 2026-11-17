import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { Message, Phone } from '../components/Icons'
import { auth, PHONE_MASKED, PHONE_SECRET, PHONE_STEP } from '../auth'
import { verifyTotp } from '../totp'

type Method = 'call' | 'text'

export default function Mfa() {
  const nav = useNavigate()
  const [step, setStep] = useState<'choose' | 'code'>('choose')
  const [method, setMethod] = useState<Method>('call')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [sentAt, setSentAt] = useState(0)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const stage = auth.stage()
  if (stage === 'authenticated') return <Navigate to="/claims" replace />
  if (stage !== 'password') return <Navigate to="/login" replace />

  const send = () => {
    setSentAt(Date.now())
    setStep('code')
    setCode('')
    setErr('')
  }
  const verify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyTotp(PHONE_SECRET, code, 1, PHONE_STEP)) return setErr('That code is incorrect or expired. Request a new code and try again.')
    auth.setStage('authenticated')
    nav('/claims')
  }
  const wait = Math.max(0, 30 - Math.floor((now - sentAt) / 1000))

  return (
    <div className="ohid">
      <div className="mfa-box">
        <Logo height={32} />
        <h2>Confirm your identity</h2>
        {step === 'choose' ? (
          <>
            <p className="muted">For your security, we need to confirm it's you. How would you like to receive your one-time code?</p>
            <label className={`opt ${method === 'call' ? 'on' : ''}`}>
              <input type="radio" name="m" checked={method === 'call'} onChange={() => setMethod('call')} id="opt-call" />
              <Phone />
              <span><b>Call me</b><br /><small>We'll call {PHONE_MASKED} and read you a code</small></span>
            </label>
            <label className={`opt ${method === 'text' ? 'on' : ''}`}>
              <input type="radio" name="m" checked={method === 'text'} onChange={() => setMethod('text')} id="opt-text" />
              <Message />
              <span><b>Text me</b><br /><small>We'll text a code to {PHONE_MASKED}</small></span>
            </label>
            <button className="btn-primary wide" onClick={send} id="mfa-send">{method === 'call' ? 'Call me' : 'Send text'}</button>
          </>
        ) : (
          <form onSubmit={verify} noValidate>
            <div className="sent" id="mfa-sent">
              {method === 'call' ? <>We're calling <b>{PHONE_MASKED}</b> now. Answer the call and enter the code you hear.</> : <>We sent a text message with a code to <b>{PHONE_MASKED}</b>.</>}
            </div>
            <label htmlFor="passcode">Enter code</label>
            <input id="passcode" className="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setErr('') }} />
            {err && <div className="err" role="alert">{err}</div>}
            <button className="btn-primary wide" type="submit" disabled={code.length !== 6} id="mfa-verify">Confirm</button>
            <p className="muted center small">
              Didn't get it?{' '}
              {wait > 0 ? <>You can request a new code in {wait}s</> : <button type="button" className="linkbtn" onClick={send} id="mfa-resend">{method === 'call' ? 'Call again' : 'Resend text'}</button>}
              {' · '}
              <button type="button" className="linkbtn" onClick={() => setStep('choose')}>Try another way</button>
            </p>
            <p className="muted center small">The code expires after 5 minutes.</p>
          </form>
        )}
        <div className="center" style={{ marginTop: 12 }}>
          <button className="linkbtn" onClick={() => { auth.logout(); nav('/login') }}>Back to Sign In</button>
        </div>
      </div>
    </div>
  )
}
