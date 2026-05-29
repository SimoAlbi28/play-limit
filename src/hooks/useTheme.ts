import { useEffect, useState } from 'react'
import type { Theme } from '../types'

const STORAGE_KEY = 'playlimit.theme'

function loadTheme(): Theme {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'auto') return raw
  return 'auto'
}

// Auto: chiaro tra le 06:00 e le 19:59, scuro tra le 20:00 e le 05:59.
function resolveAuto(): 'light' | 'dark' {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 20 ? 'light' : 'dark'
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'auto' ? resolveAuto() : theme
  document.documentElement.dataset.theme = resolved
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(loadTheme)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, theme)

    if (theme !== 'auto') return
    // Ricontrolla ogni minuto così cambia da solo alle 06:00 e alle 20:00,
    // e quando l'app torna in primo piano (i timer in background vengono sospesi).
    const reapply = () => applyTheme('auto')
    const id = window.setInterval(reapply, 60_000)
    document.addEventListener('visibilitychange', reapply)
    window.addEventListener('focus', reapply)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', reapply)
      window.removeEventListener('focus', reapply)
    }
  }, [theme])

  return { theme, setTheme: setThemeState }
}
