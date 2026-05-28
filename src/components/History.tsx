import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { SortMode, Transaction } from '../types'
import { HistoryRow } from './HistoryRow'
import { SortFilter } from './SortFilter'

type Props = {
  transactions: Transaction[]
  sortMode: SortMode
  onSortChange: (m: SortMode) => void
  onDelete: (id: string) => void
  onEdit: (tx: Transaction) => void
  hiddenCount: number
  onRestoreHidden: () => void
}

function sortTransactions(list: Transaction[], mode: SortMode): Transaction[] {
  const sorted = [...list]
  switch (mode) {
    case 'date':
      sorted.sort((a, b) => b.createdAt - a.createdAt)
      break
    case 'loss':
      sorted.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'spesa' ? -1 : 1
        if (a.type === 'spesa') return b.amount - a.amount
        return a.amount - b.amount
      })
      break
    case 'win':
      sorted.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'vincita' ? -1 : 1
        if (a.type === 'vincita') return b.amount - a.amount
        return a.amount - b.amount
      })
      break
  }
  return sorted
}

export function History({
  transactions,
  sortMode,
  onSortChange,
  onDelete,
  onEdit,
  hiddenCount,
  onRestoreHidden,
}: Props) {
  const sorted = useMemo(
    () => sortTransactions(transactions.filter((t) => !t.hidden), sortMode),
    [transactions, sortMode],
  )

  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (!openId) return
    const handler = (e: PointerEvent) => {
      const row = document.querySelector(`[data-row-id="${openId}"]`)
      if (row && !row.contains(e.target as Node)) {
        setOpenId(null)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [openId])

  useEffect(() => {
    if (openId && !sorted.some((t) => t.id === openId)) {
      setOpenId(null)
    }
  }, [sorted, openId])

  return (
    <section className="history">
      <header className="history__header">
        <h2 className="history__title">Storico</h2>
        <SortFilter value={sortMode} onChange={onSortChange} />
      </header>

      {sorted.length === 0 ? (
        <div className="history__empty">
          Nessuna operazione. Aggiungi una spesa o una vincita per cominciare.
        </div>
      ) : (
        <ul className="history__list">
          {sorted.map((tx) => (
            <HistoryRow
              key={tx.id}
              tx={tx}
              isOpen={openId === tx.id}
              onOpenChange={(open) => setOpenId(open ? tx.id : null)}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}
      {sorted.length > 0 && (
        <p className="history__hint">
          <span>Scorri a sinistra per nascondere la riga.</span>
          <span className="history__hint-sub">
            Vai nella cronologia per eliminarle una a una.
          </span>
          <span className="history__hint-sub">
            Vai nelle impostazioni per resettare l'app da 0.
          </span>
        </p>
      )}
      <button
        type="button"
        className={`history__restore ${
          hiddenCount > 0 ? 'history__restore--active' : ''
        }`}
        onClick={onRestoreHidden}
        disabled={hiddenCount === 0}
      >
        <RotateCcw size={16} strokeWidth={2.3} />
        Ripristina nascosti ({hiddenCount})
      </button>
    </section>
  )
}
