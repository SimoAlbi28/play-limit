import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.tsx'

// Best-effort orientation lock (works only in installed PWA / fullscreen)
const orientation = (screen as Screen & {
  orientation?: ScreenOrientation & { lock?: (o: string) => Promise<void> }
}).orientation
if (orientation && typeof orientation.lock === 'function') {
  orientation.lock('portrait').catch(() => {})
}

// Block pinch-zoom and double-tap zoom (iOS Safari ignores user-scalable=no)
const preventGesture = (e: Event) => e.preventDefault()
document.addEventListener('gesturestart', preventGesture)
document.addEventListener('gesturechange', preventGesture)
document.addEventListener('gestureend', preventGesture)

let lastTouchEnd = 0
document.addEventListener(
  'touchend',
  (e) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 350) {
      e.preventDefault()
    }
    lastTouchEnd = now
  },
  { passive: false },
)

document.addEventListener(
  'touchmove',
  (e) => {
    if ((e as TouchEvent).touches.length > 1) {
      e.preventDefault()
    }
  },
  { passive: false },
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
