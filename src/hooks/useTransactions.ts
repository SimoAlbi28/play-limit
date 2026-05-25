import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Transaction, TransactionType } from '../types'

const STORAGE_KEY = 'playlimit.transactions'

function load(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Transaction[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        (t.type === 'spesa' || t.type === 'vincita') &&
        typeof t.amount === 'number' &&
        typeof t.createdAt === 'number',
    )
  } catch {
    return []
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const add = useCallback((type: TransactionType, amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return
    const t: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: Math.round(amount * 100) / 100,
      createdAt: Date.now(),
    }
    setTransactions((prev) => [t, ...prev])
  }, [])

  const remove = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setTransactions([])
  }, [])

  const { balance, totalSpesa, totalVincita } = useMemo(() => {
    let spesa = 0
    let vincita = 0
    for (const t of transactions) {
      if (t.type === 'spesa') spesa += t.amount
      else vincita += t.amount
    }
    return {
      balance: Math.round((vincita - spesa) * 100) / 100,
      totalSpesa: Math.round(spesa * 100) / 100,
      totalVincita: Math.round(vincita * 100) / 100,
    }
  }, [transactions])

  return {
    transactions,
    balance,
    totalSpesa,
    totalVincita,
    count: transactions.length,
    add,
    remove,
    clearAll,
  }
}
