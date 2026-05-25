import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronDown, TrendingDown, TrendingUp } from 'lucide-react'
import type { SortMode } from '../types'

type Props = {
  value: SortMode
  onChange: (mode: SortMode) => void
}

const OPTIONS: { value: SortMode; label: string; Icon: typeof Calendar }[] = [
  { value: 'date', label: 'Recenti', Icon: Calendar },
  { value: 'loss', label: 'Perdite', Icon: TrendingDown },
  { value: 'win', label: 'Vincite', Icon: TrendingUp },
]

export function SortFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0]
  const CurrentIcon = current.Icon

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleSelect = (mode: SortMode) => {
    onChange(mode)
    setOpen(false)
  }

  return (
    <div className="sort" ref={rootRef}>
      <button
        type="button"
        className={`sort__trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <CurrentIcon size={15} strokeWidth={2.2} />
        <span className="sort__label">{current.label}</span>
        <ChevronDown
          size={15}
          strokeWidth={2.2}
          className="sort__chevron"
        />
      </button>

      {open && (
        <ul className="sort__menu" role="listbox">
          {OPTIONS.map(({ value: v, label, Icon }) => (
            <li key={v}>
              <button
                type="button"
                role="option"
                aria-selected={value === v}
                className={`sort__option ${value === v ? 'is-active' : ''}`}
                onClick={() => handleSelect(v)}
              >
                <Icon size={15} strokeWidth={2.2} />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
