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
import { OwnerDashboardPage } from '@/pages/owner/OwnerDashboardPage'
import { AddEquipmentPage } from '@/pages/owner/AddEquipmentPage'
import { EditEquipmentPage } from '@/pages/owner/EditEquipmentPage'
import { CheckoutPage } from '@/pages/owner/CheckoutPage'
import { MyBookingsPage } from '@/pages/booking/MyBookingsPage'
import { NewBookingPage } from '@/pages/booking/NewBookingPage'
import { BookingDetailPage } from '@/pages/booking/BookingDetailPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminEquipmentPage } from '@/pages/admin/AdminEquipmentPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage'

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
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="booking/new"
                element={
                  <ProtectedRoute>
                    <NewBookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="booking/:id"
                element={
                  <ProtectedRoute>
                    <BookingDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="equipment/:id" element={<EquipmentDetailPage />} />
              <Route
                path="owner/dashboard"
                element={
                  <ProtectedRoute requiredRole="owner">
                    <OwnerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="owner/add-equipment"
                element={
                  <ProtectedRoute requiredRole="owner">
                    <AddEquipmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="owner/equipment/:id"
                element={
                  <ProtectedRoute requiredRole="owner">
                    <EditEquipmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="owner/checkout/:bookingId"
                element={
                  <ProtectedRoute requiredRole="owner">
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute requiredRole="system_owner">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/equipment"
                element={
                  <ProtectedRoute requiredRole="system_owner">
                    <AdminEquipmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute requiredRole="system_owner">
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/bookings"
                element={
                  <ProtectedRoute requiredRole="system_owner">
                    <AdminBookingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App