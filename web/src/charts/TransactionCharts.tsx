import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Transaction } from '../types'

const COLORS_INCOME = '#10b981'
const COLORS_EXPENSE = '#ef4444'

export function TransactionTrendChart({ transactions }: { transactions: Transaction[] }) {
  // Group transactions by date and calculate running balance
  const grouped = new Map<string, { income: number; expense: number }>()

  transactions.forEach((tx) => {
    const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    if (!grouped.has(date)) {
      grouped.set(date, { income: 0, expense: 0 })
    }

    const entry = grouped.get(date)!
    if (tx.type === 'INCOME') {
      entry.income += tx.amount
    } else {
      entry.expense += tx.amount
    }
  })

  const data = Array.from(grouped.entries())
    .map(([date, { income, expense }]) => ({
      date,
      income,
      expense,
    }))
    .reverse()

  return (
    <div className="chart-container">
      <h2>Transaction Trends</h2>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
            <Bar dataKey="income" fill={COLORS_INCOME} name="Income" />
            <Bar dataKey="expense" fill={COLORS_EXPENSE} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="empty-state">No transactions yet</p>
      )}
    </div>
  )
}

export function CumulativeNetProfitChart({ transactions }: { transactions: Transaction[] }) {
  // Calculate cumulative net profit over time
  let runningBalance = 0
  const data = [...transactions].reverse().map((tx) => {
    runningBalance += tx.type === 'INCOME' ? tx.amount : -tx.amount

    return {
      date: new Date(tx.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      profit: runningBalance,
    }
  })

  return (
    <div className="chart-container">
      <h2>Cumulative Net Profit</h2>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="empty-state">No transactions yet</p>
      )}
    </div>
  )
}

export function TransactionBreakdownChart({ transactions }: { transactions: Transaction[] }) {
  // Calculate income vs expense totals
  let totalIncome = 0
  let totalExpense = 0

  transactions.forEach((tx) => {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount
    } else {
      totalExpense += tx.amount
    }
  })

  const data = [
    { name: 'Income', value: totalIncome },
    { name: 'Expenses', value: totalExpense },
  ]

  return (
    <div className="chart-container">
      <h2>Income vs Expenses</h2>
      {totalIncome > 0 || totalExpense > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: $${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              <Cell fill={COLORS_INCOME} />
              <Cell fill={COLORS_EXPENSE} />
            </Pie>
            <Tooltip formatter={(value) => `$${value}`} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="empty-state">No transactions yet</p>
      )}
    </div>
  )
}
