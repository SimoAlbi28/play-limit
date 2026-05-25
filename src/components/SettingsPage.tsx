import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  History as HistoryIcon,
  Monitor,
  Moon,
  Sun,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import type { Theme } from '../types'

type Props = {
  theme: Theme
  onThemeChange: (t: Theme) => void
  onBack: () => void
  onResetAll: () => void
  onOpenBetHistory: () => void
  transactionCount: number
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
  onResetAll,
  onOpenBetHistory,
  transactionCount,
  betHistoryCount,
}: Props) {
  const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0)
  const [confirmText, setConfirmText] = useState('')

  const handleReset = () => {
    if (confirmStep === 0) {
      setConfirmStep(1)
      return
    }
    if (confirmStep === 1 && confirmText.trim().toUpperCase() === 'ELIMINA') {
      onResetAll()
      setConfirmStep(2)
      setConfirmText('')
    }
  }

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
            Vedi cronologia
            <span className="settings__row-meta">
              {betHistoryCount === 0
                ? 'Nessuna scommessa giocata'
                : `${betHistoryCount} scommess${
                    betHistoryCount === 1 ? 'a' : 'e'
                  } giocat${betHistoryCount === 1 ? 'a' : 'e'}`}
            </span>
          </span>
          <ChevronRight
            className="settings__row-chevron"
            size={18}
            strokeWidth={2.2}
          />
        </button>
      </section>

      <section className="settings__section">
        <h2 className="settings__heading">Dati</h2>
        <p className="settings__hint">
          {transactionCount === 0
            ? 'Non hai ancora nessuna operazione salvata.'
            : `Hai ${transactionCount} operazion${
                transactionCount === 1 ? 'e' : 'i'
              } salvat${transactionCount === 1 ? 'a' : 'e'}.`}
        </p>

        {confirmStep === 0 && (
          <button
            type="button"
            className="btn btn--danger btn--icon"
            onClick={handleReset}
            disabled={transactionCount === 0}
          >
            <Trash2 size={18} strokeWidth={2.2} />
            Ripulisci tutto
          </button>
        )}

        {confirmStep === 1 && (
          <div className="confirm-block">
            <p className="confirm-block__warning">
              <AlertTriangle size={18} strokeWidth={2.2} />
              <span>
                Sicuro? Questa azione eliminerà tutte le operazioni e non è
                reversibile. Per confermare, scrivi <strong>ELIMINA</strong>{' '}
                qui sotto.
              </span>
            </p>
            <input
              className="confirm-block__input"
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINA"
            />
            <div className="confirm-block__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setConfirmStep(0)
                  setConfirmText('')
                }}
              >
                Annulla
              </button>
              <button
                type="button"
                className="btn btn--danger btn--icon"
                disabled={confirmText.trim().toUpperCase() !== 'ELIMINA'}
                onClick={handleReset}
              >
                <Trash2 size={18} strokeWidth={2.2} />
                Elimina tutto
              </button>
            </div>
          </div>
        )}

        {confirmStep === 2 && (
          <div className="confirm-block confirm-block--done">
            <span className="confirm-block__done-msg">
              <CheckCircle2 size={18} strokeWidth={2.2} />
              Dati eliminati.
            </span>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setConfirmStep(0)}
            >
              Ok
            </button>
          </div>
        )}
      </section>

      <section className="settings__section settings__section--meta">
        <p className="settings__meta">
          PlayLimit · I dati sono salvati solo su questo dispositivo.
        </p>
      </section>
    </div>
  )
}
