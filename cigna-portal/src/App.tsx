import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { auth } from './auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Mfa from './pages/Mfa'
import Dashboard from './pages/Dashboard'
import ClaimSearch from './pages/ClaimSearch'
import ClaimDetail from './pages/ClaimDetail'
import RemittanceReports from './pages/RemittanceReports'
import PatientSearch from './pages/PatientSearch'
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
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mfa" element={<Mfa />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="claim/search" element={<ClaimSearch />} />
          <Route path="claim/detail/:claimNumber" element={<ClaimDetail />} />
          <Route path="reports/remittance" element={<RemittanceReports />} />
          <Route path="patient/search" element={<PatientSearch />} />
          <Route path="info/:slug" element={<InfoPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
