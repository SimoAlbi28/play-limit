import { useEffect, useRef, useState } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { AmountInput, parseAmount } from './AmountInput'

type BetDialogData = {
  description: string
  stake: number
  potentialWin: number
  createdAt: number
}

type Props = {
  initial?: BetDialogData
  onCancel: () => void
  onConfirm: (data: BetDialogData) => void
}

const STAKE_PRESETS = [2.5, 5, 10, 15, 20, 50, 100] as const
const WIN_PRESETS = [5, 10, 20, 50, 100, 250, 500] as const
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

function formatAmount(value: number): string {
  if (!value) return ''
  return String(Math.round(value * 100) / 100).replace('.', ',')
}

export function BetDialog({ initial, onCancel, onConfirm }: Props) {
  const isEdit = !!initial
  const initialDateISO = initial ? timestampToISO(initial.createdAt) : todayISO()
  const [description, setDescription] = useState(initial?.description ?? '')
  const [stakeRaw, setStakeRaw] = useState(formatAmount(initial?.stake ?? 0))
  const [winRaw, setWinRaw] = useState(
    formatAmount(initial?.potentialWin ?? 0),
  )
  const [date, setDate] = useState(initialDateISO)
  const descRef = useRef<HTMLTextAreaElement>(null)

  const stake = parseAmount(stakeRaw)
  const win = parseAmount(winRaw)
  const valid = stake > 0 && win > 0

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
      initial && date === initialDateISO
        ? initial.createdAt
        : isoToTimestampNow(date, initial?.createdAt ?? Date.now())
    onConfirm({
      description: description.trim(),
      stake,
      potentialWin: win,
      createdAt,
    })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter' && valid && document.activeElement?.tagName !== 'TEXTAREA') {
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
        aria-label={isEdit ? 'Modifica scommessa' : 'Nuova scommessa'}
      >
        <header className="dialog__header">
          <span className="pill pill--bet">
            {isEdit ? 'Modifica scommessa' : 'Nuova scommessa'}
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

        <div className="bet-form">
          <div className="bet-field bet-field--spesa">
            <span className="bet-field__label">Spesa</span>
            <AmountInput
              value={stakeRaw}
              onChange={setStakeRaw}
              presets={STAKE_PRESETS}
              tone="spesa"
              ariaLabel="Importo spesa"
            />
          </div>

          <div className="bet-field bet-field--vincita">
            <span className="bet-field__label">Potenziale vincita</span>
            <AmountInput
              value={winRaw}
              onChange={setWinRaw}
              presets={WIN_PRESETS}
              tone="vincita"
              ariaLabel="Potenziale vincita"
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
                placeholder="es. Inter vs Milan"
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
            {isEdit ? 'Salva' : 'Aggiungi'}
          </button>
        </div>
      </div>
    </div>
  )
}
