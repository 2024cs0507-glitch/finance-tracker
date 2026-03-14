// components/ui/StatCards.js
// Dashboard summary cards showing balance, income, expenses, savings

import { formatCurrency, savingsRate } from '../../utils/helpers'

const cards = [
  {
    key: 'balance',
    label: 'Total Balance',
    icon: '💎',
    gradient: 'linear-gradient(135deg, #052659, #5483B3)',
    border: 'rgba(84, 131, 179, 0.4)',
    glow: 'rgba(84, 131, 179, 0.2)',
  },
  {
    key: 'income',
    label: 'Total Income',
    icon: '↑',
    gradient: 'linear-gradient(135deg, rgba(75,192,192,0.2), rgba(75,192,192,0.05))',
    border: 'rgba(75, 192, 192, 0.3)',
    glow: 'rgba(75, 192, 192, 0.1)',
    color: '#4BC0C0',
  },
  {
    key: 'expenses',
    label: 'Total Expenses',
    icon: '↓',
    gradient: 'linear-gradient(135deg, rgba(255,99,132,0.2), rgba(255,99,132,0.05))',
    border: 'rgba(255, 99, 132, 0.3)',
    glow: 'rgba(255, 99, 132, 0.1)',
    color: '#FF6384',
  },
  {
    key: 'savings',
    label: 'Savings Rate',
    icon: '🏦',
    gradient: 'linear-gradient(135deg, rgba(193,232,255,0.15), rgba(125,160,202,0.05))',
    border: 'rgba(193, 232, 255, 0.25)',
    glow: 'rgba(193, 232, 255, 0.1)',
  },
]

export default function StatCards({ summary }) {
  const rate = savingsRate(summary?.income || 0, summary?.expenses || 0)

  const getValue = (key) => {
    if (key === 'savings') return `${rate.toFixed(1)}%`
    return formatCurrency(summary?.[key] || 0)
  }

  const getChange = (key) => {
    if (key === 'balance') return summary?.balance >= 0 ? 'Positive balance' : 'Negative balance'
    if (key === 'savings') return rate >= 20 ? 'Great savings habit!' : rate >= 10 ? 'Keep it up' : 'Try to save more'
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.key}
          className="rounded-2xl p-5 animate-fade-in"
          style={{
            background: card.gradient,
            border: `1px solid ${card.border}`,
            boxShadow: `0 4px 24px ${card.glow}`,
            animationDelay: `${i * 0.1}s`,
          }}>

          {/* Icon + Label */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: 'rgba(193, 232, 255, 0.7)' }}>
              {card.label}
            </span>
            <span className="text-lg">{card.icon}</span>
          </div>

          {/* Value */}
          <div className="text-2xl font-bold mb-1"
            style={{ color: card.color || '#C1E8FF' }}>
            {getValue(card.key)}
          </div>

          {/* Sub text */}
          {getChange(card.key) && (
            <p className="text-xs" style={{ color: 'rgba(125, 160, 202, 0.7)' }}>
              {getChange(card.key)}
            </p>
          )}

          {/* Progress bar for savings */}
          {card.key === 'savings' && (
            <div className="mt-3 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(2, 16, 36, 0.4)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(rate, 100)}%`,
                  background: rate >= 20
                    ? 'linear-gradient(90deg, #4BC0C0, #36A2EB)'
                    : 'linear-gradient(90deg, #FF9F40, #FFCE56)',
                }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
