import { describe, expect, test } from 'vitest'
import type { Bet, Transaction } from '../types'
import {
  balanceSeries,
  betOutcomes,
  niceTicks,
  periodRange,
  spesaVincitaBuckets,
} from './stats'

function tx(
  type: Transaction['type'],
  amount: number,
  createdAt: number,
  extra: Partial<Transaction> = {},
): Transaction {
  return { id: Math.random().toString(36), type, amount, createdAt, ...extra }
}

function bet(status: Bet['status'], createdAt: number): Bet {
  return {
    id: Math.random().toString(36),
    description: 'x',
    stake: 1,
    potentialWin: 2,
    createdAt,
    status,
  }
}

const JAN = (d: number) => new Date(2026, 0, d).getTime()
const FEB = (d: number) => new Date(2026, 1, d).getTime()

describe('periodRange', () => {
  test('all spans everything', () => {
    expect(periodRange({ kind: 'all' })).toEqual({
      start: -Infinity,
      end: Infinity,
    })
  })

  test('year spans Jan 1 to next Jan 1', () => {
    expect(periodRange({ kind: 'year', year: 2026 })).toEqual({
      start: new Date(2026, 0, 1).getTime(),
      end: new Date(2027, 0, 1).getTime(),
    })
  })

  test('month spans first of month to first of next month', () => {
    expect(periodRange({ kind: 'month', year: 2026, month: 4 })).toEqual({
      start: new Date(2026, 4, 1).getTime(),
      end: new Date(2026, 5, 1).getTime(),
    })
  })
})

describe('balanceSeries', () => {
  test('accumulates cumulative balance in chronological order', () => {
    const txs = [
      tx('spesa', 30, FEB(5)),
      tx('vincita', 100, JAN(10)),
      tx('spesa', 20, FEB(20)),
    ]
    expect(balanceSeries(txs)).toEqual([
      { t: JAN(10), balance: 100 },
      { t: FEB(5), balance: 70 },
      { t: FEB(20), balance: 50 },
    ])
  })

  test('within a range carries the balance accrued before the range', () => {
    const txs = [
      tx('vincita', 100, JAN(10)),
      tx('spesa', 30, FEB(5)),
      tx('spesa', 20, FEB(20)),
    ]
    const series = balanceSeries(txs, periodRange({ kind: 'month', year: 2026, month: 1 }))
    expect(series).toEqual([
      { t: FEB(5), balance: 70 },
      { t: FEB(20), balance: 50 },
    ])
  })

  test('rounds to 2 decimals', () => {
    const txs = [tx('spesa', 0.1, JAN(1)), tx('spesa', 0.2, JAN(2))]
    expect(balanceSeries(txs)).toEqual([
      { t: JAN(1), balance: -0.1 },
      { t: JAN(2), balance: -0.3 },
    ])
  })

  test('empty input gives empty series', () => {
    expect(balanceSeries([])).toEqual([])
  })
})

describe('spesaVincitaBuckets', () => {
  test('period all groups by month, only active months, chronological', () => {
    const txs = [
      tx('vincita', 100, JAN(10)),
      tx('spesa', 40, JAN(20)),
      tx('spesa', 30, FEB(5)),
      tx('spesa', 20, FEB(20)),
      tx('vincita', 10, FEB(25)),
    ]
    const buckets = spesaVincitaBuckets(txs, { kind: 'all' })
    expect(buckets.length).toBe(2)
    expect(buckets[0]).toMatchObject({ spesa: 40, vincita: 100 })
    expect(buckets[1]).toMatchObject({ spesa: 50, vincita: 10 })
  })

  test('period year always returns 12 monthly buckets', () => {
    const txs = [tx('spesa', 5, FEB(3))]
    const buckets = spesaVincitaBuckets(txs, { kind: 'year', year: 2026 })
    expect(buckets.length).toBe(12)
    expect(buckets[1]).toMatchObject({ spesa: 5, vincita: 0 })
    expect(buckets[0]).toMatchObject({ spesa: 0, vincita: 0 })
  })

  test('period month returns 4 weekly buckets', () => {
    const txs = [
      tx('spesa', 10, FEB(3)), // week 1 (1-7)
      tx('vincita', 20, FEB(10)), // week 2 (8-14)
      tx('spesa', 5, FEB(25)), // week 4 (22-end)
    ]
    const buckets = spesaVincitaBuckets(txs, { kind: 'month', year: 2026, month: 1 })
    expect(buckets.length).toBe(4)
    expect(buckets[0]).toMatchObject({ spesa: 10, vincita: 0 })
    expect(buckets[1]).toMatchObject({ spesa: 0, vincita: 20 })
    expect(buckets[2]).toMatchObject({ spesa: 0, vincita: 0 })
    expect(buckets[3]).toMatchObject({ spesa: 5, vincita: 0 })
  })
})

describe('betOutcomes', () => {
  test('counts statuses and computes win rate', () => {
    const bets = [
      bet('won', JAN(1)),
      bet('won', JAN(2)),
      bet('lost', JAN(3)),
      bet('pending', JAN(4)),
      bet('pending', JAN(5)),
      bet('pending', JAN(6)),
    ]
    const out = betOutcomes(bets)
    expect(out.won).toBe(2)
    expect(out.lost).toBe(1)
    expect(out.pending).toBe(3)
    expect(out.winRate).toBeCloseTo(2 / 3, 5)
  })

  test('win rate is 0 when nothing is resolved', () => {
    expect(betOutcomes([bet('pending', JAN(1))]).winRate).toBe(0)
  })

  test('filters by range on createdAt', () => {
    const bets = [bet('won', JAN(10)), bet('lost', FEB(10))]
    const out = betOutcomes(bets, periodRange({ kind: 'month', year: 2026, month: 0 }))
    expect(out.won).toBe(1)
    expect(out.lost).toBe(0)
  })
})

describe('niceTicks', () => {
  test('produces evenly spaced round ticks covering the range', () => {
    const { ticks, min, max } = niceTicks(0, 100, 5)
    expect(ticks).toEqual([0, 20, 40, 60, 80, 100])
    expect(min).toBe(0)
    expect(max).toBe(100)
  })

  test('extends domain to round bounds for negative ranges', () => {
    const { ticks, min, max } = niceTicks(-110, 0, 5)
    expect(min).toBeLessThanOrEqual(-110)
    expect(max).toBeGreaterThanOrEqual(0)
    expect(ticks[0]).toBe(min)
    expect(ticks[ticks.length - 1]).toBe(max)
    expect(ticks).toContain(0)
  })

  test('handles a flat range without crashing', () => {
    const { ticks } = niceTicks(5, 5, 4)
    expect(ticks.length).toBeGreaterThanOrEqual(1)
  })
})
