import { Fragment, useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { SortMode, Transaction } from '../types'
import { formatDayLabel } from '../utils/format'
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

// Chiave del giorno (null per il saldo iniziale, che non ha data).
function dayKeyOf(tx: Transaction): string | null {
  if (tx.kind === 'initial') return null
  const d = new Date(tx.createdAt)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
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
  // Il saldo iniziale resta sempre in fondo, in ogni modalità di ordinamento.
  return [
    ...sorted.filter((t) => t.kind !== 'initial'),
    ...sorted.filter((t) => t.kind === 'initial'),
  ]
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
          {sorted.map((tx, i) => {
            const row = (
              <HistoryRow
                key={tx.id}
                tx={tx}
                isOpen={openId === tx.id}
                onOpenChange={(open) => setOpenId(open ? tx.id : null)}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            )
            // Le linee separatrici per data hanno senso solo in ordine cronologico.
            if (sortMode !== 'date') return row
            const dayKey = dayKeyOf(tx)
            const prevKey = i > 0 ? dayKeyOf(sorted[i - 1]) : null
            const showSep = i === 0 || dayKey !== prevKey
            const label =
              tx.kind === 'initial'
                ? 'Saldo iniziale'
                : formatDayLabel(tx.createdAt)
            return (
              <Fragment key={tx.id}>
                {showSep && (
                  <li className="history__day-sep" aria-hidden="true">
                    <span className="history__day-sep-label">{label}</span>
                  </li>
                )}
                {row}
              </Fragment>
            )
          })}
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
