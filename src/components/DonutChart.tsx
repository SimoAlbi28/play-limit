import { useState } from 'react'
import type { BetOutcomes } from '../utils/stats'

type Props = {
  title: string
  outcomes: BetOutcomes
}

const R = 45
const C = 2 * Math.PI * R
const STROKE = 23
const CENTER = 60
const RI = R - STROKE / 2
const RO = R + STROKE / 2

// punto sul cerchio a una data posizione lungo il tracciato (0 = alto, orario)
function pointAt(lenPos: number, radius: number): [number, number] {
  const ang = ((-90 + (lenPos / C) * 360) * Math.PI) / 180
  return [CENTER + radius * Math.cos(ang), CENTER + radius * Math.sin(ang)]
}

const SEG_CLASS = ['donut-seg--pos', 'donut-seg--neg', 'donut-seg--pending']
const LABELS = ['Vinte', 'Perse', 'In sospeso']
const DOT_CLASS = ['dot--pos', 'dot--neg', 'dot--pending']

type Segment = { i: number; count: number; len: number; dash: number }

function Donut({
  segments,
  caption,
  defaultMain,
  defaultSub,
  selMain,
  selSub,
}: {
  segments: Segment[]
  caption: string
  defaultMain: string
  defaultSub: string
  selMain: (i: number) => string
  selSub: (i: number) => string
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const toggle = (i: number) => setSelected(selected === i ? null : i)

  const main = selected != null ? selMain(selected) : defaultMain
  const sub = selected != null ? selSub(selected) : defaultSub

  return (
    <div className="donut-item">
      <svg viewBox="0 0 120 120" className="donut-svg" role="img" aria-label={caption}>
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
              className={`donut-seg ${SEG_CLASS[s.i]}`}
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

        {/* linee nere dritte ai confini tra gli spicchi */}
        {segments.filter((s) => s.count > 0).length > 1 &&
          segments
            .filter((s) => s.count > 0)
            .map((s) => {
              const [x1, y1] = pointAt(s.dash, RI)
              const [x2, y2] = pointAt(s.dash, RO)
              return (
                <line
                  key={`sep-${s.i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#000000"
                  strokeWidth={2}
                  style={{ pointerEvents: 'none' }}
                />
              )
            })}
        <text className="donut-center" x={CENTER} y={CENTER - 2} textAnchor="middle">
          {main}
        </text>
        <text className="donut-center-sub" x={CENTER} y={CENTER + 15} textAnchor="middle">
          {sub}
        </text>
      </svg>
      <span className="donut-caption">{caption}</span>
    </div>
  )
}

export function DonutChart({ title, outcomes }: Props) {
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

  // Ordine orario dall'alto: perse (destra), in sospeso (basso), vinte (sinistra).
  const ORDER = [1, 2, 0]
  let offset = 0
  const segments: Segment[] = []
  for (const i of ORDER) {
    const len = (counts[i] / total) * C
    segments.push({ i, count: counts[i], len, dash: offset })
    offset += len
  }

  const pct = (i: number) => `${Math.round((counts[i] / total) * 100)}%`

  return (
    <div className="chart-card">
      <p className="chart-card__title">{title}</p>
      <div className="donut-pair">
        <Donut
          segments={segments}
          caption="Win rate"
          defaultMain={`${Math.round(outcomes.winRate * 100)}%`}
          defaultSub="win rate"
          selMain={pct}
          selSub={(i) => LABELS[i]}
        />
        <span className="donut-divider" aria-hidden="true" />
        <Donut
          segments={segments}
          caption="Schedine totali"
          defaultMain={String(total)}
          defaultSub="schedine"
          selMain={(i) => String(counts[i])}
          selSub={(i) => LABELS[i]}
        />
      </div>
      <div className="chart-legend">
        {LABELS.map((label, i) => (
          <span key={i}>
            <i className={`dot ${DOT_CLASS[i]}`} />
            {label} ({counts[i]})
          </span>
        ))}
      </div>
    </div>
  )
}
