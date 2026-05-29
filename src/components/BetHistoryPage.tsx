import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckSquare,
  Square,
  Trash2,
  Wallet,
  X,
} from 'lucide-react'
import type { HistoryEntry } from '../App'
import { formatDate, formatEuro } from '../utils/format'

type Props = {
  entries: HistoryEntry[]
  onBack: () => void
  onRemoveEntries: (ids: string[]) => void
}

export function BetHistoryPage({ entries, onBack, onRemoveEntries }: Props) {
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)

  const allSelected = useMemo(
    () => entries.length > 0 && selectedIds.size === entries.length,
    [entries, selectedIds],
  )

  const enterSelection = () => {
    setSelectionMode(true)
    setSelectedIds(new Set())
  }

  const exitSelection = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(entries.map((e) => e.id)))
  }

  const openConfirm = () => {
    if (selectedIds.size === 0) return
    setConfirmOpen(true)
  }

  const cancelConfirm = () => {
    setConfirmOpen(false)
  }

  const handleDeleteConfirmed = () => {
    onRemoveEntries(Array.from(selectedIds))
    setConfirmOpen(false)
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const renderInner = (entry: HistoryEntry, checked: boolean) => {
    if (entry.kind === 'bet') {
      const b = entry.bet
      const displayStatus = b.status === 'pending' ? 'lost' : b.status
      const statusLabel = b.status === 'won' ? 'Presa' : 'Persa'
      return (
        <>
          {selectionMode && (
            <span
              className={`bet-history__check ${checked ? 'is-checked' : ''}`}
              aria-hidden="true"
            >
              {checked ? (
                <CheckSquare size={20} strokeWidth={2.2} />
              ) : (
                <Square size={20} strokeWidth={2.2} />
              )}
            </span>
          )}
          <span
            className={`bet-history__status bet-history__status--${displayStatus}`}
          >
            {statusLabel}
          </span>
          <div className="bet-history__meta">
            {b.description.trim() && (
              <span className="bet-history__desc">{b.description}</span>
            )}
            <span className="bet-history__date">
              {formatDate(b.resolvedAt ?? b.createdAt)}
            </span>
          </div>
          <div className="bet-history__amounts">
            <span className="bet-history__stake">−{formatEuro(b.stake)}</span>
            {b.status === 'won' && (
              <span className="bet-history__win">
                +{formatEuro(b.potentialWin)}
              </span>
            )}
          </div>
        </>
      )
    }
    const t = entry.tx
    const signed = t.type === 'vincita' ? t.amount : -t.amount
    const isInitial = t.kind === 'initial'
    return (
      <>
        {selectionMode && (
          <span
            className={`bet-history__check ${checked ? 'is-checked' : ''}`}
            aria-hidden="true"
          >
            {checked ? (
              <CheckSquare size={20} strokeWidth={2.2} />
            ) : (
              <Square size={20} strokeWidth={2.2} />
            )}
          </span>
        )}
        {isInitial ? (
          <span className="bet-history__status bet-history__status--initial">
            <Wallet size={14} strokeWidth={2.4} />
            Saldo iniziale
          </span>
        ) : (
          <span
            className={`bet-history__status bet-history__status--${t.type}`}
          >
            {t.type === 'spesa' ? 'Spesa' : 'Vincita'}
          </span>
        )}
        <div className="bet-history__meta">
          {t.description && t.description.trim() && (
            <span className="bet-history__desc">{t.description}</span>
          )}
          <span className="bet-history__date">{formatDate(t.createdAt)}</span>
        </div>
        <div className="bet-history__amounts">
          <span
            className={
              signed >= 0 ? 'bet-history__win' : 'bet-history__stake'
            }
          >
            {formatEuro(signed, true)}
          </span>
        </div>
      </>
    )
  }

  return (
    <div className="settings bet-history-view">
      <header className="topbar">
        <button
          type="button"
          className="topbar__icon"
          onClick={onBack}
          aria-label="Indietro"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>
        <h1 className="topbar__title">Cronologia scommesse</h1>
        <span className="topbar__icon topbar__icon--placeholder" />
      </header>

      {entries.length === 0 ? (
        <p className="bet-history__empty">
          Non hai ancora aggiunto nessuna scommessa.
        </p>
      ) : (
        <ul className="bet-history__list">
          {entries.map((entry) => {
            const checked = selectedIds.has(entry.id)
            const statusClass =
              entry.kind === 'bet'
                ? entry.bet.status === 'pending'
                  ? 'lost'
                  : entry.bet.status
                : entry.tx.kind === 'initial'
                  ? 'initial'
                  : entry.tx.type

            const className = `bet-history__row bet-history__row--${statusClass} ${
              entry.kind === 'bet' && entry.bet.status === 'pending'
                ? 'bet-history__row--pending'
                : ''
            } ${selectionMode ? 'bet-history__row--selectable' : ''} ${
              checked ? 'is-selected' : ''
            }`
            return selectionMode ? (
              <li key={entry.id} className="bet-history__row-wrap">
                <button
                  type="button"
                  className={className}
                  onClick={() => toggleOne(entry.id)}
                  aria-pressed={checked}
                >
                  {renderInner(entry, checked)}
                </button>
              </li>
            ) : (
              <li key={entry.id} className={className}>
                {renderInner(entry, checked)}
              </li>
            )
          })}
        </ul>
      )}

      {entries.length > 0 && (
        <div
          className={`bet-history-toolbar ${
            selectionMode ? 'bet-history-toolbar--selection' : ''
          }`}
        >
          {!selectionMode ? (
            <button
              type="button"
              className="bet-history-toolbar__trash"
              onClick={enterSelection}
              aria-label="Seleziona voci da eliminare"
            >
              <Trash2 size={20} strokeWidth={2.2} />
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--cancel"
                onClick={exitSelection}
              >
                Annulla
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={toggleAll}
                aria-pressed={allSelected}
              >
                Tutti
              </button>
              <button
                type="button"
                className="btn btn--delete"
                disabled={selectedIds.size === 0}
                onClick={openConfirm}
              >
                <Trash2 size={16} strokeWidth={2.4} />
                Elimina ({selectedIds.size})
              </button>
            </>
          )}
        </div>
      )}

      {confirmOpen && (
        <div
          className="dialog-backdrop dialog-backdrop--center"
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelConfirm()
          }}
        >
          <div
            className="dialog dialog--bet dialog--confirm"
            role="dialog"
            aria-modal="true"
            aria-label="Conferma eliminazione"
          >
            <header className="dialog__header">
              <span className="pill pill--danger">Conferma eliminazione</span>
              <button
                type="button"
                className="dialog__close"
                onClick={cancelConfirm}
                aria-label="Chiudi"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="bet-form">
              <div className="confirm-block">
                <p className="confirm-block__warning">
                  <AlertTriangle size={20} strokeWidth={2.2} />
                  <span>
                    Stai per eliminare{' '}
                    <strong>
                      {selectedIds.size} voc
                      {selectedIds.size === 1 ? 'e' : 'i'}
                    </strong>
                    . Questa operazione è <strong>irreversibile</strong>: i dati
                    non potranno essere recuperati.
                  </span>
                </p>
              </div>
            </div>

            <div className="dialog__actions dialog__actions--sticky">
              <button
                type="button"
                className="btn btn--cancel"
                onClick={cancelConfirm}
              >
                Annulla
              </button>
              <button
                type="button"
                className="btn btn--delete"
                onClick={handleDeleteConfirmed}
              >
                <Trash2 size={16} strokeWidth={2.4} />
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
