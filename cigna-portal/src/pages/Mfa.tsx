import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import Logo from '../components/Logo'
import { Shield } from '../components/Icons'
import { auth, otpauthUri, TOTP_SECRET } from '../auth'
import { secondsRemaining, verifyTotp } from '../totp'

export default function Mfa() {
  const nav = useNavigate()
  const [enrolled] = useState(auth.isEnrolled())
  const [qr, setQr] = useState('')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [secs, setSecs] = useState(secondsRemaining())
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (!enrolled) QRCode.toDataURL(otpauthUri(), { margin: 1, width: 360 }).then(setQr)
  }, [enrolled])
  useEffect(() => {
    const t = setInterval(() => setSecs(secondsRemaining()), 1000)
    return () => clearInterval(t)
  }, [])

  const stage = auth.stage()
  if (stage === 'authenticated') return <Navigate to="/app/dashboard" replace />
  if (stage !== 'password') return <Navigate to="/login" replace />

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyTotp(TOTP_SECRET, code)) {
      setErr('The code you entered is invalid or has expired. Please try again.')
      return
    }
    auth.setEnrolled(true)
    auth.setStage('authenticated')
    nav('/app/dashboard')
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div style={{ textAlign: 'center' }}>
          <Logo size={1.05} />
        </div>
        <form onSubmit={submit} noValidate>
          {enrolled ? (
            <>
              <h1>Verify Your Identity</h1>
              <p className="sub">
                Enter the 6-digit pass code from your <b>Google Authenticator</b> app to continue.
              </p>
            </>
          ) : (
            <>
              <h1>Secure Your Account</h1>
              <p className="sub">Set up two-step verification with Google Authenticator.</p>
              <ol className="steps">
                <li>Install <b>Google Authenticator</b> on your phone.</li>
                <li>Tap <b>+</b> → <b>Scan a QR code</b> and scan the code below.</li>
                <li>Enter the 6-digit pass code shown in the app.</li>
              </ol>
              <div className="qr-wrap">
                {qr ? <img src={qr} alt="Google Authenticator QR code" id="mfa-qr" /> : <div style={{ height: 180 }} />}
                <button type="button" className="link" onClick={() => setShowKey((s) => !s)}>
                  {showKey ? 'Hide setup key' : "Can't scan it? Enter a setup key"}
                </button>
                {showKey && (
                  <div className="secret" id="mfa-secret">
                    {TOTP_SECRET.match(/.{1,4}/g)!.join(' ')}
                  </div>
                )}
              </div>
            </>
          )}
          <div className={`field code-input ${err ? 'err' : ''}`}>
            <label htmlFor="passcode">Pass code*</label>
            <input
              id="passcode"
              name="passcode"
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
          </div>
          {err && <div className="err-text">{err}</div>}
          <button className="btn-primary btn-block" type="submit" id="mfa-continue" disabled={code.length !== 6}>
            <Shield /> {enrolled ? 'Continue' : 'Verify & Continue'}
          </button>
          <div className="timer">New code in {secs}s</div>
          <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', justifyContent: 'center', gap: 18 }}>
            <button type="button" className="link" onClick={() => { auth.logout(); nav('/login') }}>
              Back to login
            </button>
            {enrolled && (
              <button
                type="button"
                className="link"
                onClick={() => {
                  auth.setEnrolled(false)
                  window.location.reload()
                }}
              >
                Set up authenticator again
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
