import { Plus } from 'lucide-react'

type Props = {
  onAdd: () => void
}

export function ActionButtons({ onAdd }: Props) {
  return (
    <div className="actions actions--single">
      <button type="button" className="action action--add" onClick={onAdd}>
        <Plus size={28} strokeWidth={2.6} />
        <span className="action__label">Aggiungi</span>
      </button>
    </div>
  )
}
