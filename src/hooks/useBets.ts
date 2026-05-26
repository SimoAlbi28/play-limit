import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Bet } from '../types'

const STORAGE_KEY = 'playlimit.bets'

function load(): Bet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Bet[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (b) =>
        b &&
        typeof b.id === 'string' &&
        typeof b.description === 'string' &&
        typeof b.stake === 'number' &&
        typeof b.potentialWin === 'number' &&
        typeof b.createdAt === 'number' &&
        (b.status === 'pending' || b.status === 'won' || b.status === 'lost'),
    )
  } catch {
    return []
  }
}

export type AddBetInput = {
  description: string
  stake: number
  potentialWin: number
  createdAt?: number
  spesaTxId?: string
}

export type BetPatch = {
  description?: string
  stake?: number
  potentialWin?: number
  createdAt?: number
}

export function useBets() {
  const [bets, setBets] = useState<Bet[]>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bets))
  }, [bets])

  const add = useCallback((input: AddBetInput): Bet => {
    const b: Bet = {
      id: crypto.randomUUID(),
      description: input.description.trim(),
      stake: Math.round(input.stake * 100) / 100,
      potentialWin: Math.round(input.potentialWin * 100) / 100,
      createdAt: input.createdAt ?? Date.now(),
      status: 'pending',
      spesaTxId: input.spesaTxId,
    }
    setBets((prev) => [b, ...prev])
    return b
  }, [])

  const update = useCallback((id: string, patch: BetPatch) => {
    setBets((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const next: Bet = { ...b }
        if (patch.description !== undefined) {
          next.description = patch.description.trim()
        }
        if (patch.stake !== undefined && Number.isFinite(patch.stake)) {
          next.stake = Math.round(patch.stake * 100) / 100
        }
        if (
          patch.potentialWin !== undefined &&
          Number.isFinite(patch.potentialWin)
        ) {
          next.potentialWin = Math.round(patch.potentialWin * 100) / 100
        }
        if (patch.createdAt !== undefined) {
          next.createdAt = patch.createdAt
        }
        return next
      }),
    )
  }, [])

  const settle = useCallback(
    (id: string, outcome: 'won' | 'lost', vincitaTxId?: string) => {
      setBets((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: outcome,
                resolvedAt: Date.now(),
                ...(vincitaTxId ? { vincitaTxId } : {}),
              }
            : b,
        ),
      )
    },
    [],
  )

  const remove = useCallback((id: string) => {
    setBets((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const removeMany = useCallback((ids: string[]) => {
    const set = new Set(ids)
    setBets((prev) => prev.filter((b) => !set.has(b.id)))
  }, [])

  const clearAll = useCallback(() => setBets([]), [])

  const { pendingBets, settledBets, totalPotentialWin } = useMemo(() => {
    const pending: Bet[] = []
    const settled: Bet[] = []
    let pot = 0
    for (const b of bets) {
      if (b.status === 'pending') {
        pending.push(b)
        pot += b.potentialWin
      } else {
        settled.push(b)
      }
    }
    pending.sort((a, b) => b.createdAt - a.createdAt)
    settled.sort(
      (a, b) => (b.resolvedAt ?? b.createdAt) - (a.resolvedAt ?? a.createdAt),
    )
    return {
      pendingBets: pending,
      settledBets: settled,
      totalPotentialWin: Math.round(pot * 100) / 100,
    }
  }, [bets])

  return {
    bets,
    pendingBets,
    settledBets,
    totalPotentialWin,
    add,
    update,
    settle,
    remove,
    removeMany,
    clearAll,
  }
}
