import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { CatalogPage } from '@/pages/catalog/CatalogPage'
import { EquipmentDetailPage } from '@/pages/catalog/EquipmentDetailPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-bookings"
                element={
                  <ProtectedRoute>
                    <div className="p-8">My Bookings - Coming Soon</div>
                  </ProtectedRoute>
                }
              />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="equipment/:id" element={<EquipmentDetailPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App