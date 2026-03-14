// components/ui/AppLayout.js
// Shared layout with sidebar navigation

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../../lib/authContext'
import toast from 'react-hot-toast'
import TransactionModal from './TransactionModal'

const navItems = [
  { href: '/dashboard', icon: '⬛', label: 'Dashboard', emoji: '📊' },
  { href: '/history', icon: '📋', label: 'History', emoji: '📋' },
  { href: '/analytics', icon: '📈', label: 'Analytics', emoji: '📈' },
  { href: '/settings', icon: '⚙️', label: 'Settings', emoji: '⚙️' },
]

export default function AppLayout({ children, onTransactionAdded }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth')
      toast.success('Signed out successfully')
    } catch {
      toast.error('Sign out failed')
    }
  }

  const userInitial = user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="flex min-h-screen" style={{ background: '#021024' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-primary/80 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}
        style={{
          background: 'linear-gradient(180deg, #052659 0%, #021024 100%)',
          borderRight: '1px solid rgba(125, 160, 202, 0.15)',
        }}>

        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(125, 160, 202, 0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-primary"
              style={{ background: 'linear-gradient(135deg, #5483B3, #C1E8FF)' }}>
              FF
            </div>
            <div>
              <h1 className="font-bold text-accent text-sm">FinanceFlow</h1>
              <p className="text-xs" style={{ color: 'rgba(125, 160, 202, 0.6)' }}>Personal Finance</p>
            </div>
          </div>
        </div>

        {/* Add Transaction CTA */}
        <div className="p-4">
          <button
            onClick={() => { setShowModal(true); setSidebarOpen(false) }}
            className="w-full py-3 rounded-xl text-sm font-semibold text-primary flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #5483B3, #7DA0CA)' }}>
            <span className="text-lg">+</span>
            Add Transaction
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? 'sidebar-active' : 'text-soft hover:text-accent hover:bg-secondary/40'
                }`}>
                <span>{item.emoji}</span>
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(125, 160, 202, 0.15)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary"
              style={{ background: 'linear-gradient(135deg, #5483B3, #C1E8FF)' }}>
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-accent font-medium truncate">{user?.email}</p>
              <p className="text-xs" style={{ color: 'rgba(125, 160, 202, 0.5)' }}>Free Plan</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full py-2 rounded-lg text-xs text-soft hover:text-accent transition-colors"
            style={{ background: 'rgba(2, 16, 36, 0.4)' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar (mobile) */}
        <header className="flex items-center justify-between px-4 py-3 lg:hidden border-b"
          style={{ borderColor: 'rgba(125, 160, 202, 0.15)', background: '#052659' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-soft p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-accent">FinanceFlow</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary"
            style={{ background: 'linear-gradient(135deg, #5483B3, #C1E8FF)' }}>
            {userInitial}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={(t) => {
            setShowModal(false)
            if (onTransactionAdded) onTransactionAdded(t)
          }}
        />
      )}
    </div>
  )
}
