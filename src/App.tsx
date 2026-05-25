import { useState } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import type { TransactionType } from './types'
import { useTransactions } from './hooks/useTransactions'
import { useTheme } from './hooks/useTheme'
import { useSortMode } from './hooks/useSortMode'
import { Balance } from './components/Balance'
import { Stats } from './components/Stats'
import { ActionButtons } from './components/ActionButtons'
import { AmountDialog } from './components/AmountDialog'
import { History } from './components/History'
import { SettingsPage } from './components/SettingsPage'

type View = 'home' | 'settings'

function App() {
  const {
    transactions,
    balance,
    totalSpesa,
    totalVincita,
    count,
    add,
    remove,
    clearAll,
  } = useTransactions()
  const { theme, setTheme } = useTheme()
  const { sortMode, setSortMode } = useSortMode()

  const [view, setView] = useState<View>('home')
  const [dialogType, setDialogType] = useState<TransactionType | null>(null)

  const scrollToTop = () => {
    const start = window.scrollY || document.documentElement.scrollTop
    if (start <= 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, 0)
      return
    }
    const duration = Math.min(550, Math.max(280, start * 0.55))
    const startTime = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      window.scrollTo(0, start * (1 - eased))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  if (view === 'settings') {
    return (
      <div className="app">
        <SettingsPage
          theme={theme}
          onThemeChange={setTheme}
          onBack={() => setView('home')}
          onResetAll={clearAll}
          transactionCount={count}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <button
          type="button"
          className="topbar__logo"
          onClick={scrollToTop}
          aria-label="Torna in cima"
        >
          <img src="/logo-playlimit-192.png" alt="" width={36} height={36} />
        </button>
        <h1 className="topbar__title topbar__title--brand">playlimt</h1>
        <button
          type="button"
          className="topbar__icon"
          onClick={() => setView('settings')}
          aria-label="Impostazioni"
        >
          <SettingsIcon size={20} strokeWidth={2.2} />
        </button>
      </header>

      <Balance balance={balance} />
      <Stats
        totalSpesa={totalSpesa}
        totalVincita={totalVincita}
        count={count}
      />
      <ActionButtons
        onSpesa={() => setDialogType('spesa')}
        onVincita={() => setDialogType('vincita')}
      />
      <History
        transactions={transactions}
        sortMode={sortMode}
        onSortChange={setSortMode}
        onDelete={remove}
      />

      {dialogType && (
        <AmountDialog
          type={dialogType}
          onCancel={() => setDialogType(null)}
          onConfirm={(amount) => {
            add(dialogType, amount)
            setDialogType(null)
          }}
        />
      )}
    </div>
  )
}

export default App
