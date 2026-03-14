// app/auth/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/authContext'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, signIn, signUp } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill in all fields')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        toast.success('Welcome back!')
        router.push('/dashboard')
      } else {
        await signUp(email, password)
        toast.success('Account created! Please check your email to confirm.')
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #021024 0%, #052659 50%, #021024 100%)' }}>

      {/* Background orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #5483B3, transparent)', filter: 'blur(80px)' }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #7DA0CA, transparent)', filter: 'blur(80px)' }} />

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #5483B3, #7DA0CA)' }}>
            <span className="text-2xl font-bold text-primary">FF</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">FinanceFlow</h1>
          <p className="text-soft mt-1 text-sm">Your personal finance command center</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tab switcher */}
          <div className="flex rounded-xl p-1 mb-6"
            style={{ background: 'rgba(2, 16, 36, 0.5)' }}>
            {['login', 'signup'].map(tab => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200"
                style={{
                  background: mode === tab ? 'linear-gradient(135deg, #5483B3, #7DA0CA)' : 'transparent',
                  color: mode === tab ? '#021024' : '#7DA0CA',
                }}>
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-soft text-sm font-medium block mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="text-soft text-sm font-medium block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
              style={{ padding: '12px 24px' }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Demo note */}
          <p className="text-center text-xs mt-4" style={{ color: 'rgba(125, 160, 202, 0.5)' }}>
            Connect your Supabase project for full functionality
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: '📊', label: 'Analytics' },
            { icon: '🔒', label: 'Secure' },
            { icon: '💡', label: 'Insights' },
          ].map(f => (
            <div key={f.label} className="glass-card p-3 text-center">
              <div className="text-xl mb-1">{f.icon}</div>
              <div className="text-xs text-soft">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
