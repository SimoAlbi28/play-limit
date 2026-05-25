import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { formatEuro } from '../utils/format'

function NumeroIcon({
  className,
  size = 18,
  strokeWidth = 2,
}: {
  className?: string
  size?: number
  strokeWidth?: number
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 15.5V9l4.5 6.5V9" strokeWidth={1.8} />
      <circle cx="16" cy="9.4" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

type Props = {
  totalSpesa: number
  totalVincita: number
  count: number
}

export function Stats({ totalSpesa, totalVincita, count }: Props) {
  return (
    <div className="stats">
      <div className="stats__item">
        <NumeroIcon className="stats__icon" size={18} strokeWidth={2} />
        <span className="stats__label">Operazioni</span>
        <span className="stats__value">{count}</span>
      </div>
      <div className="stats__item">
        <ArrowDownCircle
          className="stats__icon stats__icon--negative"
          size={18}
          strokeWidth={2}
        />
        <span className="stats__label">Spese</span>
        <span className="stats__value stats__value--negative">
          {formatEuro(totalSpesa)}
        </span>
      </div>
      <div className="stats__item">
        <ArrowUpCircle
          className="stats__icon stats__icon--positive"
          size={18}
          strokeWidth={2}
        />
        <span className="stats__label">Vincite</span>
        <span className="stats__value stats__value--positive">
          {formatEuro(totalVincita)}
        </span>
      </div>
    </div>
  )
}
