import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Period } from '../utils/stats'

type Props = {
  period: Period
  onChange: (p: Period) => void
}

const MONTHS = [
  'gennaio',
  'febbraio',
  'marzo',
  'aprile',
  'maggio',
  'giugno',
  'luglio',
  'agosto',
  'settembre',
  'ottobre',
  'novembre',
  'dicembre',
]

const TABS: { kind: Period['kind']; label: string }[] = [
  { kind: 'all', label: 'Tutto' },
  { kind: 'month', label: 'Mese' },
]

export function PeriodFilter({ period, onChange }: Props) {
  const now = new Date()
  const curYear = now.getFullYear()
  const curMonth = now.getMonth()

  const selectKind = (kind: Period['kind']) => {
    if (kind === 'all') onChange({ kind: 'all' })
    else if (kind === 'year') onChange({ kind: 'year', year: curYear })
    else onChange({ kind: 'month', year: curYear, month: curMonth })
  }

  const step = (dir: -1 | 1) => {
    if (period.kind === 'year') {
      onChange({ kind: 'year', year: period.year + dir })
    } else if (period.kind === 'month') {
      const total = period.year * 12 + period.month + dir
      onChange({ kind: 'month', year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 })
    }
  }

  const stepLabel =
    period.kind === 'year'
      ? String(period.year)
      : period.kind === 'month'
        ? `${MONTHS[period.month]} ${period.year}`
        : null

  return (
    <div className="period-filter">
      <div className="period-filter__tabs" role="radiogroup" aria-label="Periodo">
        {TABS.map((t) => (
          <button
            key={t.kind}
            type="button"
            role="radio"
            aria-checked={period.kind === t.kind}
            className={`period-filter__tab ${period.kind === t.kind ? 'is-active' : ''}`}
            onClick={() => selectKind(t.kind)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {stepLabel && (
        <div className="period-filter__stepper">
          <button type="button" onClick={() => step(-1)} aria-label="Periodo precedente">
            <ChevronLeft size={18} strokeWidth={2.4} />
          </button>
          <span className="period-filter__current">{stepLabel}</span>
          <button type="button" onClick={() => step(1)} aria-label="Periodo successivo">
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  )
}
