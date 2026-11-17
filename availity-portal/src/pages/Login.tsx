import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { Check, Eye, Info } from '../components/Icons'
import { auth } from '../auth'

export default function Login() {
  const nav = useNavigate()
  const [user, setUser] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user.trim() || !pw) return setErr('Please enter your User ID and Password.')
    if (!auth.checkPassword(user, pw)) return setErr('The User ID or Password you entered is incorrect. Please try again.')
    setErr('')
    auth.setStage('password')
    nav('/mfa')
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="help-banner">
          <Info />
          <div>
            <b>Need help with 2-Step Authentication?</b>
            <br />
            Visit our <a href="#" onClick={(e) => e.preventDefault()}>2-Step Support and Information Hub</a> for resources and guidance.
          </div>
        </div>
        <div className="login-logo">
          <Logo height={44} />
        </div>
        <form className="signin-card" onSubmit={submit} noValidate>
          <h1>Sign In</h1>
          <label htmlFor="userId">User ID</label>
          <input id="userId" name="userId" autoComplete="username" autoFocus value={user} onChange={(e) => setUser(e.target.value)} />
          <label htmlFor="password">Password</label>
          <div className="pw-wrap">
            <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              <Eye off={show} />
            </button>
          </div>
          {err && <div className="err" role="alert">{err}</div>}
          <button className="btn-blue btn-wide" type="submit" id="signin">
            Sign In
          </button>
          <div className="forgot">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Use the demo credentials (see README).') }}>Forgot your user ID?</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Use the demo credentials (see README).') }}>Forgot your password?</a>
          </div>
        </form>
      </div>
      <div className="login-right">
        <h2>New to Availity?</h2>
        <h3>Create a free account and discover all the benefits of using Availity.</h3>
        <ul>
          <li><Check size={16} /> Free, real-time access to hundreds of payers</li>
          <li><Check size={16} /> Check eligibility, submit claims, collect patient payments and track ERAs</li>
          <li><Check size={16} /> Update your provider profiles</li>
          <li><Check size={16} /> Manage quality-of-care paperwork</li>
        </ul>
        <button className="btn-outline" onClick={() => alert('Registration is disabled in this demo.')}>
          Create a Free Account
        </button>
        <p className="demo-note">Demo environment · fictional data only</p>
      </div>
    </div>
  )
}
