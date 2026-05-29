import {
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  Pencil,
  Wallet,
  BarChart3,
} from 'lucide-react'
import { formatEuro } from '../utils/format'

type Props = {
  balance: number
  potentialBalance?: number
  onEdit?: () => void
  onOpenStats?: () => void
}

export function Balance({ balance, potentialBalance, onEdit, onOpenStats }: Props) {
  const sign = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'zero'
  const Icon = balance > 0 ? TrendingUp : balance < 0 ? TrendingDown : Minus
  const showPotential =
    potentialBalance !== undefined &&
    Math.abs(potentialBalance - balance) > 0.005
  const potentialSign =
    potentialBalance !== undefined
      ? potentialBalance > 0
        ? 'positive'
        : potentialBalance < 0
          ? 'negative'
          : 'zero'
      : 'zero'
  const inner = (
    <>
      <span className="balance__icon" aria-hidden="true">
        <Wallet size={22} strokeWidth={2.2} />
      </span>
      <span className="balance__label">
        <Icon size={14} strokeWidth={2.5} />
        Saldo
        {onEdit && (
          <Pencil
            className="balance__edit-icon"
            size={12}
            strokeWidth={2.4}
            aria-hidden="true"
          />
        )}
      </span>
      <span className="balance__amount">{formatEuro(balance, true)}</span>
      {showPotential && (
        <span className="balance__potential">
          <Sparkles size={12} strokeWidth={2.4} />
          saldo potenziale:{' '}
          <strong
            className={`balance__potential-value balance__potential-value--${potentialSign}`}
          >
            {formatEuro(potentialBalance!, true)}
          </strong>
        </span>
      )}
    </>
  )

  const statsBtn = onOpenStats && (
    <button
      type="button"
      className="balance__stats"
      onClick={onOpenStats}
      aria-label="Apri statistiche"
    >
      <BarChart3 size={22} strokeWidth={2.2} />
    </button>
  )

  if (!onEdit) {
    return (
      <div className="balance-wrap">
        {statsBtn}
        <div className={`balance balance--${sign}`}>{inner}</div>
      </div>
    )
  }

  return (
    <div className="balance-wrap">
      {statsBtn}
      <button
        type="button"
        className={`balance balance--${sign} balance--button`}
        onClick={onEdit}
        aria-label="Imposta saldo iniziale"
      >
        {inner}
      </button>
    </div>
  )
}
