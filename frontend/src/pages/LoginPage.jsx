import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api.js'
import { Shield, Lock, Eye, EyeOff, AlertTriangle, Timer } from 'lucide-react'

export default function LoginPage() {
  const navigate  = useNavigate()
  const [form, setForm]           = useState({ username: '', password: '' })
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [lockSeconds, setLockSeconds] = useState(0)
  const [attemptsMsg, setAttemptsMsg] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  // Countdown timer
  useEffect(() => {
    if (lockSeconds <= 0) return
    const t = setInterval(() => setLockSeconds(s => {
      if (s <= 1) { clearInterval(t); setError(''); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(t)
  }, [lockSeconds])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (lockSeconds > 0) return
    setLoading(true)
    setError('')
    setAttemptsMsg('')

    try {
      const res = await authAPI.login(form.username, form.password)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.username)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      // Don't navigate on error - stay on login page
      const data = err.response?.data
      if (err.response?.status === 423 || data?.lockSeconds > 0) {
        setLockSeconds(data.lockSeconds || 60)
        setError(data.message || 'Account locked.')
      } else if (err.response?.status >= 400 && err.response?.status < 500) {
        // Client errors (400, 401, etc) - show message, don't navigate
        setError(data?.message || 'Invalid credentials.')
        const match = data?.message?.match(/(\d+) attempt/)
        if (match) setAttemptsMsg(data.message)
      } else {
        // Server errors or network issues
        setError(err.message || 'Connection error. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isLocked = lockSeconds > 0

  return (
    <div className="noise-bg min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-cyber-accent/30 bg-cyber-accent/5 mb-5 panel-glow">
            <Shield size={28} className="text-cyber-accent" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-cyber-bright tracking-tight">
            SecureAuth Lab
          </h1>
          <p className="text-cyber-text text-sm mt-1 font-mono">
            Authentication Security System
          </p>
          <div className="accent-line mt-4 mx-auto w-32" />
        </div>

        {/* Login card */}
        <div className="panel panel-glow p-8 rounded-xl">
          <h2 className="font-display text-sm font-semibold text-cyber-text uppercase tracking-widest mb-6">
            Admin Access
          </h2>

          {/* Error banner */}
          {error && (
            <div className={`flex items-start gap-2 rounded-lg px-4 py-3 mb-5 text-sm border ${
              isLocked
                ? 'bg-cyber-yellow/10 border-cyber-yellow/30 text-cyber-yellow'
                : 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red'
            }`}>
              {isLocked ? <Timer size={14} className="mt-0.5 shrink-0" /> : <AlertTriangle size={14} className="mt-0.5 shrink-0" />}
              <span className="font-mono">{error}</span>
            </div>
          )}

          {/* Lockout countdown */}
          {isLocked && (
            <div className="flex items-center justify-center gap-3 mb-5 py-3 rounded-lg border border-cyber-yellow/20 bg-cyber-yellow/5">
              <div className="text-3xl font-mono font-bold text-cyber-yellow tabular-nums">
                {String(lockSeconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-cyber-text font-mono leading-tight">
                seconds<br/>remaining
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-mono text-cyber-text mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                disabled={isLocked || loading}
                placeholder="admin"
                className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-4 py-2.5
                           text-cyber-bright font-mono text-sm
                           focus:outline-none focus:border-cyber-accent/60 focus:ring-1 focus:ring-cyber-accent/20
                           disabled:opacity-40 disabled:cursor-not-allowed
                           placeholder:text-cyber-border
                           transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono text-cyber-text mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  disabled={isLocked || loading}
                  placeholder="••••••••"
                  className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-4 py-2.5 pr-10
                             text-cyber-bright font-mono text-sm
                             focus:outline-none focus:border-cyber-accent/60 focus:ring-1 focus:ring-cyber-accent/20
                             disabled:opacity-40 disabled:cursor-not-allowed
                             placeholder:text-cyber-border
                             transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-text hover:text-cyber-accent transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Attempts indicator */}
            {attemptsMsg && !isLocked && (
              <p className="text-xs font-mono text-cyber-yellow">{attemptsMsg}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLocked || loading || !form.username || !form.password}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg
                         bg-cyber-accent/15 border border-cyber-accent/40 text-cyber-accent
                         font-display font-semibold text-sm tracking-wide
                         hover:bg-cyber-accent/25 hover:border-cyber-accent/60
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              {loading ? (
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-cyber-accent rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                  <span className="w-1.5 h-1.5 bg-cyber-accent rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                  <span className="w-1.5 h-1.5 bg-cyber-accent rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                </span>
              ) : (
                <>
                  <Lock size={14} />
                  Authenticate
                </>
              )}
            </button>
          </form>

          <div className="accent-line mt-6" />
          <p className="text-center text-xs font-mono text-cyber-border mt-4">
            5 failed attempts → 60s lockout enforced
          </p>
        </div>

        <p className="text-center text-xs font-mono text-cyber-border/50 mt-5">
          SecureAuth Lab v1.0 · Educational Use Only
        </p>
      </div>
    </div>
  )
}
