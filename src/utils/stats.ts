import type { Bet, Transaction } from '../types'

export type Period =
  | { kind: 'all' }
  | { kind: 'year'; year: number }
  | { kind: 'month'; year: number; month: number } // month: 0-11

export type Range = { start: number; end: number } // [start, end)

export type BalancePoint = { t: number; balance: number }

export type SpesaVincitaBucket = {
  label: string
  spesa: number
  vincita: number
  start: number
  end: number
}

export type BetOutcomes = {
  won: number
  lost: number
  pending: number
  winRate: number // 0..1
}

const MONTHS_SHORT = [
  'gen',
  'feb',
  'mar',
  'apr',
  'mag',
  'giu',
  'lug',
  'ago',
  'set',
  'ott',
  'nov',
  'dic',
]

const round2 = (n: number) => Math.round(n * 100) / 100

const signed = (t: Transaction) => (t.type === 'vincita' ? t.amount : -t.amount)

export function periodRange(p: Period): Range {
  if (p.kind === 'all') return { start: -Infinity, end: Infinity }
  if (p.kind === 'year') {
    return {
      start: new Date(p.year, 0, 1).getTime(),
      end: new Date(p.year + 1, 0, 1).getTime(),
    }
  }
  return {
    start: new Date(p.year, p.month, 1).getTime(),
    end: new Date(p.year, p.month + 1, 1).getTime(),
  }
}

const inRange = (t: number, r: Range) => t >= r.start && t < r.end

export function balanceSeries(
  transactions: Transaction[],
  range: Range = { start: -Infinity, end: Infinity },
): BalancePoint[] {
  const sorted = [...transactions].sort((a, b) => a.createdAt - b.createdAt)
  const series: BalancePoint[] = []
  let balance = 0
  for (const t of sorted) {
    balance += signed(t)
    if (inRange(t.createdAt, range)) {
      series.push({ t: t.createdAt, balance: round2(balance) })
    }
  }
  return series
}

function bucketLabel(start: number, granularity: 'month' | 'week', index: number): string {
  if (granularity === 'month') return MONTHS_SHORT[new Date(start).getMonth()]
  // weekly buckets within a month: 1-7, 8-14, 15-21, 22-end
  const ranges = ['1–7', '8–14', '15–21', '22+']
  return ranges[index]
}

export function spesaVincitaBuckets(
  transactions: Transaction[],
  period: Period,
): SpesaVincitaBucket[] {
  const range = periodRange(period)
  const txs = transactions.filter((t) => inRange(t.createdAt, range))

  if (period.kind === 'month') {
    // 4 fixed weekly buckets
    const weekStart = (w: number) =>
      new Date(period.year, period.month, 1 + w * 7).getTime()
    const monthEnd = new Date(period.year, period.month + 1, 1).getTime()
    const buckets: SpesaVincitaBucket[] = [0, 1, 2, 3].map((w) => ({
      label: bucketLabel(weekStart(w), 'week', w),
      spesa: 0,
      vincita: 0,
      start: weekStart(w),
      end: w === 3 ? monthEnd : weekStart(w + 1),
    }))
    for (const t of txs) {
      const day = new Date(t.createdAt).getDate()
      const idx = Math.min(3, Math.floor((day - 1) / 7))
      if (t.type === 'spesa') buckets[idx].spesa += t.amount
      else buckets[idx].vincita += t.amount
    }
    return buckets.map((b) => ({
      ...b,
      spesa: round2(b.spesa),
      vincita: round2(b.vincita),
    }))
  }

  if (period.kind === 'year') {
    // 12 fixed monthly buckets
    const buckets: SpesaVincitaBucket[] = Array.from({ length: 12 }, (_, m) => ({
      label: MONTHS_SHORT[m],
      spesa: 0,
      vincita: 0,
      start: new Date(period.year, m, 1).getTime(),
      end: new Date(period.year, m + 1, 1).getTime(),
    }))
    for (const t of txs) {
      const m = new Date(t.createdAt).getMonth()
      if (t.type === 'spesa') buckets[m].spesa += t.amount
      else buckets[m].vincita += t.amount
    }
    return buckets.map((b) => ({
      ...b,
      spesa: round2(b.spesa),
      vincita: round2(b.vincita),
    }))
  }

  // period 'all': monthly buckets, only active months, chronological
  const byKey = new Map<string, SpesaVincitaBucket>()
  for (const t of txs) {
    const d = new Date(t.createdAt)
    const y = d.getFullYear()
    const m = d.getMonth()
    const key = `${y}-${m}`
    let bucket = byKey.get(key)
    if (!bucket) {
      bucket = {
        label: `${MONTHS_SHORT[m]} ${String(y).slice(2)}`,
        spesa: 0,
        vincita: 0,
        start: new Date(y, m, 1).getTime(),
        end: new Date(y, m + 1, 1).getTime(),
      }
      byKey.set(key, bucket)
    }
    if (t.type === 'spesa') bucket.spesa += t.amount
    else bucket.vincita += t.amount
  }
  return [...byKey.values()]
    .sort((a, b) => a.start - b.start)
    .map((b) => ({ ...b, spesa: round2(b.spesa), vincita: round2(b.vincita) }))
}

function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range))
  const f = range / Math.pow(10, exp)
  let nf: number
  if (round) nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10
  else nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return nf * Math.pow(10, exp)
}

/** "Nice" rounded axis ticks covering [min, max] with ~count divisions. */
export function niceTicks(
  min: number,
  max: number,
  count = 5,
): { ticks: number[]; min: number; max: number } {
  if (!(max - min > 0)) {
    return { ticks: [round2(min)], min, max }
  }
  const range = niceNum(max - min, false)
  const step = niceNum(range / (count - 1), true)
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    ticks.push(round2(v))
  }
  return { ticks, min: round2(niceMin), max: round2(niceMax) }
}

export function betOutcomes(
  bets: Bet[],
  range: Range = { start: -Infinity, end: Infinity },
): BetOutcomes {
  let won = 0
  let lost = 0
  let pending = 0
  for (const b of bets) {
    if (!inRange(b.createdAt, range)) continue
    if (b.status === 'won') won += 1
    else if (b.status === 'lost') lost += 1
    else pending += 1
  }
  const resolved = won + lost
  return { won, lost, pending, winRate: resolved ? won / resolved : 0 }
}
