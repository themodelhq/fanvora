import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'

// Standalone admin login. Not linked from anywhere in the public UI; only
// reachable by direct URL (/admin/login). Has its own visual treatment
// (slate, restrained) so it's distinct from the marketing-coloured fan/
// creator login.
const AdminLogin = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, isAuthenticated } = useAdminStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated) return <Navigate to="/admin" replace />

  const submit = async (e) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-dark-card border border-dark-border mb-4">
            <Shield className="w-7 h-7 text-gray-300" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-1">Fanvora Admin</h1>
          <p className="text-sm text-gray-400">Restricted access. Authorised personnel only.</p>
        </div>

        <form onSubmit={submit} className="bg-dark-card rounded-2xl border border-dark-border p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Admin email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-12"
                placeholder="admin@fanvora.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-12 pr-12"
                placeholder="Password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-xs text-center text-gray-500 pt-2 border-t border-dark-border">
            All access is logged. Unauthorised access is prohibited and will be reported.
          </p>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
