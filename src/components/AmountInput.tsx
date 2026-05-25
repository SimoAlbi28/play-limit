import { Minus, Plus } from 'lucide-react'
import { useHoldRepeat } from '../hooks/useHoldRepeat'

type Props = {
  value: string
  onChange: (next: string) => void
  presets?: readonly number[]
  tone?: 'spesa' | 'vincita'
  ariaLabel?: string
}

export function normalizeAmount(input: string): string {
  let s = input.replace(/[^\d,.]/g, '')
  const firstSep = s.search(/[,.]/)
  if (firstSep !== -1) {
    s = s.slice(0, firstSep + 1) + s.slice(firstSep + 1).replace(/[,.]/g, '')
  }
  s = s.replace(/^0+(?=\d)/, '')
  if (s.startsWith(',') || s.startsWith('.')) s = '0' + s
  return s
}

export function parseAmount(raw: string): number {
  const n = Number(raw.replace(',', '.').trim())
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * 100) / 100
}

function formatNumber(value: number): string {
  if (value === 0) return ''
  const fixed = Math.round(value * 100) / 100
  return String(fixed).replace('.', ',')
}

function formatPreset(value: number): string {
  return value % 1 === 0
    ? String(value)
    : value.toFixed(2).replace('.', ',').replace(/,?0+$/, '')
}

export function AmountInput({
  value,
  onChange,
  presets,
  tone = 'spesa',
  ariaLabel,
}: Props) {
  const current = parseAmount(value)

  const setAmount = (next: number) => {
    const v = Math.round(Math.max(0, next) * 100) / 100
    onChange(formatNumber(v))
  }

  const step = (delta: number) => setAmount(current + delta)
  const addPreset = (v: number) => setAmount(current + v)

  const dec = useHoldRepeat(() => step(-1))
  const inc = useHoldRepeat(() => step(+1))

  return (
    <div className="amount-input">
      <div className="amount-editor">
        <button
          type="button"
          className="amount-editor__step"
          aria-label="Diminuisci di 1 euro"
          onPointerDown={(e) => {
            e.preventDefault()
            dec.start()
          }}
          onPointerUp={dec.stop}
          onPointerLeave={dec.stop}
          onPointerCancel={dec.stop}
        >
          <Minus size={22} strokeWidth={2.5} />
        </button>

        <div className="amount-editor__input-wrap">
          <span className="amount-editor__currency">€</span>
          <input
            className="amount-editor__input"
            inputMode="decimal"
            placeholder="0"
            aria-label={ariaLabel}
            value={value}
            onChange={(e) => onChange(normalizeAmount(e.target.value))}
          />
        </div>

        <button
          type="button"
          className="amount-editor__step"
          aria-label="Aumenta di 1 euro"
          onPointerDown={(e) => {
            e.preventDefault()
            inc.start()
          }}
          onPointerUp={inc.stop}
          onPointerLeave={inc.stop}
          onPointerCancel={inc.stop}
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      {presets && presets.length > 0 && (
        <div
          className={`amount-presets amount-presets--${tone}`}
          role="group"
          aria-label="Importi rapidi"
        >
          {presets.map((v) => (
            <button
              key={v}
              type="button"
              className="amount-presets__chip"
              onClick={() => addPreset(v)}
            >
              +{formatPreset(v)}
            </button>
          ))}
          <button
            type="button"
            className="amount-presets__chip amount-presets__chip--reset"
            onClick={() => setAmount(0)}
            aria-label="Azzera importo"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}
