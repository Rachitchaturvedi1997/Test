import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { Eye } from '../components/Icons'
import { auth } from '../auth'

// Two-step universal-login style: username first, then "Enter your password".
export default function Login() {
  const nav = useNavigate()
  const [step, setStep] = useState<'user' | 'pass'>('user')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [forgot, setForgot] = useState(false)

  const submitUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return setErr('Please enter your username.')
    setErr('')
    setStep('pass')
  }
  const submitPass = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return setErr('Please enter your password.')
    if (!auth.checkPassword(username, password)) {
      setErr('Wrong username or password')
      return
    }
    setErr('')
    auth.setStage('password')
    nav('/mfa')
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div style={{ textAlign: 'center' }}>
          <Logo size={1.05} />
        </div>
        {step === 'user' ? (
          <form onSubmit={submitUser} noValidate>
            <h1>Log in</h1>
            <p className="sub">Log in to CignaforHCP to continue.</p>
            <div className={`field ${err ? 'err' : ''}`}>
              <label htmlFor="username">Username*</label>
              <input id="username" name="username" autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            {err && <div className="err-text">{err}</div>}
            <button className="btn-primary btn-block" type="submit" id="continue">
              Continue
            </button>
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <span className="link" style={{ fontWeight: 400, color: '#333' }}>
                Don't have an account?{' '}
              </span>
              <button type="button" className="link" onClick={() => alert('Registration is disabled in this demo.')}>
                Register
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitPass} noValidate>
            <h1>Enter your password</h1>
            <div className="readonly-user">
              <span id="username-display">{username}</span>
              <button type="button" onClick={() => { setStep('user'); setPassword(''); setErr('') }}>
                Edit
              </button>
            </div>
            <div className={`field ${err ? 'err' : ''}`}>
              <label htmlFor="password">Password*</label>
              <input
                id="password"
                name="password"
                type={show ? 'text' : 'password'}
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                <Eye off={show} />
              </button>
            </div>
            {err && <div className="err-text">{err}</div>}
            <button type="button" className="link" onClick={() => setForgot(true)}>
              Forgot Password?
            </button>
            {forgot && <div className="small-note">Password reset is disabled in this demo. Use the demo credentials.</div>}
            <button className="btn-primary btn-block" type="submit" id="login-continue">
              Continue
            </button>
          </form>
        )}
        <div className="demo-note">Demo environment · fictional data only</div>
      </div>
    </div>
  )
}
