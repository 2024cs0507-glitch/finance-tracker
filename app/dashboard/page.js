// app/dashboard/page.js
// Main dashboard with stats, charts, and recent transactions

'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/authContext'
import AppLayout from '../../components/ui/AppLayout'
import StatCards from '../../components/ui/StatCards'
import RecentTransactions from '../../components/ui/RecentTransactions'
import SpendingPieChart from '../../components/charts/SpendingPieChart'
import MonthlyBarChart from '../../components/charts/MonthlyBarChart'
import TrendLineChart from '../../components/charts/TrendLineChart'
import {
  getTransactions,
  getSummary,
  getSpendingByCategory,
  getMonthlyData,
} from '../../services/transactionService'
import { formatDate } from '../../utils/helpers'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 })
  const [spendingByCategory, setSpendingByCategory] = useState({})
  const [monthlyData, setMonthlyData] = useState([])
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth')
  }, [user, authLoading, router])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [txns, sum, spending, monthly] = await Promise.all([
        getTransactions(user.id),
        getSummary(user.id),
        getSpendingByCategory(user.id),
        getMonthlyData(user.id),
      ])
      setTransactions(txns)
      setSummary(sum)
      setSpendingByCategory(spending)
      setMonthlyData(monthly)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTransactionAdded = () => fetchData()

  if (authLoading) return null

  return (
    <AppLayout onTransactionAdded={handleTransactionAdded}>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-accent">
              {greeting}, {user?.email?.split('@')[0] || 'User'} 👋
            </h1>
            <p className="text-sm text-soft mt-0.5">
              {formatDate(new Date().toISOString())} · Here's your financial overview
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-soft px-3 py-2 rounded-xl"
            style={{ background: 'rgba(5, 38, 89, 0.5)', border: '1px solid rgba(125, 160, 202, 0.15)' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Data
          </div>
        </div>

        {/* Stat Cards */}
        <StatCards summary={summary} />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MonthlyBarChart monthlyData={monthlyData} loading={loading} />
          </div>
          <div>
            <SpendingPieChart spendingData={spendingByCategory} loading={loading} />
          </div>
        </div>

        {/* Trend + Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendLineChart monthlyData={monthlyData} loading={loading} />
          <RecentTransactions transactions={transactions} loading={loading} />
        </div>

        {/* Quick insights */}
        {!loading && transactions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'This Month',
                value: `$${transactions
                  .filter(t => t.date.startsWith(new Date().toISOString().slice(0, 7)))
                  .filter(t => t.type === 'expense')
                  .reduce((s, t) => s + Number(t.amount), 0)
                  .toFixed(2)}`,
                sub: 'in expenses',
                icon: '📅',
              },
              {
                label: 'Transactions',
                value: transactions.length,
                sub: 'total recorded',
                icon: '📊',
              },
              {
                label: 'Avg. Transaction',
                value: `$${transactions.length
                  ? (transactions.reduce((s, t) => s + Number(t.amount), 0) / transactions.length).toFixed(2)
                  : '0.00'}`,
                sub: 'per entry',
                icon: '💡',
              },
            ].map((insight, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-4">
                <span className="text-2xl">{insight.icon}</span>
                <div>
                  <p className="text-xs text-soft">{insight.label}</p>
                  <p className="text-lg font-bold text-accent">{insight.value}</p>
                  <p className="text-xs" style={{ color: 'rgba(125,160,202,0.5)' }}>{insight.sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
