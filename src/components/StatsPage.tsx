import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Bet, Transaction } from '../types'
import {
  balanceSeries,
  betOutcomes,
  periodRange,
  spesaVincitaBuckets,
  type Period,
} from '../utils/stats'
import { PeriodFilter } from './PeriodFilter'
import { LineChart } from './LineChart'
import { BarChart } from './BarChart'
import { DonutChart } from './DonutChart'

type Props = {
  transactions: Transaction[]
  bets: Bet[]
  onBack: () => void
}

export function StatsPage({ transactions, bets, onBack }: Props) {
  const [period, setPeriod] = useState<Period>({ kind: 'all' })

  const { series, buckets, outcomes } = useMemo(() => {
    const range = periodRange(period)
    return {
      series: balanceSeries(transactions, range),
      buckets: spesaVincitaBuckets(transactions, period),
      outcomes: betOutcomes(bets, range),
    }
  }, [transactions, bets, period])

  return (
    <div className="settings">
      <header className="topbar">
        <button
          type="button"
          className="topbar__icon"
          onClick={onBack}
          aria-label="Indietro"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>
        <h1 className="topbar__title">Statistiche</h1>
        <span className="topbar__icon topbar__icon--placeholder" />
      </header>

      <PeriodFilter period={period} onChange={setPeriod} />

      <div className="stats-charts">
        <LineChart title="Andamento del saldo" points={series} />
        <BarChart title="Spese vs Vincite" buckets={buckets} />
        <DonutChart title="Esiti scommesse" outcomes={outcomes} />
      </div>
    </div>
  )
}
