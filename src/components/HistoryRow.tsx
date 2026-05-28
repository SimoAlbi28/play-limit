import { useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, EyeOff } from 'lucide-react'
import type { Transaction } from '../types'
import { formatDate, formatEuro } from '../utils/format'

type Props = {
  tx: Transaction
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (id: string) => void
  onEdit: (tx: Transaction) => void
}

const SWIPE_THRESHOLD = 60
const MAX_SWIPE = 110
const HIDE_SWIPE = 170
const MAX_OVERSCROLL = 200
const TAP_TOLERANCE = 6

export function HistoryRow({ tx, isOpen, onOpenChange, onDelete, onEdit }: Props) {
  const [dragOffset, setDragOffset] = useState<number | null>(null)
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const startedOpen = useRef(false)
  const maxAbsDx = useRef(0)
  const maxAbsDy = useRef(0)
  const isSpesa = tx.type === 'spesa'
  const isInitial = tx.kind === 'initial'
  const Icon = isSpesa ? ArrowDownRight : ArrowUpRight

  const settledOffset = isOpen ? -MAX_SWIPE : 0
  const offset = dragOffset ?? settledOffset
  const dragging = dragOffset !== null

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX
    startY.current = e.clientY
    startedOpen.current = isOpen
    maxAbsDx.current = 0
    maxAbsDy.current = 0
    setDragOffset(settledOffset)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startX.current === null || startY.current === null) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    if (Math.abs(dx) > maxAbsDx.current) maxAbsDx.current = Math.abs(dx)
    if (Math.abs(dy) > maxAbsDy.current) maxAbsDy.current = Math.abs(dy)
    const base = startedOpen.current ? -MAX_SWIPE : 0
    const raw = base + dx
    let next: number
    if (raw >= 0) {
      next = 0
    } else if (raw >= -MAX_SWIPE) {
      next = raw
    } else {
      const extra = -MAX_SWIPE - raw
      const eased = MAX_OVERSCROLL * (1 - Math.exp(-extra / 80))
      next = -MAX_SWIPE - eased
    }
    setDragOffset(next)
  }

  const handlePointerUp = () => {
    if (startX.current === null) return
    const current = dragOffset ?? 0
    const movedX = maxAbsDx.current
    const movedY = maxAbsDy.current
    startX.current = null
    startY.current = null
    setDragOffset(null)

    if (movedX <= TAP_TOLERANCE && movedY <= TAP_TOLERANCE) {
      if (startedOpen.current) {
        handleDelete()
      } else {
        onEdit(tx)
      }
      return
    }

    if (current <= -HIDE_SWIPE) {
      handleDelete()
      return
    }

    onOpenChange(current <= -SWIPE_THRESHOLD)
  }

  const handlePointerCancel = () => {
    startX.current = null
    startY.current = null
    maxAbsDx.current = 0
    maxAbsDy.current = 0
    setDragOffset(null)
  }

  const handleDelete = () => {
    onOpenChange(false)
    onDelete(tx.id)
  }

  return (
    <li className="history-row" data-row-id={tx.id}>
      <button
        type="button"
        className="history-row__delete"
        onClick={handleDelete}
        aria-label="Nascondi"
      >
        <EyeOff size={20} strokeWidth={2} />
      </button>
      <div
        className="history-row__content"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : undefined,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <span
          className={`history-row__badge history-row__badge--${tx.type}`}
          aria-hidden="true"
        >
          <Icon size={18} strokeWidth={2.5} />
        </span>
        <div className="history-row__meta">
          <span className={`history-row__type history-row__type--${tx.type}`}>
            {isInitial ? 'Saldo iniziale' : isSpesa ? 'Spesa' : 'Vincita'}
          </span>
          {!isInitial && tx.description && tx.description.trim() && (
            <span className="history-row__desc">{tx.description}</span>
          )}
          {!isInitial && (
            <span className="history-row__date">
              {formatDate(tx.createdAt)}
            </span>
          )}
        </div>
        <div
          className={`history-row__amount history-row__amount--${tx.type}`}
        >
          {isSpesa ? '−' : '+'} {formatEuro(tx.amount)}
        </div>
      </div>
    </li>
  )
}
