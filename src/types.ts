export type TransactionType = 'spesa' | 'vincita'

export type TransactionKind = 'initial'

export type Transaction = {
  id: string
  type: TransactionType
  amount: number
  createdAt: number
  kind?: TransactionKind
  hidden?: boolean
}

export type BetStatus = 'pending' | 'won' | 'lost'

export type Bet = {
  id: string
  description: string
  stake: number
  potentialWin: number
  createdAt: number
  status: BetStatus
  resolvedAt?: number
  spesaTxId?: string
}

export type Theme = 'light' | 'dark' | 'auto'

export type SortMode = 'date' | 'loss' | 'win'
