import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { formatEuro } from '../utils/format'

type Props = {
  balance: number
}

export function Balance({ balance }: Props) {
  const sign = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'zero'
  const Icon = balance > 0 ? TrendingUp : balance < 0 ? TrendingDown : Minus
  return (
    <div className={`balance balance--${sign}`}>
      <span className="balance__label">
        <Icon size={14} strokeWidth={2.5} />
        Saldo
      </span>
      <span className="balance__amount">{formatEuro(balance, true)}</span>
    </div>
  )
}
