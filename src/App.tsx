import { useState } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import type { Bet } from './types'
import { useTransactions } from './hooks/useTransactions'
import { useBets } from './hooks/useBets'
import { useTheme } from './hooks/useTheme'
import { useSortMode } from './hooks/useSortMode'
import { Balance } from './components/Balance'
import { Stats } from './components/Stats'
import { ActionButtons } from './components/ActionButtons'
import { BetDialog } from './components/BetDialog'
import { BalanceDialog } from './components/BalanceDialog'
import { PendingBets } from './components/PendingBets'
import { BetHistoryPage } from './components/BetHistoryPage'
import { History } from './components/History'
import { SettingsPage } from './components/SettingsPage'

type View = 'home' | 'settings' | 'bet-history'

function App() {
  const {
    transactions,
    balance,
    totalSpesa,
    totalVincita,
    count,
    add: addTransaction,
    update: updateTransaction,
    remove: removeTransaction,
    clearAll: clearTransactions,
  } = useTransactions()
  const {
    bets,
    pendingBets,
    settledBets,
    totalPotentialWin,
    add: addBet,
    update: updateBet,
    settle: settleBet,
  } = useBets()
  const { theme, setTheme } = useTheme()
  const { sortMode, setSortMode } = useSortMode()

  const [view, setView] = useState<View>('home')
  const [showBetDialog, setShowBetDialog] = useState(false)
  const [showBalanceDialog, setShowBalanceDialog] = useState(false)
  const [editingBet, setEditingBet] = useState<Bet | null>(null)

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

  const handleConfirmBet = (data: {
    description: string
    stake: number
    potentialWin: number
    createdAt: number
  }) => {
    if (editingBet) {
      updateBet(editingBet.id, data)
      if (editingBet.spesaTxId) {
        updateTransaction(editingBet.spesaTxId, {
          amount: data.stake,
          createdAt: data.createdAt,
        })
      }
      setEditingBet(null)
      return
    }
    const txId = addTransaction('spesa', data.stake, data.createdAt)
    addBet({ ...data, spesaTxId: txId ?? undefined })
    setShowBetDialog(false)
  }

  const handleSettleBet = (id: string, outcome: 'won' | 'lost') => {
    if (outcome === 'won') {
      const bet = pendingBets.find((b) => b.id === id)
      if (bet) addTransaction('vincita', bet.potentialWin)
    }
    settleBet(id, outcome)
  }

  const handleResetAll = () => {
    clearTransactions()
  }

  const allBetsSorted = [...bets].sort(
    (a, b) =>
      (b.resolvedAt ?? b.createdAt) - (a.resolvedAt ?? a.createdAt),
  )

  const handleSetBalance = (target: number) => {
    const diff = Math.round((target - balance) * 100) / 100
    if (diff > 0) addTransaction('vincita', diff)
    else if (diff < 0) addTransaction('spesa', -diff)
    setShowBalanceDialog(false)
  }

  const potentialBalance =
    Math.round((balance + totalPotentialWin) * 100) / 100

  if (view === 'settings') {
    return (
      <div className="app">
        <SettingsPage
          theme={theme}
          onThemeChange={setTheme}
          onBack={() => setView('home')}
          onResetAll={handleResetAll}
          onOpenBetHistory={() => setView('bet-history')}
          transactionCount={count}
          betHistoryCount={allBetsSorted.length}
        />
      </div>
    )
  }

  if (view === 'bet-history') {
    return (
      <div className="app">
        <BetHistoryPage
          bets={allBetsSorted}
          onBack={() => setView('settings')}
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
          <img src="/logo-playlimit-192.png" alt="" width={44} height={44} />
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

      <Balance
        balance={balance}
        potentialBalance={potentialBalance}
        onEdit={() => setShowBalanceDialog(true)}
      />
      <Stats
        totalSpesa={totalSpesa}
        totalVincita={totalVincita}
        count={count}
      />
      <ActionButtons onAdd={() => setShowBetDialog(true)} />

      <PendingBets
        bets={pendingBets}
        totalPotentialWin={totalPotentialWin}
        onSettle={handleSettleBet}
        onEdit={(bet) => {
          setShowBetDialog(false)
          setEditingBet(bet)
        }}
      />

      <History
        transactions={transactions}
        sortMode={sortMode}
        onSortChange={setSortMode}
        onDelete={removeTransaction}
      />

      {showBalanceDialog && (
        <BalanceDialog
          currentBalance={balance}
          onCancel={() => setShowBalanceDialog(false)}
          onConfirm={handleSetBalance}
        />
      )}

      {(showBetDialog || editingBet) && (
        <BetDialog
          initial={
            editingBet
              ? {
                  description: editingBet.description,
                  stake: editingBet.stake,
                  potentialWin: editingBet.potentialWin,
                  createdAt: editingBet.createdAt,
                }
              : undefined
          }
          onCancel={() => {
            setShowBetDialog(false)
            setEditingBet(null)
          }}
          onConfirm={handleConfirmBet}
        />
      )}
    </div>
  )
}

export default App
