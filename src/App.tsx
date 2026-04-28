import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { MergeStarsHeader } from './components/MergeStarsHeader'
import { RequireApplication } from './components/RequireApplication'
import { RequireTerms } from './components/RequireTerms'
import { RequireUser } from './components/RequireUser'
import { AnimatedOrbs } from './components/AnimatedLayout'
import { ApplicationPage } from './pages/ApplicationPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { RegisterPage } from './pages/RegisterPage'
import { SummaryPage } from './pages/SummaryPage'
import { TermsPage } from './pages/TermsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedOrbs />
      <div className="ms-bg-animated flex min-h-dvh flex-col">
        <MergeStarsHeader />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/terms"
              element={
                <RequireUser>
                  <TermsPage />
                </RequireUser>
              }
            />
            <Route
              path="/application"
              element={
                <RequireTerms>
                  <ApplicationPage />
                </RequireTerms>
              }
            />
            <Route
              path="/summary"
              element={
                <RequireTerms>
                  <SummaryPage />
                </RequireTerms>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireTerms>
                  <RequireApplication>
                    <DashboardPage />
                  </RequireApplication>
                </RequireTerms>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster position="top-center" theme="dark" richColors closeButton />
    </BrowserRouter>
  )
}
