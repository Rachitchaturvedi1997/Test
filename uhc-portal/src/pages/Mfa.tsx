import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import Logo from '../components/Logo'
import { Message, Phone, Shield } from '../components/Icons'
import { auth, otpauthUri, TOTP_SECRET } from '../auth'
import { secondsRemaining, verifyTotp } from '../totp'

type Method = 'app' | 'text' | 'call'

export default function Mfa() {
  const nav = useNavigate()
  const [step, setStep] = useState<'choose' | 'code'>('choose')
  const [method, setMethod] = useState<Method>('app')
  const [enrolled] = useState(auth.isEnrolled())
  const [qr, setQr] = useState('')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [secs, setSecs] = useState(secondsRemaining())
  const [showKey, setShowKey] = useState(false)
  useEffect(() => {
    if (!enrolled) QRCode.toDataURL(otpauthUri(), { margin: 1, width: 360 }).then(setQr)
    const t = setInterval(() => setSecs(secondsRemaining()), 1000)
    return () => clearInterval(t)
  }, [enrolled])

  const stage = auth.stage()
  if (stage === 'authenticated') return <Navigate to="/claims" replace />
  if (stage !== 'password') return <Navigate to="/login" replace />

  const verify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyTotp(TOTP_SECRET, code)) return setErr('That code is incorrect or expired. Try again.')
    auth.setEnrolled(true)
    auth.setStage('authenticated')
    nav('/claims')
  }
  const opts: { id: Method; icon: React.ReactNode; title: string; sub: string }[] = [
    { id: 'app', icon: <Shield />, title: 'Authenticator app', sub: 'Use a code from Google Authenticator' },
    { id: 'text', icon: <Message />, title: 'Text me', sub: 'Not available in the demo' },
    { id: 'call', icon: <Phone />, title: 'Call me', sub: 'Not available in the demo' },
  ]

  return (
    <div className="ohid">
      <div className="mfa-box">
        <Logo height={32} />
        <h2>Confirm your identity</h2>
        {step === 'choose' ? (
          <>
            <p className="muted">How would you like to receive your verification code?</p>
            {opts.map((o) => (
              <label key={o.id} className={`opt ${method === o.id ? 'on' : ''}`}>
                <input type="radio" name="m" checked={method === o.id} onChange={() => setMethod(o.id)} id={`opt-${o.id}`} />
                {o.icon}
                <span><b>{o.title}</b><br /><small>{o.sub}</small></span>
              </label>
            ))}
            {method !== 'app' && <div className="err">Text and call codes are disabled in this demo. Choose Authenticator app.</div>}
            <button className="btn-primary wide" disabled={method !== 'app'} onClick={() => setStep('code')} id="mfa-next">Continue</button>
          </>
        ) : (
          <form onSubmit={verify} noValidate>
            {!enrolled ? (
              <>
                <p className="muted">Scan this QR code with <b>Google Authenticator</b>, then enter the 6-digit code it shows.</p>
                <div className="qr">
                  {qr && <img src={qr} alt="Google Authenticator QR code" id="mfa-qr" />}
                  <button type="button" className="linkbtn" onClick={() => setShowKey((s) => !s)}>{showKey ? 'Hide setup key' : "Can't scan it? Enter a setup key"}</button>
                  {showKey && <code className="secret" id="mfa-secret">{TOTP_SECRET.match(/.{1,4}/g)!.join(' ')}</code>}
                </div>
              </>
            ) : (
              <p className="muted">Enter the 6-digit code from your <b>Google Authenticator</b> app.</p>
            )}
            <label htmlFor="passcode">Verification code</label>
            <input id="passcode" className="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setErr('') }} />
            {err && <div className="err" role="alert">{err}</div>}
            <button className="btn-primary wide" type="submit" disabled={code.length !== 6} id="mfa-verify">Verify</button>
            <p className="muted center small">New code in {secs}s</p>
          </form>
        )}
        <div className="center" style={{ marginTop: 12, display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button className="linkbtn" onClick={() => { auth.logout(); nav('/login') }}>Back to Sign In</button>
          {enrolled && step === 'code' && <button className="linkbtn" onClick={() => { auth.setEnrolled(false); window.location.reload() }}>Set up authenticator again</button>}
        </div>
      </div>
    </div>
  )
}
