import { useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  History as HistoryIcon,
  Monitor,
  Moon,
  RefreshCw,
  Sun,
  X,
} from 'lucide-react'
import type { Theme } from '../types'

type Props = {
  theme: Theme
  onThemeChange: (t: Theme) => void
  onBack: () => void
  onOpenBetHistory: () => void
  betHistoryCount: number
  onReset: () => void
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
  onReset,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const openConfirm = () => {
    setConfirmText('')
    setConfirmOpen(true)
  }

  const cancelConfirm = () => {
    setConfirmOpen(false)
    setConfirmText('')
  }

  const handleResetConfirmed = () => {
    if (confirmText.trim().toUpperCase() !== 'RESET') return
    onReset()
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
            Vedi cronologia ({betHistoryCount})
          </span>
          <ChevronRight
            className="settings__row-chevron"
            size={18}
            strokeWidth={2.2}
          />
        </button>
      </section>

      <div className="settings__reset">
        <button
          type="button"
          className="btn btn--reset"
          onClick={openConfirm}
        >
          <RefreshCw size={16} strokeWidth={2.4} />
          Reset
        </button>
      </div>

      <footer className="app-footer">
        <p className="app-footer__text">
          <strong>PlayLimit</strong> · Conosci il tuo limite, gioca con la testa.
        </p>
      </footer>

      {confirmOpen && (
        <div
          className="dialog-backdrop dialog-backdrop--center"
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelConfirm()
          }}
        >
          <div
            className="dialog dialog--bet dialog--confirm"
            role="dialog"
            aria-modal="true"
            aria-label="Conferma reset"
          >
            <header className="dialog__header">
              <span className="pill pill--danger">Conferma reset</span>
              <button
                type="button"
                className="dialog__close"
                onClick={cancelConfirm}
                aria-label="Chiudi"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="bet-form">
              <div className="confirm-block">
                <p className="confirm-block__warning">
                  <AlertTriangle size={20} strokeWidth={2.2} />
                  <span>
                    Stai per <strong>resettare completamente l'app</strong>.
                    Questa operazione è <strong>irreversibile</strong>: tutti i
                    dati andranno persi e non potranno essere recuperati. Per
                    confermare, scrivi <strong>RESET</strong> qui sotto.
                  </span>
                </p>
                <input
                  className="confirm-block__input"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="RESET"
                />
              </div>
            </div>

            <div className="dialog__actions dialog__actions--sticky">
              <button
                type="button"
                className="btn btn--cancel"
                onClick={cancelConfirm}
              >
                Annulla
              </button>
              <button
                type="button"
                className="btn btn--reset"
                disabled={confirmText.trim().toUpperCase() !== 'RESET'}
                onClick={handleResetConfirmed}
              >
                <RefreshCw size={16} strokeWidth={2.4} />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
