import { useState } from 'react'
import type { BetOutcomes } from '../utils/stats'

type Props = {
  title: string
  outcomes: BetOutcomes
}

const R = 46
const C = 2 * Math.PI * R
const STROKE = 16
const CENTER = 60

const SEG_CLASS = ['chart-seg--pos', 'chart-seg--neg', 'chart-seg--pending']
const LABELS = ['Vinte', 'Perse', 'In sospeso']
const DOT_CLASS = ['dot--pos', 'dot--neg', 'dot--pending']

export function DonutChart({ title, outcomes }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const counts = [outcomes.won, outcomes.lost, outcomes.pending]
  const total = counts.reduce((a, b) => a + b, 0)

  if (total === 0) {
    return (
      <div className="chart-card">
        <p className="chart-card__title">{title}</p>
        <p className="chart-card__empty">Nessuna scommessa in questo periodo</p>
      </div>
    )
  }

  let offset = 0
  const segments = counts.map((count, i) => {
    const len = (count / total) * C
    const seg = { i, count, len, dash: offset }
    offset += len
    return seg
  })

  const centerMain =
    selected != null
      ? String(counts[selected])
      : `${Math.round(outcomes.winRate * 100)}%`
  const centerSub =
    selected != null
      ? `${LABELS[selected]} · ${Math.round((counts[selected] / total) * 100)}%`
      : 'win rate'

  const toggle = (i: number) => setSelected(selected === i ? null : i)

  return (
    <div className="chart-card">
      <p className="chart-card__title">{title}</p>
      <div className="donut-wrap">
        <svg viewBox="0 0 120 120" className="donut-svg" role="img" aria-label={title}>
          <circle
            className="donut-track"
            cx={CENTER}
            cy={CENTER}
            r={R}
            fill="none"
            strokeWidth={STROKE}
          />
          {segments.map((s) =>
            s.count > 0 ? (
              <circle
                key={s.i}
                className={`chart-seg ${SEG_CLASS[s.i]}`}
                cx={CENTER}
                cy={CENTER}
                r={R}
                fill="none"
                strokeWidth={selected === s.i ? STROKE + 4 : STROKE}
                strokeDasharray={`${s.len} ${C - s.len}`}
                strokeDashoffset={-s.dash}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                opacity={selected != null && selected !== s.i ? 0.35 : 1}
                onClick={() => toggle(s.i)}
              />
            ) : null,
          )}
          <text
            className="donut-center"
            x={CENTER}
            y={CENTER - 2}
            textAnchor="middle"
          >
            {centerMain}
          </text>
          <text className="donut-center-sub" x={CENTER} y={CENTER + 15} textAnchor="middle">
            {centerSub}
          </text>
        </svg>
      </div>
      <div className="chart-legend">
        {LABELS.map((label, i) => (
          <button
            key={i}
            type="button"
            className={`chart-legend__btn ${selected === i ? 'is-active' : ''}`}
            onClick={() => toggle(i)}
          >
            <i className={`dot ${DOT_CLASS[i]}`} />
            {label} ({counts[i]})
          </button>
        ))}
      </div>
    </div>
  )
}
