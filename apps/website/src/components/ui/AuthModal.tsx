'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginUser, registerUser, SOCIAL_AUTH_URL } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface AuthModalProps {
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.023 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97H15.83c-1.491 0-1.956.932-1.956 1.889v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.096 24 18.1 24 12.073z" />
    </svg>
  )
}

export function AuthModal({ onClose, defaultTab = 'login' }: AuthModalProps) {
  const { setSession } = useAuth()
  const [tab, setTab]   = useState<'login' | 'register'>(defaultTab)
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm]     = useState({
    name: '', email: '', password: '', password_confirmation: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginUser(loginForm)
      setSession(res.data.token, res.data.user)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (regForm.password !== regForm.password_confirmation) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const res = await registerUser(regForm)
      setSession(res.data.token, res.data.user)
      onClose()
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const firstErr = apiErr?.response?.data?.errors
        ? Object.values(apiErr.response.data.errors)[0]?.[0]
        : null
      setError(firstErr ?? apiErr?.response?.data?.message ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSocial = (provider: 'google' | 'facebook') => {
    window.location.href = SOCIAL_AUTH_URL(provider)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-brand-section border border-gold-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="font-serif text-2xl text-white">
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-muted text-sm mt-0.5">
              {tab === 'login' ? 'Sign in to your EVOORION account' : 'Join EVOORION to save your favourites'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-muted hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 mb-5 rounded-lg bg-white/5 p-1 gap-1">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                tab === t
                  ? 'bg-gold text-brand font-semibold'
                  : 'text-muted hover:text-white'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocial('google')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-white/15 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <GoogleIcon />
              Google
            </button>
            <button
              onClick={() => handleSocial('facebook')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-white/15 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <FacebookIcon />
              Facebook
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-muted text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-sm text-muted mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gold text-brand font-semibold text-sm hover:bg-gold/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign In
              </button>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-sm text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={regForm.password}
                    onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min 8 characters"
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Confirm Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={regForm.password_confirmation}
                  onChange={(e) => setRegForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                  placeholder="Repeat password"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gold text-brand font-semibold text-sm hover:bg-gold/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
