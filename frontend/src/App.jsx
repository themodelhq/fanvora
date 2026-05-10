import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useAdminStore } from './store/adminStore'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreatorProfile from './pages/CreatorProfile'
import PostDetail from './pages/PostDetail'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import Terms from './pages/legal/Terms'
import Privacy from './pages/legal/Privacy'
import Cookies from './pages/legal/Cookies'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import { OfflineBanner, InstallBanner, UpdateBanner } from './components/PWABanners'
import { CookieConsent } from './components/CookieConsent'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" />
  return children
}

// Admin section is gated by a SEPARATE auth store. Unauthenticated visitors
// land on /admin/login instead of the public /login. The section is not
// linked from anywhere in the public UI.
function AdminRoute({ children }) {
  const { isAuthenticated, admin } = useAdminStore()
  // Both admin and owner roles can access the admin section. The owner role
  // is a strict superset; per-action permission checks happen on the server.
  const allowed = admin?.role === 'admin' || admin?.role === 'owner'
  if (!isAuthenticated || !allowed) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <UpdateBanner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/creator/:username" element={<CreatorProfile />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/cookies" element={<Cookies />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin section. Direct-URL only, not linked anywhere public. */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
      <InstallBanner />
      <CookieConsent />
    </BrowserRouter>
  )
}

export default App
