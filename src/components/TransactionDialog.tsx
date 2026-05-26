import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, RotateCcw, X } from 'lucide-react'
import type { Transaction } from '../types'
import { AmountInput, parseAmount } from './AmountInput'

type Props = {
  tx: Transaction
  onCancel: () => void
  onConfirm: (patch: {
    amount: number
    createdAt: number
    description?: string
    type?: 'spesa' | 'vincita'
  }) => void
}

const SPESA_PRESETS = [2.5, 5, 10, 15, 20, 50, 100] as const
const VINCITA_PRESETS = [5, 10, 20, 50, 100, 250, 500] as const
const DESC_MAX = 150

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function timestampToISO(ts: number): string {
  const d = new Date(ts)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function isoToTimestamp(iso: string, fallback: number): number {
  if (!iso) return fallback
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return fallback
  const base = new Date(fallback)
  return new Date(
    y,
    m - 1,
    d,
    base.getHours(),
    base.getMinutes(),
    base.getSeconds(),
  ).getTime()
}

function formatAmount(value: number): string {
  if (!value) return ''
  return String(Math.round(value * 100) / 100).replace('.', ',')
}

export function TransactionDialog({ tx, onCancel, onConfirm }: Props) {
  const isInitial = tx.kind === 'initial'
  const initialDateISO = timestampToISO(tx.createdAt)
  const [type, setType] = useState<'spesa' | 'vincita'>(tx.type)
  const [raw, setRaw] = useState(formatAmount(tx.amount))
  const [date, setDate] = useState(initialDateISO)
  const [description, setDescription] = useState(tx.description ?? '')
  const descRef = useRef<HTMLTextAreaElement>(null)

  const amount = parseAmount(raw)
  const valid = amount > 0

  const presets = type === 'spesa' ? SPESA_PRESETS : VINCITA_PRESETS
  const tone = type
  const pillLabel = isInitial
    ? 'Modifica saldo iniziale'
    : type === 'spesa'
      ? 'Modifica spesa'
      : 'Modifica vincita'
  const pillClass =
    type === 'spesa' ? 'pill pill--spesa' : 'pill pill--vincita'

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
    if (!valid) return
    const createdAt =
      date === initialDateISO ? tx.createdAt : isoToTimestamp(date, tx.createdAt)
    onConfirm({
      amount,
      createdAt,
      description: isInitial ? undefined : description.trim(),
      type: isInitial ? type : tx.type,
    })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (
        e.key === 'Enter' &&
        valid &&
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
        aria-label={pillLabel}
      >
        <header className="dialog__header">
          <span className={pillClass}>{pillLabel}</span>
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
          {isInitial && (
            <div className="bet-field">
              <span className="bet-field__label">Segno</span>
              <div className="sign-toggle" role="radiogroup" aria-label="Segno">
                <button
                  type="button"
                  role="radio"
                  aria-checked={type === 'spesa'}
                  className={`sign-toggle__btn sign-toggle__btn--neg ${
                    type === 'spesa' ? 'is-active' : ''
                  }`}
                  onClick={() => setType('spesa')}
                >
                  <Minus size={18} strokeWidth={2.6} />
                  <span>Negativo</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={type === 'vincita'}
                  className={`sign-toggle__btn sign-toggle__btn--pos ${
                    type === 'vincita' ? 'is-active' : ''
                  }`}
                  onClick={() => setType('vincita')}
                >
                  <Plus size={18} strokeWidth={2.6} />
                  <span>Positivo</span>
                </button>
              </div>
            </div>
          )}

          <div className={`bet-field bet-field--${tone}`}>
            <span className="bet-field__label">
              {isInitial ? 'Saldo' : type === 'spesa' ? 'Spesa' : 'Vincita'}
            </span>
            <AmountInput
              value={raw}
              onChange={setRaw}
              presets={presets}
              tone={tone}
              ariaLabel="Importo"
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

          {!isInitial && (
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
                  placeholder="…"
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
          )}
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
            disabled={!valid}
            onClick={handleConfirm}
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  )
}
