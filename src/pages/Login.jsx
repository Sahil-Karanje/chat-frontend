import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(form)
      navigate('/chat')
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-surface-0 px-4 py-12">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(34,197,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-sm animate-fadeUp">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          </div>
          <span className="text-sm font-semibold font-mono text-gray-400 tracking-widest uppercase">
            Chapad Chapad
          </span>
        </div>

        <div className="bg-surface-1 border border-border rounded-2xl p-7">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold text-gray-100 mb-1">Welcome back</h1>
            <p className="text-muted text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide font-mono">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="input-base"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide font-mono">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-base"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/40 rounded-lg px-3 py-2.5 animate-fadeUp">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400 flex-shrink-0 mt-px">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-sm text-muted">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-accent hover:text-accent-dim font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
