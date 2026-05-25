import { useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react'
import type { Transaction } from '../types'
import { formatDate, formatEuro } from '../utils/format'

type Props = {
  tx: Transaction
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (id: string) => void
}

const SWIPE_THRESHOLD = 60
const MAX_SWIPE = 110

export function HistoryRow({ tx, isOpen, onOpenChange, onDelete }: Props) {
  const [dragOffset, setDragOffset] = useState<number | null>(null)
  const startX = useRef<number | null>(null)
  const startedOpen = useRef(false)
  const isSpesa = tx.type === 'spesa'
  const Icon = isSpesa ? ArrowDownRight : ArrowUpRight

  const settledOffset = isOpen ? -MAX_SWIPE : 0
  const offset = dragOffset ?? settledOffset
  const dragging = dragOffset !== null

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX
    startedOpen.current = isOpen
    setDragOffset(settledOffset)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    const base = startedOpen.current ? -MAX_SWIPE : 0
    const next = Math.min(0, Math.max(-MAX_SWIPE, base + dx))
    setDragOffset(next)
  }

  const handlePointerUp = () => {
    if (startX.current === null) return
    const current = dragOffset ?? 0
    startX.current = null
    setDragOffset(null)

    if (startedOpen.current) {
      onOpenChange(current <= -SWIPE_THRESHOLD)
    } else {
      onOpenChange(current <= -SWIPE_THRESHOLD)
    }
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
        aria-label="Elimina"
      >
        <Trash2 size={20} strokeWidth={2} />
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
        onPointerCancel={handlePointerUp}
      >
        <span
          className={`history-row__badge history-row__badge--${tx.type}`}
          aria-hidden="true"
        >
          <Icon size={18} strokeWidth={2.5} />
        </span>
        <div className="history-row__meta">
          <span className={`history-row__type history-row__type--${tx.type}`}>
            {isSpesa ? 'Spesa' : 'Vincita'}
          </span>
          <span className="history-row__date">{formatDate(tx.createdAt)}</span>
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
