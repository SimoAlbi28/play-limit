import { useEffect, useState } from 'react'
import type { SortMode } from '../types'

const STORAGE_KEY = 'playlimit.sortMode'

function load(): SortMode {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === 'date' || raw === 'loss' || raw === 'win') return raw
  return 'date'
}

export function useSortMode() {
  const [sortMode, setSortMode] = useState<SortMode>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, sortMode)
  }, [sortMode])

  return { sortMode, setSortMode }
}
