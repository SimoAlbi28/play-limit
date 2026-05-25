import { ChevronsDown } from 'lucide-react'
import type { Bet } from '../types'
import { formatDate, formatEuro } from '../utils/format'

type Props = {
  bets: Bet[]
  totalPotentialWin: number
  onSettle: (id: string, outcome: 'won' | 'lost') => void
  onEdit: (bet: Bet) => void
}

export function PendingBets({
  bets,
  totalPotentialWin,
  onSettle,
  onEdit,
}: Props) {
  const isEmpty = bets.length === 0
  return (
    <section className="pending-bets">
      <div className="section-arrow" aria-hidden="true">
        <ChevronsDown size={24} strokeWidth={2.2} />
      </div>
      <header
        className={`pending-bets__header ${
          isEmpty ? 'pending-bets__header--centered' : ''
        }`}
      >
        <h2 className="pending-bets__title">Potenziali vincite</h2>
        {!isEmpty && (
          <span className="pending-bets__total">
            +{formatEuro(totalPotentialWin)}
          </span>
        )}
      </header>

      {bets.length === 0 ? (
        <p className="pending-bets__empty">Nessuna scommessa aperta.</p>
      ) : (
        <ul className="pending-bets__list">
          {bets.map((b) => (
            <li key={b.id} className="bet-card">
              <button
                type="button"
                className="bet-card__main"
                onClick={() => onEdit(b)}
                aria-label={`Modifica scommessa: ${
                  b.description || 'senza descrizione'
                }`}
              >
                <div className="bet-card__row bet-card__row--head">
                  <span className="bet-card__date">
                    {formatDate(b.createdAt)}
                  </span>
                  <span className="bet-card__stake">
                    Spesa {formatEuro(b.stake)}
                  </span>
                </div>
                {b.description.trim() && (
                  <div className="bet-card__row bet-card__row--desc">
                    <span className="bet-card__desc">{b.description}</span>
                  </div>
                )}
                <div className="bet-card__row bet-card__row--win">
                  <span className="bet-card__win">
                    +{formatEuro(b.potentialWin)}
                  </span>
                </div>
              </button>
              <div className="bet-card__actions">
                <button
                  type="button"
                  className="bet-card__btn bet-card__btn--lost"
                  onClick={() => onSettle(b.id, 'lost')}
                >
                  Persa
                </button>
                <button
                  type="button"
                  className="bet-card__btn bet-card__btn--won"
                  onClick={() => onSettle(b.id, 'won')}
                >
                  Presa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
