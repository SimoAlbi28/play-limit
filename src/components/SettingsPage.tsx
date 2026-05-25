import {
  ArrowLeft,
  ChevronRight,
  History as HistoryIcon,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react'
import type { Theme } from '../types'

type Props = {
  theme: Theme
  onThemeChange: (t: Theme) => void
  onBack: () => void
  onOpenBetHistory: () => void
  betHistoryCount: number
}

const THEMES: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Chiaro', Icon: Sun },
  { value: 'dark', label: 'Scuro', Icon: Moon },
  { value: 'auto', label: 'Auto', Icon: Monitor },
]

export function SettingsPage({
  theme,
  onThemeChange,
  onBack,
  onOpenBetHistory,
  betHistoryCount,
}: Props) {
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
        <h1 className="topbar__title">Impostazioni</h1>
        <span className="topbar__icon topbar__icon--placeholder" />
      </header>

      <section className="settings__section">
        <h2 className="settings__heading">Tema</h2>
        <div className="theme-switch" role="radiogroup" aria-label="Tema">
          {THEMES.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={theme === value}
              className={`theme-switch__option ${
                theme === value ? 'is-active' : ''
              }`}
              onClick={() => onThemeChange(value)}
            >
              <Icon size={16} strokeWidth={2.2} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings__section">
        <h2 className="settings__heading">Scommesse</h2>
        <button
          type="button"
          className="settings__row"
          onClick={onOpenBetHistory}
        >
          <span className="settings__row-icon">
            <HistoryIcon size={18} strokeWidth={2.2} />
          </span>
          <span className="settings__row-label">
            Vedi cronologia ({betHistoryCount})
          </span>
          <ChevronRight
            className="settings__row-chevron"
            size={18}
            strokeWidth={2.2}
          />
        </button>
      </section>

      <footer className="app-footer">
        <p className="app-footer__text">
          <strong>PlayLimit</strong> · Conosci il tuo limite, gioca con la testa.
        </p>
      </footer>
    </div>
  )
}
