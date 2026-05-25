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
        <span className="topbar__logo" aria-label="buylimt">
          <img src="/logo-192.png" alt="" width={36} height={36} />
        </span>
        <h1 className="topbar__title topbar__title--brand">buylimt</h1>
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
