// utils/helpers.js
// Shared utility functions

import { CATEGORIES } from '../lib/constants'

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date to readable string
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get category info by value
 */
export function getCategoryInfo(value) {
  return CATEGORIES.find(c => c.value === value) || {
    value: 'other',
    label: 'Other',
    icon: '📌',
    color: '#9966FF',
  }
}

/**
 * Calculate savings rate as percentage
 */
export function savingsRate(income, expenses) {
  if (income === 0) return 0
  return Math.max(0, ((income - expenses) / income) * 100)
}

/**
 * Export transactions to CSV
 */
export function exportToCSV(transactions, filename = 'transactions.csv') {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description']
  const rows = transactions.map(t => [
    t.date,
    t.type,
    getCategoryInfo(t.category).label,
    t.amount,
    t.description || '',
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

/**
 * Group transactions by month
 */
export function groupByMonth(transactions) {
  const grouped = {}
  transactions.forEach(t => {
    const key = t.date.substring(0, 7) // YYYY-MM
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })
  return grouped
}

/**
 * Get top spending category
 */
export function getTopCategory(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const totals = {}
  expenses.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + Number(t.amount)
  })
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1])
  return sorted[0] ? { category: sorted[0][0], amount: sorted[0][1] } : null
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
