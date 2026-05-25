import { ArrowDownCircle, ArrowUpCircle, Hash } from 'lucide-react'
import { formatEuro } from '../utils/format'

type Props = {
  totalSpesa: number
  totalVincita: number
  count: number
}

export function Stats({ totalSpesa, totalVincita, count }: Props) {
  return (
    <div className="stats">
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
      <div className="stats__item">
        <Hash className="stats__icon" size={18} strokeWidth={2} />
        <span className="stats__label">Operazioni</span>
        <span className="stats__value">{count}</span>
      </div>
    </div>
  )
}
