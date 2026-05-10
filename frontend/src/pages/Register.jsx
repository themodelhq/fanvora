import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, Check } from 'lucide-react'
import { Logo } from '../components/Logo'

const Register = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'creator' ? 'creator' : 'fan'

  const { register, isLoading, error } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
    role: initialRole
  })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setLocalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setLocalError('Username can only contain letters, numbers, and underscores')
      return
    }

    const success = await register({
      email: formData.email,
      password: formData.password,
      username: formData.username,
      displayName: formData.displayName,
      role: formData.role
    })

    if (success) {
      navigate('/dashboard')
    }
  }

  const passwordRequirements = [
    { test: formData.password.length >= 6, text: 'At least 6 characters' },
    { test: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { test: /[0-9]/.test(formData.password), text: 'One number' }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Logo className="w-10 h-10" />
            <span className="font-heading text-3xl font-bold gradient-text">Fanvora</span>
          </Link>
          <h1 className="font-heading text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-400">Join Fanvora and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
          {(error || localError) && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error || localError}</span>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              I want to join as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'fan' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === 'fan'
                    ? 'border-primary bg-primary/20'
                    : 'border-dark-border hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold">Fan</div>
                <div className="text-xs text-gray-400 mt-1">Support creators</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'creator' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === 'creator'
                    ? 'border-primary bg-primary/20'
                    : 'border-dark-border hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-2">✨</div>
                <div className="font-semibold">Creator</div>
                <div className="text-xs text-gray-400 mt-1">Share content</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="johndoe"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-12"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-12 pr-12"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-3 space-y-1">
                {passwordRequirements.map((req, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs ${
                      req.test ? 'text-green-400' : 'text-gray-500'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    {req.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field pl-12"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-dark-card text-primary focus:ring-primary"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-400">
              I agree to the{' '}
              <Link to="/legal/terms" target="_blank" className="text-primary hover:text-primary-light">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/legal/privacy" target="_blank" className="text-primary hover:text-primary-light">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
