import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, RotateCcw, X } from 'lucide-react'
import { AmountInput, parseAmount } from './AmountInput'
import { formatEuro } from '../utils/format'

type Props = {
  currentBalance: number
  onCancel: () => void
  onConfirm: (data: {
    newBalance: number
    createdAt: number
    description: string
  }) => void
}

const PRESETS = [10, 50, 100, 250, 500, 1000] as const
const DESC_MAX = 150

function formatAmount(value: number): string {
  if (!value) return ''
  return String(Math.round(value * 100) / 100).replace('.', ',')
}

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function isoToTimestampNow(iso: string, fallback: number = Date.now()): number {
  if (!iso) return fallback
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return fallback
  const now = new Date()
  return new Date(
    y,
    m - 1,
    d,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  ).getTime()
}

export function BalanceDialog({
  currentBalance,
  onCancel,
  onConfirm,
}: Props) {
  const [raw, setRaw] = useState(formatAmount(Math.abs(currentBalance)))
  const [sign, setSign] = useState<'+' | '-'>(
    currentBalance < 0 ? '-' : '+',
  )
  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const descRef = useRef<HTMLTextAreaElement>(null)

  const amount = parseAmount(raw)
  const target = sign === '+' ? amount : -amount
  const diff = Math.round((target - currentBalance) * 100) / 100

  useEffect(() => {
    const el = descRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [description])

  useEffect(() => {
    const { body, documentElement } = document
    const scrollY = window.scrollY
    const prevBodyOverflow = body.style.overflow
    const prevBodyPosition = body.style.position
    const prevBodyTop = body.style.top
    const prevBodyWidth = body.style.width
    const prevHtmlOverflow = documentElement.style.overflow
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    documentElement.style.overflow = 'hidden'
    return () => {
      body.style.overflow = prevBodyOverflow
      body.style.position = prevBodyPosition
      body.style.top = prevBodyTop
      body.style.width = prevBodyWidth
      documentElement.style.overflow = prevHtmlOverflow
      window.scrollTo(0, scrollY)
    }
  }, [])

  const handleConfirm = () => {
    onConfirm({
      newBalance: target,
      createdAt: isoToTimestampNow(date),
      description: description.trim(),
    })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (
        e.key === 'Enter' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        handleConfirm()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className="dialog dialog--bet"
        role="dialog"
        aria-modal="true"
        aria-label="Imposta saldo"
      >
        <header className="dialog__header">
          <span className="pill pill--bet">Imposta saldo</span>
          <button
            type="button"
            className="dialog__close"
            onClick={onCancel}
            aria-label="Chiudi"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        <div className="bet-form">
          <div className="bet-field">
            <span className="bet-field__label">Segno</span>
            <div className="sign-toggle" role="radiogroup" aria-label="Segno">
              <button
                type="button"
                role="radio"
                aria-checked={sign === '-'}
                className={`sign-toggle__btn sign-toggle__btn--neg ${
                  sign === '-' ? 'is-active' : ''
                }`}
                onClick={() => setSign('-')}
              >
                <Minus size={18} strokeWidth={2.6} />
                <span>Negativo</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={sign === '+'}
                className={`sign-toggle__btn sign-toggle__btn--pos ${
                  sign === '+' ? 'is-active' : ''
                }`}
                onClick={() => setSign('+')}
              >
                <Plus size={18} strokeWidth={2.6} />
                <span>Positivo</span>
              </button>
            </div>
          </div>

          <div
            className={`bet-field ${
              sign === '+' ? 'bet-field--vincita' : 'bet-field--spesa'
            }`}
          >
            <span className="bet-field__label">Saldo</span>
            <AmountInput
              value={raw}
              onChange={setRaw}
              presets={PRESETS}
              tone={sign === '+' ? 'vincita' : 'spesa'}
              ariaLabel="Importo saldo"
            />
          </div>

          <div className="bet-field">
            <span className="bet-field__label">Data</span>
            <div className="bet-field__row">
              <input
                className="bet-field__input bet-field__input--date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button
                type="button"
                className="bet-field__reset"
                onClick={() => setDate(todayISO())}
                aria-label="Reimposta data a oggi"
                disabled={date === todayISO()}
              >
                <RotateCcw size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className="bet-field">
            <span className="bet-field__label">
              Descrizione
              <span className="bet-field__counter">
                {description.length}/{DESC_MAX}
              </span>
            </span>
            <div className="bet-field__row">
              <textarea
                ref={descRef}
                className="bet-field__input bet-field__input--text"
                placeholder="es. Saldo iniziale"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={DESC_MAX}
                rows={1}
              />
              <button
                type="button"
                className="bet-field__reset"
                onClick={() => setDescription('')}
                aria-label="Azzera descrizione"
                disabled={description.length === 0}
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className="bet-field">
            <span className="bet-field__label">Riepilogo</span>
            <div className="balance-recap">
              <div className="balance-recap__row">
                <span>Saldo attuale</span>
                <strong>{formatEuro(currentBalance, true)}</strong>
              </div>
              <div className="balance-recap__row">
                <span>Nuovo saldo</span>
                <strong
                  className={
                    target > 0
                      ? 'balance-recap__value--pos'
                      : target < 0
                        ? 'balance-recap__value--neg'
                        : ''
                  }
                >
                  {formatEuro(target, true)}
                </strong>
              </div>
              {diff !== 0 && (
                <div className="balance-recap__row balance-recap__row--diff">
                  <span>
                    {diff > 0
                      ? 'Verrà aggiunta una vincita di'
                      : 'Verrà aggiunta una spesa di'}
                  </span>
                  <strong
                    className={
                      diff > 0
                        ? 'balance-recap__value--pos'
                        : 'balance-recap__value--neg'
                    }
                  >
                    {formatEuro(Math.abs(diff))}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dialog__actions dialog__actions--sticky">
          <button
            type="button"
            className="btn btn--cancel"
            onClick={onCancel}
          >
            Annulla
          </button>
          <button
            type="button"
            className="btn btn--primary btn--bet"
            disabled={diff === 0}
            onClick={handleConfirm}
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  )
}
