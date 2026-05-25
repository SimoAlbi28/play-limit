export type TransactionType = 'spesa' | 'vincita'

export type Transaction = {
  id: string
  type: TransactionType
  amount: number
  createdAt: number
}

export type Theme = 'light' | 'dark' | 'auto'

export type SortMode = 'date' | 'loss' | 'win'
