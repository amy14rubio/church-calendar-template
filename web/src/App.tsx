import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { listenForForegroundMessages } from '@/lib/pushNotifications'
import { AuthProvider } from '@/contexts/AuthContext'
import { SiteEditModeProvider } from '@/contexts/SiteEditModeContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { StaffRoute } from '@/components/layout/StaffRoute'
import { MinistryAccessPromptModal } from '@/components/site/MinistryAccessPromptModal'
import { CalendarPage } from '@/pages/CalendarPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RoleManagementPage } from '@/pages/RoleManagementPage'

function App() {
  useEffect(() => {
    void listenForForegroundMessages()
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteEditModeProvider>
          <MinistryAccessPromptModal />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/calendario" element={<CalendarPage />} />
              <Route path="/" element={<Navigate to="/calendario" replace />} />
              <Route element={<Layout />}>
                <Route path="/iniciar-sesion" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/perfil" element={<ProfilePage />} />
                </Route>
                <Route element={<StaffRoute />}>
                  <Route path="/administracion" element={<RoleManagementPage />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </SiteEditModeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
