import { ArrowLeft } from 'lucide-react'
import type { Bet } from '../types'
import { formatDate, formatEuro } from '../utils/format'

type Props = {
  bets: Bet[]
  onBack: () => void
}

export function BetHistoryPage({ bets, onBack }: Props) {
  return (
    <div className="settings">
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

      {bets.length === 0 ? (
        <p className="bet-history__empty">
          Non hai ancora chiuso nessuna scommessa.
        </p>
      ) : (
        <ul className="bet-history__list">
          {bets.map((b) => (
            <li
              key={b.id}
              className={`bet-history__row bet-history__row--${b.status}`}
            >
              <span
                className={`bet-history__status bet-history__status--${b.status}`}
              >
                {b.status === 'won' ? 'Presa' : 'Persa'}
              </span>
              <div className="bet-history__meta">
                <span className="bet-history__desc">
                  {b.description || 'Senza descrizione'}
                </span>
                <span className="bet-history__date">
                  {formatDate(b.resolvedAt ?? b.createdAt)}
                </span>
              </div>
              <div className="bet-history__amounts">
                <span className="bet-history__stake">
                  −{formatEuro(b.stake)}
                </span>
                {b.status === 'won' && (
                  <span className="bet-history__win">
                    +{formatEuro(b.potentialWin)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
