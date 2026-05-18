import type { CreateTransactionInput, FinanceKPIs, Transaction } from './types'

const BASE = 'https://runway-api-production.up.railway.app'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText)
    throw new Error(message || `Request failed (${res.status})`)
  }

  return res.json() as Promise<T>
}

export function getKPIs() {
  return request<FinanceKPIs>('/finance/kpis')
}

export function listTransactions() {
  return request<Transaction[]>('/transactions')
}

export function createTransaction(body: CreateTransactionInput) {
  return request<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
