import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { Eye, Finger } from '../components/Icons'
import { auth } from '../auth'

export default function Login() {
  const nav = useNavigate()
  const [step, setStep] = useState<'id' | 'pw'>('id')
  const [user, setUser] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')

  const next = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user.trim()) return setErr('Enter your One Healthcare ID or email address.')
    setErr('')
    setStep('pw')
  }
  const signIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pw) return setErr('Enter your password.')
    if (!auth.checkPassword(user, pw)) return setErr('The One Healthcare ID or password you entered is incorrect.')
    setErr('')
    auth.setStage('password')
    nav('/mfa')
  }

  return (
    <div className="ohid">
      <div className="ohid-inner">
        <div className="ohid-left">
          <Logo height={34} />
          <h1>Welcome to One Healthcare ID</h1>
          <div className="promo">
            <div>
              <b>Move from risky passwords to secure, passwordless authentication.</b>
              <p>A fast, flexible and reliable experience with one click.</p>
              <button onClick={() => alert('Passwordless setup is not available in the demo.')}>Get Started</button>
            </div>
            <span className="promo-ico"><Finger /></span>
          </div>
        </div>
        <div className="ohid-right">
          <div className="lang">🌐 English ▾</div>
          <div className="ohid-card">
            <h2>Sign In</h2>
            {step === 'id' ? (
              <form onSubmit={next} noValidate>
                <label htmlFor="username">One Healthcare ID or Email Address</label>
                <input id="username" autoFocus autoComplete="username" value={user} onChange={(e) => setUser(e.target.value)} />
                <a href="#" className="small-link" onClick={(e) => { e.preventDefault(); alert('Use the demo credentials (see README).') }}>Forgot One Healthcare ID?</a>
                {err && <div className="err">{err}</div>}
                <button className="btn-primary wide" type="submit" id="continue">Continue</button>
              </form>
            ) : (
              <form onSubmit={signIn} noValidate>
                <div className="who">
                  <span id="username-display">{user}</span>
                  <button type="button" className="linkbtn" onClick={() => { setStep('id'); setPw(''); setErr('') }}>Change</button>
                </div>
                <label htmlFor="password">Password</label>
                <div className="pw">
                  <input id="password" type={show ? 'text' : 'password'} autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}><Eye off={show} /></button>
                </div>
                <a href="#" className="small-link" onClick={(e) => { e.preventDefault(); alert('Use the demo credentials (see README).') }}>Forgot password?</a>
                {err && <div className="err">{err}</div>}
                <button className="btn-primary wide" type="submit" id="signin">Sign In</button>
              </form>
            )}
            <div className="or"><span>or</span></div>
            <button className="btn-outline wide" onClick={() => alert('Registration is disabled in this demo.')}>Create One Healthcare ID</button>
            <button className="btn-outline wide" onClick={() => alert('Not available in this demo.')}>Manage My One Healthcare ID</button>
            <p className="demo-note">Demo environment · fictional data only</p>
          </div>
        </div>
      </div>
    </div>
  )
}
