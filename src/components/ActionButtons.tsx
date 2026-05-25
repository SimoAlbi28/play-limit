import { Minus, Plus } from 'lucide-react'

type Props = {
  onSpesa: () => void
  onVincita: () => void
}

export function ActionButtons({ onSpesa, onVincita }: Props) {
  return (
    <div className="actions">
      <button
        type="button"
        className="action action--spesa"
        onClick={onSpesa}
      >
        <Minus className="action__symbol" size={28} strokeWidth={2.5} />
        <span className="action__label">Spesa</span>
      </button>
      <button
        type="button"
        className="action action--vincita"
        onClick={onVincita}
      >
        <Plus className="action__symbol" size={28} strokeWidth={2.5} />
        <span className="action__label">Vincita</span>
      </button>
    </div>
  )
}
