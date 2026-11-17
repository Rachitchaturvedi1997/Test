import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import Logo from '../components/Logo'
import { Phone, Shield } from '../components/Icons'
import { auth, otpauthUri, TOTP_SECRET } from '../auth'
import { secondsRemaining, verifyTotp } from '../totp'

export default function Mfa() {
  const nav = useNavigate()
  const [step, setStep] = useState<'choose' | 'code'>('choose')
  const [method, setMethod] = useState<'app' | 'sms'>('app')
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
  if (stage === 'authenticated') return <Navigate to="/home" replace />
  if (stage !== 'password') return <Navigate to="/login" replace />

  const verify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyTotp(TOTP_SECRET, code)) return setErr('The code you entered is not valid. Please try again.')
    auth.setEnrolled(true)
    auth.setStage('authenticated')
    nav('/home')
  }

  return (
    <div className="mfa-page">
      <div className="mfa-card">
        <Logo height={40} />
        <h1>2-Step Authentication</h1>
        {step === 'choose' ? (
          <>
            <p className="muted">Choose how you would like to verify your identity.</p>
            <label className={`opt ${method === 'app' ? 'on' : ''}`}>
              <input type="radio" name="method" checked={method === 'app'} onChange={() => setMethod('app')} id="opt-app" />
              <Shield size={22} />
              <span>
                <b>Use an authenticator app</b>
                <br />
                <small>Enter a code from Google Authenticator</small>
              </span>
            </label>
            <label className={`opt ${method === 'sms' ? 'on' : ''}`}>
              <input type="radio" name="method" checked={method === 'sms'} onChange={() => setMethod('sms')} id="opt-sms" />
              <Phone size={22} />
              <span>
                <b>Text message or voice call</b>
                <br />
                <small>Not available in the demo environment</small>
              </span>
            </label>
            {method === 'sms' && <div className="err">Text/voice codes are disabled in this demo. Please use the authenticator app option.</div>}
            <button className="btn-blue btn-wide" disabled={method !== 'app'} onClick={() => setStep('code')} id="mfa-next">
              Continue
            </button>
          </>
        ) : (
          <form onSubmit={verify} noValidate>
            {!enrolled ? (
              <>
                <p className="muted">Scan this QR code with <b>Google Authenticator</b> (tap + → Scan a QR code), then enter the 6-digit code.</p>
                <div className="qr">
                  {qr && <img src={qr} alt="Google Authenticator QR code" id="mfa-qr" />}
                  <button type="button" className="linkbtn" onClick={() => setShowKey((s) => !s)}>
                    {showKey ? 'Hide setup key' : "Can't scan it? Enter a setup key"}
                  </button>
                  {showKey && <code className="secret" id="mfa-secret">{TOTP_SECRET.match(/.{1,4}/g)!.join(' ')}</code>}
                </div>
              </>
            ) : (
              <p className="muted">Enter the 6-digit code from your <b>Google Authenticator</b> app.</p>
            )}
            <label htmlFor="passcode">Verification Code</label>
            <input
              id="passcode"
              className="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                setErr('')
              }}
            />
            {err && <div className="err" role="alert">{err}</div>}
            <button className="btn-blue btn-wide" type="submit" disabled={code.length !== 6} id="mfa-verify">
              Verify
            </button>
            <p className="muted center small">New code in {secs}s</p>
          </form>
        )}
        <div className="center" style={{ marginTop: 14, display: 'flex', gap: 18, justifyContent: 'center' }}>
          <button className="linkbtn" onClick={() => { auth.logout(); nav('/login') }}>Back to Sign In</button>
          {enrolled && step === 'code' && (
            <button className="linkbtn" onClick={() => { auth.setEnrolled(false); window.location.reload() }}>Set up authenticator again</button>
          )}
        </div>
      </div>
    </div>
  )
}
