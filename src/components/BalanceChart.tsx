import { useId, useRef, useState } from 'react'
import { useScrub } from '../hooks/useScrub'
import { niceTicks, type BalancePoint } from '../utils/stats'
import { formatDate, formatDateShort, formatEuro } from '../utils/format'

type Mode = 'line' | 'candle'

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
const WINDOW = 12 // quanti punti/candele visibili prima di abilitare lo scroll

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export function BalanceChart({ title, points }: Props) {
  const [mode, setMode] = useState<Mode>('line')
  // start frazionario: di default mostra la finestra più recente (clampato sotto)
  const [start, setStart] = useState(Number.MAX_SAFE_INTEGER)
  const clipId = useId()

  const n = points.length
  const visible = Math.min(n, WINDOW)
  const { ref, activeIndex, handlers } = useScrub(
    visible,
    mode === 'candle' ? 'band' : 'nearest',
  )

  if (n === 0) {
    return (
      <div className="chart-card">
        <ChartHead title={title} mode={mode} setMode={setMode} />
        <p className="chart-card__empty">Nessun dato in questo periodo</p>
      </div>
    )
  }

  const maxStart = Math.max(0, n - visible)
  const startF = clamp(start, 0, maxStart)

  const plotL = ML
  const plotR = W - MR
  const plotT = MT
  const plotB = H - MB

  // scala Y fissa su TUTTO lo storico (così il pan non cambia scala)
  const all = points.map((p) => p.balance)
  const { ticks, min, max } = niceTicks(Math.min(...all, 0), Math.max(...all, 0), 5)
  const range = max - min || 1

  const spacing = visible > 1 ? (plotR - plotL) / (visible - 1) : 0
  const x = (a: number) =>
    visible > 1 ? plotL + (a - startF) * spacing : (plotL + plotR) / 2
  const y = (v: number) => plotT + (1 - (v - min) / range) * (plotB - plotT)

  const openOf = (a: number) => (a > 0 ? points[a - 1].balance : 0)
  const segUp = (a: number) => points[a].balance >= points[a - 1].balance

  const last = points[n - 1]
  const activeAbs =
    activeIndex == null ? null : clamp(Math.round(startF) + activeIndex, 0, n - 1)
  const active = activeAbs != null ? points[activeAbs] : last

  // Readout: linea = saldo totale cumulato; candele = variazione della singola operazione.
  let readout = last.balance
  let readoutSub = 'saldo attuale'
  if (activeAbs != null) {
    readoutSub = formatDate(active.t)
    readout = mode === 'candle' ? active.balance - openOf(activeAbs) : active.balance
  }
  const tone = readout < 0 ? 'neg' : readout > 0 ? 'pos' : ''

  const dotSign =
    activeAbs == null
      ? 'pos'
      : mode === 'candle'
        ? active.balance >= openOf(activeAbs)
          ? 'pos'
          : 'neg'
        : activeAbs > 0
          ? segUp(activeAbs)
            ? 'pos'
            : 'neg'
          : 'pos'

  // etichette X (max 4) che seguono con continuità la finestra
  const labelIdxs = [
    ...new Set(
      (visible > 1 ? [0, 1, 2, 3] : [0]).map((k) =>
        clamp(Math.round(startF + (k / 3) * (visible - 1)), 0, n - 1),
      ),
    ),
  ]

  const step = visible > 1 ? spacing : plotR - plotL
  const candleW = Math.min(16, step * 0.6)

  // path linea + area su tutti i punti (poi ritagliata al riquadro)
  const linePath = points
    .map((p, a) => `${a ? 'L' : 'M'}${x(a).toFixed(1)},${y(p.balance).toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${plotB} L${x(0).toFixed(1)},${plotB} Z`

  return (
    <div className="chart-card">
      <ChartHead title={title} mode={mode} setMode={setMode} />
      <p className={`chart-card__value ${tone}`}>{formatEuro(readout, true)}</p>
      <p className="chart-card__sub">{readoutSub}</p>
      <svg
        ref={ref}
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={title}
        {...handlers}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={plotL} y={plotT - 6} width={plotR - plotL} height={plotB - plotT + 12} />
          </clipPath>
        </defs>

        {/* griglia + valori Y (sempre visibili) */}
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

        {/* etichette X */}
        {labelIdxs.map((a) => (
          <text key={a} className="chart-xlabel" x={x(a)} y={H - 8} textAnchor="middle">
            {formatDateShort(points[a].t)}
          </text>
        ))}

        <g clipPath={`url(#${clipId})`}>
          {mode === 'line' ? (
            <>
              <path className="chart-area-neutral" d={areaPath} />
              {n === 1 ? (
                <circle className="chart-dot chart-dot--pos" cx={x(0)} cy={y(points[0].balance)} r={4} />
              ) : (
                points.slice(1).map((p, idx) => {
                  const a = idx + 1
                  return (
                    <line
                      key={a}
                      className={`chart-seg ${segUp(a) ? 'chart-seg--up' : 'chart-seg--down'}`}
                      x1={x(a - 1)}
                      y1={y(points[a - 1].balance)}
                      x2={x(a)}
                      y2={y(p.balance)}
                    />
                  )
                })
              )}
            </>
          ) : (
            points.map((p, a) => {
              const open = openOf(a)
              const close = p.balance
              const up = close >= open
              const top = y(Math.max(open, close))
              const bottom = y(Math.min(open, close))
              return (
                <rect
                  key={a}
                  className={`candle candle--${up ? 'up' : 'down'}`}
                  x={x(a) - candleW / 2}
                  y={top}
                  width={candleW}
                  height={Math.max(1.5, bottom - top)}
                  rx={2}
                />
              )
            })
          )}

          {activeAbs != null && (
            <g>
              <line
                className="chart-cross"
                x1={x(activeAbs)}
                x2={x(activeAbs)}
                y1={plotT}
                y2={plotB}
                strokeDasharray="4 4"
              />
              <line
                className="chart-cross"
                x1={plotL}
                x2={x(activeAbs)}
                y1={y(active.balance)}
                y2={y(active.balance)}
                strokeDasharray="4 4"
              />
              <circle
                className={`chart-dot chart-dot--${dotSign}`}
                cx={x(activeAbs)}
                cy={y(active.balance)}
                r={5}
              />
            </g>
          )}
        </g>
      </svg>

      {maxStart > 0 && (
        <PanBar
          value={startF}
          max={maxStart}
          frac={visible / n}
          onChange={setStart}
        />
      )}
    </div>
  )
}

function PanBar({
  value,
  max,
  frac,
  onChange,
}: {
  value: number
  max: number
  frac: number
  onChange: (v: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  // larghezza del cursore proporzionale a quanto è visibile (min 12% per restare afferrabile)
  const thumbPct = Math.max(12, Math.min(100, frac * 100))
  const avail = 100 - thumbPct
  const leftPct = max > 0 ? (value / max) * avail : 0

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current
    if (!el || max <= 0) return
    const r = el.getBoundingClientRect()
    const thumbW = (thumbPct / 100) * r.width
    const usable = r.width - thumbW
    if (usable <= 0) return
    const pos = Math.max(0, Math.min(usable, clientX - r.left - thumbW / 2))
    onChange((pos / usable) * max)
  }

  return (
    <div
      ref={trackRef}
      className="chart-pan"
      onPointerDown={(e) => {
        dragging.current = true
        trackRef.current?.setPointerCapture(e.pointerId)
        setFromClientX(e.clientX)
      }}
      onPointerMove={(e) => {
        if (dragging.current) setFromClientX(e.clientX)
      }}
      onPointerUp={() => {
        dragging.current = false
      }}
      onPointerCancel={() => {
        dragging.current = false
      }}
    >
      <div
        className="chart-pan__thumb"
        style={{ width: `${thumbPct}%`, left: `${leftPct}%` }}
      />
    </div>
  )
}

function ChartHead({
  title,
  mode,
  setMode,
}: {
  title: string
  mode: Mode
  setMode: (m: Mode) => void
}) {
  return (
    <div className="chart-card__head">
      <p className="chart-card__title">
        {mode === 'candle' ? 'Andamento operazioni' : title}
      </p>
      <div className="chart-toggle" role="radiogroup" aria-label="Tipo grafico">
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'line'}
          className={`chart-toggle__btn ${mode === 'line' ? 'is-active' : ''}`}
          onClick={() => setMode('line')}
        >
          Linea
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'candle'}
          className={`chart-toggle__btn ${mode === 'candle' ? 'is-active' : ''}`}
          onClick={() => setMode('candle')}
        >
          Candele
        </button>
      </div>
    </div>
  )
}
