export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description?: string
  createdAt: string
}

export interface FinanceKPIs {
  cash: number
  burnRate: number
  runway: number | null
  netProfit: number
}

export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  description?: string
}
