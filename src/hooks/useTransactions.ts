import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Transaction, TransactionKind, TransactionType } from '../types'

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

  const add = useCallback(
    (
      type: TransactionType,
      amount: number,
      createdAt?: number,
      id?: string,
      kind?: TransactionKind,
      description?: string,
    ): string | null => {
      if (!Number.isFinite(amount) || amount <= 0) return null
      const txId = id ?? crypto.randomUUID()
      const desc = description?.trim()
      const t: Transaction = {
        id: txId,
        type,
        amount: Math.round(amount * 100) / 100,
        createdAt: createdAt ?? Date.now(),
        ...(kind ? { kind } : {}),
        ...(desc ? { description: desc } : {}),
      }
      setTransactions((prev) => [t, ...prev])
      return txId
    },
    [],
  )

  const update = useCallback(
    (
      id: string,
      patch: {
        amount?: number
        createdAt?: number
        description?: string
        type?: TransactionType
      },
    ) => {
      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          const next = { ...t }
          if (patch.amount !== undefined && Number.isFinite(patch.amount)) {
            next.amount = Math.round(patch.amount * 100) / 100
          }
          if (patch.createdAt !== undefined) {
            next.createdAt = patch.createdAt
          }
          if (patch.description !== undefined) {
            const desc = patch.description.trim()
            if (desc) next.description = desc
            else delete next.description
          }
          if (patch.type !== undefined) {
            next.type = patch.type
          }
          return next
        }),
      )
    },
    [],
  )

  const hide = useCallback((id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, hidden: true } : t)),
    )
  }, [])

  const unhideAll = useCallback(() => {
    setTransactions((prev) =>
      prev.map((t) => (t.hidden ? { ...t, hidden: false } : t)),
    )
  }, [])

  const remove = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setTransactions([])
  }, [])

  const { balance, totalSpesa, totalVincita, operationsCount, hiddenCount } =
    useMemo(() => {
      let spesa = 0
      let vincita = 0
      let opCount = 0
      let hidden = 0
      for (const t of transactions) {
        opCount += 1
        if (t.type === 'spesa') spesa += t.amount
        else vincita += t.amount
        if (t.hidden) hidden += 1
      }
      return {
        balance: Math.round((vincita - spesa) * 100) / 100,
        totalSpesa: Math.round(spesa * 100) / 100,
        totalVincita: Math.round(vincita * 100) / 100,
        operationsCount: opCount,
        hiddenCount: hidden,
      }
    }, [transactions])

  return {
    transactions,
    balance,
    totalSpesa,
    totalVincita,
    count: operationsCount,
    hiddenCount,
    add,
    update,
    hide,
    unhideAll,
    remove,
    clearAll,
  }
}
