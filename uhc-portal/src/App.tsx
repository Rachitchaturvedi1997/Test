import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { auth } from './auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Mfa from './pages/Mfa'
import Claims from './pages/Claims'
import Results from './pages/Results'
import Summary from './pages/Summary'
import InfoPage from './pages/InfoPage'
import DemoPhone from './pages/DemoPhone'

function RequireAuth({ children }: { children: ReactNode }) {
  const s = auth.stage()
  if (s === 'authenticated') return <>{children}</>
  if (s === 'password') return <Navigate to="/mfa" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mfa" element={<Mfa />} />
        <Route path="/demo-phone" element={<DemoPhone />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/claims" element={<Claims />} />
          <Route path="/claims/results" element={<Results />} />
          <Route path="/claims/summary/:claimNumber" element={<Summary />} />
          <Route path="/info/:slug" element={<InfoPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/claims" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
