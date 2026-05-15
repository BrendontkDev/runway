import { useCallback, useEffect, useState } from 'react'
import { createTransaction, getKPIs, listTransactions } from './api'
import type { CreateTransactionInput, FinanceKPIs, Transaction } from './types'
import './App.css'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatRunway(months: number | null) {
  if (months === null) return '—'
  if (months >= 99) return '99+ mo'
  return `${months} mo`
}

function App() {
  const [kpis, setKpis] = useState<FinanceKPIs | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const refresh = useCallback(async () => {
    const [kpiData, txData] = await Promise.all([getKPIs(), listTransactions()])
    setKpis(kpiData)
    setTransactions([...txData].reverse())
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        await refresh()
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : 'Could not reach the API. Is it running on port 3000?',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [refresh])

  async function handleAddTransaction(data: CreateTransactionInput) {
    setSubmitting(true)
    setError(null)
    try {
      await createTransaction(data)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add transaction')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <h1>Runway</h1>
            <p className="subtitle">Startup finance at a glance</p>
          </div>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => refresh().catch(() => {})}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      {error && (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      )}

      {loading && !kpis ? (
        <p className="loading">Loading dashboard…</p>
      ) : (
        <>
          <section className="kpi-grid" aria-label="Key metrics">
            <KpiCard
              label="Cash balance"
              value={currency.format(kpis?.cash ?? 0)}
              hint="Income minus expenses"
              variant="cash"
            />
            <KpiCard
              label="Burn rate"
              value={currency.format(kpis?.burnRate ?? 0)}
              hint="Total expenses"
              variant="burn"
            />
            <KpiCard
              label="Runway"
              value={formatRunway(kpis?.runway ?? null)}
              hint={
                kpis?.runway === null
                  ? 'No expenses yet'
                  : 'Months until cash runs out'
              }
              variant="runway"
            />
            <KpiCard
              label="Net profit"
              value={currency.format(kpis?.netProfit ?? 0)}
              hint="Income minus expenses"
              variant={
                (kpis?.netProfit ?? 0) >= 0 ? 'profit-positive' : 'profit-negative'
              }
            />
          </section>

          <div className="dashboard-main">
            <TransactionForm onSubmit={handleAddTransaction} disabled={submitting} />
            <TransactionList transactions={transactions} />
          </div>
        </>
      )}
    </div>
  )
}

function KpiCard({
  label,
  value,
  hint,
  variant,
}: {
  label: string
  value: string
  hint: string
  variant: string
}) {
  return (
    <article className={`kpi-card kpi-${variant}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      <span className="kpi-hint">{hint}</span>
    </article>
  )
}

function TransactionForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (data: CreateTransactionInput) => Promise<void>
  disabled: boolean
}) {
  const [type, setType] = useState<CreateTransactionInput['type']>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) return

    await onSubmit({
      type,
      amount: parsed,
      description: description.trim() || undefined,
    })

    setAmount('')
    setDescription('')
  }

  return (
    <section className="panel">
      <h2>Add transaction</h2>
      <form className="tx-form" onSubmit={handleSubmit}>
        <div className="type-toggle" role="group" aria-label="Transaction type">
          <button
            type="button"
            className={type === 'INCOME' ? 'active income' : ''}
            onClick={() => setType('INCOME')}
          >
            Income
          </button>
          <button
            type="button"
            className={type === 'EXPENSE' ? 'active expense' : ''}
            onClick={() => setType('EXPENSE')}
          >
            Expense
          </button>
        </div>

        <label className="field">
          <span>Amount</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Description</span>
          <input
            type="text"
            placeholder="e.g. AWS, client payment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <button type="submit" className="btn-primary" disabled={disabled}>
          {disabled ? 'Saving…' : 'Add transaction'}
        </button>
      </form>
    </section>
  )
}

function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <section className="panel panel-grow">
      <div className="panel-head">
        <h2>Transactions</h2>
        <span className="count">{transactions.length}</span>
      </div>

      {transactions.length === 0 ? (
        <p className="empty">
          No transactions yet. Add income or expenses to see burn rate and runway.
        </p>
      ) : (
        <ul className="tx-list">
          {transactions.map((tx) => (
            <li key={tx.id} className="tx-row">
              <span className={`badge badge-${tx.type.toLowerCase()}`}>
                {tx.type === 'INCOME' ? 'Income' : 'Expense'}
              </span>
              <span className="tx-desc">{tx.description || '—'}</span>
              <span className="tx-date">
                {new Date(tx.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span
                className={`tx-amount ${tx.type === 'INCOME' ? 'positive' : 'negative'}`}
              >
                {tx.type === 'INCOME' ? '+' : '−'}
                {currency.format(tx.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default App
