import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import type { TransactionType } from '../types'
import { useHoldRepeat } from '../hooks/useHoldRepeat'
import { formatEuro } from '../utils/format'

type Props = {
  type: TransactionType
  onCancel: () => void
  onConfirm: (amount: number) => void
}

const PRESETS = [2.5, 5, 10, 15, 20, 50, 100] as const

function parseAmount(raw: string): number {
  const normalized = raw.replace(',', '.').trim()
  if (normalized === '') return 0
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * 100) / 100
}

function formatPreset(value: number): string {
  return value % 1 === 0
    ? String(value)
    : value.toFixed(2).replace('.', ',').replace(/,?0+$/, '')
}

export function AmountDialog({ type, onCancel, onConfirm }: Props) {
  const [raw, setRaw] = useState('0')
  const inputRef = useRef<HTMLInputElement>(null)
  const amount = parseAmount(raw)
  const isSpesa = type === 'spesa'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter' && amount > 0) onConfirm(amount)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [amount, onCancel, onConfirm])

  const setAmount = (next: number) => {
    setRaw(String(Math.round(Math.max(0, next) * 100) / 100))
  }

  const step = (delta: number) => setAmount(amount + delta)
  const addPreset = (v: number) => setAmount(amount + v)

  const dec = useHoldRepeat(() => step(-1))
  const inc = useHoldRepeat(() => step(+1))

  const handleFocus = () => {
    inputRef.current?.select()
  }

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className={`dialog dialog--${type}`}
        role="dialog"
        aria-modal="true"
        aria-label={isSpesa ? 'Aggiungi spesa' : 'Aggiungi vincita'}
      >
        <header className="dialog__header">
          <span className={`pill pill--${type}`}>
            {isSpesa ? 'Spesa' : 'Vincita'}
          </span>
          <button
            type="button"
            className="dialog__close"
            onClick={onCancel}
            aria-label="Chiudi"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

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
            <Minus size={26} strokeWidth={2.5} />
          </button>

          <div className="amount-editor__input-wrap">
            <span className="amount-editor__currency">€</span>
            <input
              ref={inputRef}
              className="amount-editor__input"
              inputMode="decimal"
              autoFocus
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              onFocus={handleFocus}
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
            <Plus size={26} strokeWidth={2.5} />
          </button>
        </div>

        <div
          className={`amount-presets amount-presets--${type}`}
          role="group"
          aria-label="Importi rapidi"
        >
          {PRESETS.map((v) => (
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

        <div className="amount-preview">
          {isSpesa ? '−' : '+'} {formatEuro(amount)}
        </div>

        <div className="dialog__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onCancel}
          >
            Annulla
          </button>
          <button
            type="button"
            className={`btn btn--primary btn--${type}`}
            disabled={amount <= 0}
            onClick={() => onConfirm(amount)}
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  )
}
