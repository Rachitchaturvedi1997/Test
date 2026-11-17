import { useEffect, useState } from 'react'
import { PHONE_NUMBER, PHONE_SECRET, PHONE_STEP } from '../auth'
import { totp } from '../totp'

// Stand-in for the account owner's phone. Not linked from the portal: the person who owns
// the phone opens it, then reads the code to whoever is logging in.
export default function DemoPhone() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const code = totp(PHONE_SECRET, now, PHONE_STEP)
  const left = PHONE_STEP - (Math.floor(now / 1000) % PHONE_STEP)
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
  return (
    <div className="phone-page">
      <div className="phone">
        <div className="phone-top">Demo phone · {PHONE_NUMBER}</div>
        <div className="bubble">
          <small>UHC One Healthcare ID · Text / Call</small>
          <p>Your One Healthcare ID verification code is</p>
          <div className="big-code" id="phone-code">{code.slice(0, 3)} {code.slice(3)}</div>
          <p>Do not share this code with anyone you don't trust.</p>
        </div>
        <div className="phone-foot">New code in {mm} (the previous code also stays valid)</div>
      </div>
      <p className="phone-note">Demo only. This page stands in for the account owner's phone.</p>
    </div>
  )
}
