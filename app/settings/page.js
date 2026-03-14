// app/settings/page.js
// User settings: monthly budget, savings goal, profile

'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/authContext'
import AppLayout from '../../components/ui/AppLayout'
import { getUserProfile, upsertUserProfile, getSummary } from '../../services/transactionService'
import { formatCurrency, savingsRate } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 })
  const [profile, setProfile] = useState({
    monthly_budget: '',
    savings_goal: '',
    currency: 'USD',
    display_name: '',
  })

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth')
  }, [user, authLoading, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      const [profileData, sum] = await Promise.all([
        getUserProfile(user.id),
        getSummary(user.id),
      ])
      if (profileData) {
        setProfile(p => ({ ...p, ...profileData }))
      }
      setSummary(sum)
    } catch (err) {
      console.error('Settings load error:', err)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertUserProfile(user.id, {
        monthly_budget: profile.monthly_budget ? Number(profile.monthly_budget) : null,
        savings_goal: profile.savings_goal ? Number(profile.savings_goal) : null,
        currency: profile.currency,
        display_name: profile.display_name,
      })
      toast.success('Settings saved!')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const budgetUsed = profile.monthly_budget
    ? Math.min((summary.expenses / Number(profile.monthly_budget)) * 100, 100)
    : 0

  const savingsProgress = profile.savings_goal && summary.balance > 0
    ? Math.min((summary.balance / Number(profile.savings_goal)) * 100, 100)
    : 0

  const rate = savingsRate(summary.income, summary.expenses)

  if (authLoading) return null

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl">

        <div>
          <h1 className="text-xl font-bold text-accent">Settings</h1>
          <p className="text-soft text-sm">Manage your preferences and financial goals</p>
        </div>

        {/* Profile */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-accent flex items-center gap-2">
            👤 Profile
          </h2>
          <div>
            <label className="text-soft text-xs font-medium block mb-1.5">Display Name</label>
            <input
              type="text"
              value={profile.display_name || ''}
              onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
              placeholder={user?.email?.split('@')[0] || 'Your name'}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-soft text-xs font-medium block mb-1.5">Email</label>
            <input type="email" value={user?.email || ''} disabled
              className="input-field opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-soft text-xs font-medium block mb-1.5">Currency</label>
            <select
              value={profile.currency}
              onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}
              className="input-field" style={{ width: 'auto', minWidth: '150px' }}>
              <option value="USD">🇺🇸 USD ($)</option>
              <option value="EUR">🇪🇺 EUR (€)</option>
              <option value="GBP">🇬🇧 GBP (£)</option>
              <option value="CAD">🇨🇦 CAD ($)</option>
              <option value="AUD">🇦🇺 AUD ($)</option>
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-accent flex items-center gap-2">
            💼 Monthly Budget
          </h2>
          <div>
            <label className="text-soft text-xs font-medium block mb-1.5">Monthly Budget Limit ($)</label>
            <input
              type="number"
              value={profile.monthly_budget || ''}
              onChange={e => setProfile(p => ({ ...p, monthly_budget: e.target.value }))}
              placeholder="e.g. 3000"
              className="input-field"
              min="0"
            />
          </div>
          {profile.monthly_budget && (
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-soft">Budget Used</span>
                <span className={budgetUsed > 90 ? 'text-red-400' : budgetUsed > 70 ? 'text-yellow-400' : 'text-green-400'}>
                  {formatCurrency(summary.expenses)} / {formatCurrency(Number(profile.monthly_budget))}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(2, 16, 36, 0.5)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${budgetUsed}%`,
                    background: budgetUsed > 90
                      ? 'linear-gradient(90deg, #FF6384, #FF9F40)'
                      : budgetUsed > 70
                        ? 'linear-gradient(90deg, #FF9F40, #FFCE56)'
                        : 'linear-gradient(90deg, #4BC0C0, #36A2EB)',
                  }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(125,160,202,0.5)' }}>
                {budgetUsed.toFixed(0)}% of monthly budget used
              </p>
            </div>
          )}
        </div>

        {/* Savings Goal */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-accent flex items-center gap-2">
            🎯 Savings Goal
          </h2>
          <div>
            <label className="text-soft text-xs font-medium block mb-1.5">Target Savings Amount ($)</label>
            <input
              type="number"
              value={profile.savings_goal || ''}
              onChange={e => setProfile(p => ({ ...p, savings_goal: e.target.value }))}
              placeholder="e.g. 10000"
              className="input-field"
              min="0"
            />
          </div>
          {profile.savings_goal && (
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-soft">Progress</span>
                <span className="text-accent">
                  {formatCurrency(Math.max(0, summary.balance))} / {formatCurrency(Number(profile.savings_goal))}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(2, 16, 36, 0.5)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${savingsProgress}%`,
                    background: 'linear-gradient(90deg, #5483B3, #C1E8FF)',
                  }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(125,160,202,0.5)' }}>
                {savingsProgress.toFixed(1)}% of goal achieved · Savings rate: {rate.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : '💾'} Save Settings
          </button>
          <button
            onClick={async () => { await signOut(); router.push('/auth') }}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'rgba(255, 99, 132, 0.15)', color: '#FF6384', border: '1px solid rgba(255,99,132,0.2)' }}>
            🚪 Sign Out
          </button>
        </div>

        {/* Account info */}
        <div className="glass-card p-4">
          <p className="text-xs text-soft">
            Account ID: <span className="text-accent font-mono text-xs">{user?.id?.slice(0, 16)}...</span>
          </p>
          <p className="text-xs text-soft mt-1">
            Member since: <span className="text-accent">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
