import { useMemo, useState, useEffect } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import type { Bet, Transaction } from './types'

export type HistoryEntry =
  | { kind: 'bet'; id: string; sortAt: number; bet: Bet }
  | { kind: 'tx'; id: string; sortAt: number; tx: Transaction }
import { useTransactions } from './hooks/useTransactions'
import { useBets } from './hooks/useBets'
import { useTheme } from './hooks/useTheme'
import { useSortMode } from './hooks/useSortMode'
import { Balance } from './components/Balance'
import { Stats } from './components/Stats'
import { ActionButtons } from './components/ActionButtons'
import { BetDialog } from './components/BetDialog'
import { BalanceDialog } from './components/BalanceDialog'
import { TransactionDialog } from './components/TransactionDialog'
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
    hide: hideTransaction,
    unhideAll: unhideAllTransactions,
    hiddenCount,
    remove: removeTransaction,
  } = useTransactions()
  const {
    bets,
    pendingBets,
    totalPotentialWin,
    add: addBet,
    update: updateBet,
    settle: settleBet,
    removeMany: removeBets,
  } = useBets()
  const { theme, setTheme } = useTheme()
  const { sortMode, setSortMode } = useSortMode()

  const [view, setView] = useState<View>('home')
  const [showBetDialog, setShowBetDialog] = useState(false)
  const [showBalanceDialog, setShowBalanceDialog] = useState(false)
  const [editingBet, setEditingBet] = useState<Bet | null>(null)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [introDone, setIntroDone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIntroDone(true)
    }
  }, [])

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
    const hasStake = data.stake > 0
    const hasWin = data.potentialWin > 0
    if (hasStake && hasWin) {
      const txId = addTransaction('spesa', data.stake, data.createdAt)
      addBet({ ...data, spesaTxId: txId ?? undefined })
    } else if (hasStake) {
      addTransaction(
        'spesa',
        data.stake,
        data.createdAt,
        undefined,
        'standalone',
        data.description,
      )
    } else if (hasWin) {
      addTransaction(
        'vincita',
        data.potentialWin,
        data.createdAt,
        undefined,
        'standalone',
        data.description,
      )
    }
    setShowBetDialog(false)
  }

  const handleSettleBet = (id: string, outcome: 'won' | 'lost') => {
    let vincitaTxId: string | undefined
    if (outcome === 'won') {
      const bet = pendingBets.find((b) => b.id === id)
      if (bet) {
        vincitaTxId = addTransaction('vincita', bet.potentialWin) ?? undefined
      }
    }
    settleBet(id, outcome, vincitaTxId)
  }

  const historyEntries: HistoryEntry[] = useMemo(() => {
    const list: HistoryEntry[] = []
    const linkedTxIds = new Set<string>()
    for (const b of bets) {
      list.push({
        kind: 'bet',
        id: b.id,
        sortAt: b.resolvedAt ?? b.createdAt,
        bet: b,
      })
      if (b.spesaTxId) linkedTxIds.add(b.spesaTxId)
      if (b.vincitaTxId) linkedTxIds.add(b.vincitaTxId)
    }
    for (const t of transactions) {
      if (linkedTxIds.has(t.id)) continue
      list.push({ kind: 'tx', id: t.id, sortAt: t.createdAt, tx: t })
    }
    list.sort((a, b) => b.sortAt - a.sortAt)
    return list
  }, [bets, transactions])

  const handleRemoveEntries = (ids: string[]) => {
    const idSet = new Set(ids)
    const betIds: string[] = []
    const txIds: string[] = []
    for (const entry of historyEntries) {
      if (!idSet.has(entry.id)) continue
      if (entry.kind === 'bet') {
        betIds.push(entry.id)
        if (entry.bet.spesaTxId) txIds.push(entry.bet.spesaTxId)
        if (entry.bet.vincitaTxId) txIds.push(entry.bet.vincitaTxId)
      } else {
        txIds.push(entry.id)
      }
    }
    if (betIds.length) removeBets(betIds)
    for (const id of txIds) removeTransaction(id)
  }

  const handleEditTransaction = (tx: Transaction) => {
    setShowBetDialog(false)
    setEditingBet(null)
    setShowBalanceDialog(false)
    setEditingTx(tx)
  }

  const handleConfirmTxEdit = (patch: {
    amount: number
    createdAt: number
    description?: string
    type?: 'spesa' | 'vincita'
  }) => {
    if (!editingTx) return
    updateTransaction(editingTx.id, patch)
    setEditingTx(null)
  }

  const handleSetBalance = (target: number) => {
    const diff = Math.round((target - balance) * 100) / 100
    if (diff > 0)
      addTransaction('vincita', diff, undefined, undefined, 'initial')
    else if (diff < 0)
      addTransaction('spesa', -diff, undefined, undefined, 'initial')
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
          onOpenBetHistory={() => setView('bet-history')}
          betHistoryCount={historyEntries.length}
        />
      </div>
    )
  }

  if (view === 'bet-history') {
    return (
      <div className="app">
        <BetHistoryPage
          entries={historyEntries}
          onBack={() => setView('settings')}
          onRemoveEntries={handleRemoveEntries}
        />
      </div>
    )
  }

  return (
    <div className="app">
      {!introDone && (
        <div
          className="intro-logo"
          aria-hidden="true"
          onAnimationEnd={(e) => {
            if (e.animationName === 'intro-logo-fade') setIntroDone(true)
          }}
        >
          <div className="intro-logo__wrap">
            <img
              className="intro-logo__faint"
              src="/logo-playlimit-192.png"
              alt=""
              width={200}
              height={200}
            />
            <img
              className="intro-logo__full"
              src="/logo-playlimit-192.png"
              alt=""
              width={200}
              height={200}
            />
          </div>
        </div>
      )}
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

      <section className="overview">
        <header className="overview__header">
          <h2 className="overview__title">Dati generali</h2>
        </header>
        <Balance
          balance={balance}
          potentialBalance={potentialBalance}
          onEdit={
            transactions.length === 0 && bets.length === 0
              ? () => setShowBalanceDialog(true)
              : undefined
          }
        />
        <Stats
          totalSpesa={totalSpesa}
          totalVincita={totalVincita}
          count={count}
        />
      </section>
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
        onDelete={hideTransaction}
        onEdit={handleEditTransaction}
        hiddenCount={hiddenCount}
        onRestoreHidden={unhideAllTransactions}
      />

      {showBalanceDialog && (
        <BalanceDialog
          currentBalance={balance}
          onCancel={() => setShowBalanceDialog(false)}
          onConfirm={handleSetBalance}
        />
      )}

      {editingTx && (
        <TransactionDialog
          tx={editingTx}
          onCancel={() => setEditingTx(null)}
          onConfirm={handleConfirmTxEdit}
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
