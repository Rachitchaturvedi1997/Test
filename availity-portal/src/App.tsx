import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { auth } from './auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Mfa from './pages/Mfa'
import Home from './pages/Home'
import ClaimStatus from './pages/ClaimStatus'
import ClaimDetail from './pages/ClaimDetail'
import RemittanceViewer from './pages/RemittanceViewer'
import InfoPage from './pages/InfoPage'

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
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/home" element={<Home />} />
          <Route path="/claim-status" element={<ClaimStatus />} />
          <Route path="/claim-status/detail/:claimNumber" element={<ClaimDetail />} />
          <Route path="/remittance-viewer" element={<RemittanceViewer />} />
          <Route path="/info/:slug" element={<InfoPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
