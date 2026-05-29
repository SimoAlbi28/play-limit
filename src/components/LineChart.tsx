import { useScrub } from '../hooks/useScrub'
import { niceTicks, type BalancePoint } from '../utils/stats'
import { formatDate, formatDateShort, formatEuro } from '../utils/format'

type Props = {
  title: string
  points: BalancePoint[]
}

const W = 320
const H = 200
const ML = 38
const MR = 10
const MT = 14
const MB = 26

export function LineChart({ title, points }: Props) {
  const { ref, activeIndex, handlers } = useScrub(points.length, 'nearest')

  if (points.length === 0) {
    return (
      <div className="chart-card">
        <p className="chart-card__title">{title}</p>
        <p className="chart-card__empty">Nessun dato in questo periodo</p>
      </div>
    )
  }

  const values = points.map((p) => p.balance)
  const rawMin = Math.min(...values, 0)
  const rawMax = Math.max(...values, 0)
  const { ticks, min, max } = niceTicks(rawMin, rawMax, 5)
  const range = max - min || 1
  const n = points.length

  const plotL = ML
  const plotR = W - MR
  const plotT = MT
  const plotB = H - MB

  const x = (i: number) =>
    n === 1 ? (plotL + plotR) / 2 : plotL + (i / (n - 1)) * (plotR - plotL)
  const y = (v: number) => plotT + (1 - (v - min) / range) * (plotB - plotT)

  const linePath = points
    .map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.balance).toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${plotB} L${x(0).toFixed(1)},${plotB} Z`

  const last = points[n - 1]
  const active = activeIndex != null ? points[activeIndex] : last
  const tone = active.balance < 0 ? 'neg' : active.balance > 0 ? 'pos' : ''

  // direction of the segment ending at index i (up = green, down = red)
  const segUp = (i: number) => points[i].balance >= points[i - 1].balance
  const dotSign =
    activeIndex == null || n === 1
      ? ''
      : (activeIndex > 0 ? segUp(activeIndex) : segUp(1))
        ? 'pos'
        : 'neg'

  // x-axis tick indices (max ~4 labels)
  const xCount = Math.min(n, 4)
  const xIdx =
    n === 1
      ? [0]
      : Array.from({ length: xCount }, (_, k) =>
          Math.round((k / (xCount - 1)) * (n - 1)),
        )

  return (
    <div className="chart-card">
      <p className="chart-card__title">{title}</p>
      <p className={`chart-card__value ${tone}`}>
        {formatEuro(active.balance, true)}
      </p>
      <p className="chart-card__sub">
        {activeIndex != null ? formatDate(active.t) : 'saldo attuale'}
      </p>
      <svg
        ref={ref}
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={title}
        {...handlers}
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

        {/* x labels */}
        {xIdx.map((i) => (
          <text key={i} className="chart-xlabel" x={x(i)} y={H - 8} textAnchor="middle">
            {formatDateShort(points[i].t)}
          </text>
        ))}

        <path className="chart-area-neutral" d={areaPath} />

        {n === 1 ? (
          <circle className="chart-dot chart-dot--pos" cx={x(0)} cy={y(points[0].balance)} r={4} />
        ) : (
          points.slice(1).map((p, idx) => {
            const i = idx + 1
            return (
              <line
                key={i}
                className={`chart-seg ${segUp(i) ? 'chart-seg--up' : 'chart-seg--down'}`}
                x1={x(i - 1)}
                y1={y(points[i - 1].balance)}
                x2={x(i)}
                y2={y(p.balance)}
              />
            )
          })
        )}

        {activeIndex != null && (
          <g>
            <line
              className="chart-cross"
              x1={x(activeIndex)}
              x2={x(activeIndex)}
              y1={plotT}
              y2={plotB}
              strokeDasharray="4 4"
            />
            <line
              className="chart-cross"
              x1={plotL}
              x2={x(activeIndex)}
              y1={y(active.balance)}
              y2={y(active.balance)}
              strokeDasharray="4 4"
            />
            <circle
              className={`chart-dot chart-dot--${dotSign || 'pos'}`}
              cx={x(activeIndex)}
              cy={y(active.balance)}
              r={5}
            />
          </g>
        )}
      </svg>
    </div>
  )
}
