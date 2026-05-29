import { niceTicks, type SpesaVincitaBucket } from '../utils/stats'
import { formatEuro } from '../utils/format'

type Props = {
  title: string
  buckets: SpesaVincitaBucket[]
}

const W = 320
const H = 188
const ML = 34
const MR = 8
const MT = 6
const MB = 24

export function BarChart({ title, buckets }: Props) {
  const hasData = buckets.some((b) => b.spesa > 0 || b.vincita > 0)
  if (buckets.length === 0 || !hasData) {
    return (
      <div className="chart-card">
        <p className="chart-card__title">{title}</p>
        <p className="chart-card__empty">Nessun dato in questo periodo</p>
      </div>
    )
  }

  const n = buckets.length
  const rawMax = Math.max(...buckets.flatMap((b) => [b.spesa, b.vincita]), 1)
  const { ticks, max } = niceTicks(0, rawMax, 5)

  const plotL = ML
  const plotR = W - MR
  const plotT = MT
  const baseline = H - MB
  const plotW = plotR - plotL
  const groupW = plotW / n
  const barW = Math.min(26, groupW * 0.34)
  const gap = Math.min(40, groupW * 0.22)

  const h = (v: number) => (v / (max || 1)) * (baseline - plotT)
  const y = (v: number) => baseline - h(v)
  const groupCx = (i: number) => plotL + groupW * (i + 0.5)

  const totalSpesa = buckets.reduce((s, b) => s + b.spesa, 0)
  const totalVincita = buckets.reduce((s, b) => s + b.vincita, 0)

  return (
    <div className="chart-card">
      <p className="chart-card__title">{title}</p>
      <svg
        className="chart-svg chart-svg--static"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={title}
      >
        {/* y grid + labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              className={t === 0 ? 'chart-axis' : 'chart-grid'}
              x1={plotL}
              x2={plotR}
              y1={y(t)}
              y2={y(t)}
            />
            <text className="chart-ylabel" x={plotL - 5} y={y(t) + 3}>
              {Math.round(t)}
            </text>
          </g>
        ))}

        {buckets.map((b, i) => {
          const cx = groupCx(i)
          const sH = h(b.spesa)
          const vH = h(b.vincita)
          return (
            <g key={i}>
              <rect
                className="chart-bar chart-bar--neg"
                x={cx - barW - gap / 2}
                y={baseline - sH}
                width={barW}
                height={sH}
                rx={3}
              />
              <rect
                className="chart-bar chart-bar--pos"
                x={cx + gap / 2}
                y={baseline - vH}
                width={barW}
                height={vH}
                rx={3}
              />
              {n <= 8 && (
                <text className="chart-xlabel" x={cx} y={H - 8} textAnchor="middle">
                  {b.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="bar-totals">
        <span className="bar-totals__period">Totale</span>
        <div className="bar-totals__row">
          <div className="bar-totals__item">
            <span className="bar-totals__name">
              <i className="dot dot--neg" />
              Spese
            </span>
            <strong className="neg">{formatEuro(totalSpesa)}</strong>
          </div>
          <div className="bar-totals__item">
            <span className="bar-totals__name">
              <i className="dot dot--pos" />
              Vincite
            </span>
            <strong className="pos">{formatEuro(totalVincita)}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
