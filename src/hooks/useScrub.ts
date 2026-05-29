import { useCallback, useRef, useState } from 'react'

type ScrubMode = 'nearest' | 'band'

/**
 * Shared touch-first "scrubbing" gesture for charts.
 * Press-and-drag (or mouse hover) over the SVG reports the active index.
 *
 * - mode 'nearest': maps the pointer to the closest of `count` points (line charts)
 * - mode 'band': maps the pointer to one of `count` equal-width bands (bar charts)
 */
export function useScrub(count: number, mode: ScrubMode) {
  const ref = useRef<SVGSVGElement>(null)
  const activeRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const update = useCallback(
    (clientX: number) => {
      const el = ref.current
      if (!el || count <= 0) return
      const r = el.getBoundingClientRect()
      const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
      const idx =
        mode === 'nearest'
          ? Math.round(frac * (count - 1))
          : Math.min(count - 1, Math.floor(frac * count))
      setActiveIndex(Math.max(0, idx))
    },
    [count, mode],
  )

  const clear = useCallback(() => {
    activeRef.current = false
    setActiveIndex(null)
  }, [])

  const handlers = {
    onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => {
      ref.current?.setPointerCapture(e.pointerId)
      activeRef.current = true
      update(e.clientX)
    },
    onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => {
      // Mouse: segue al passaggio (hover). Touch/pen: solo mentre è premuto.
      if (e.pointerType === 'mouse' || activeRef.current) {
        update(e.clientX)
      }
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.pointerType === 'mouse') clear()
    },
  }

  return { ref, activeIndex, handlers }
}
