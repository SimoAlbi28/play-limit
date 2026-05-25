import { useCallback, useEffect, useRef } from 'react'

type Options = {
  initialDelay?: number
  startInterval?: number
  minInterval?: number
  accelerationStep?: number
}

export function useHoldRepeat(onTick: () => void, options: Options = {}) {
  const {
    initialDelay = 400,
    startInterval = 200,
    minInterval = 60,
    accelerationStep = 20,
  } = options

  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  const initialTimer = useRef<number | null>(null)
  const repeatTimer = useRef<number | null>(null)
  const intervalRef = useRef(startInterval)

  const stop = useCallback(() => {
    if (initialTimer.current !== null) {
      clearTimeout(initialTimer.current)
      initialTimer.current = null
    }
    if (repeatTimer.current !== null) {
      clearTimeout(repeatTimer.current)
      repeatTimer.current = null
    }
    intervalRef.current = startInterval
  }, [startInterval])

  const scheduleNext = useCallback(() => {
    repeatTimer.current = window.setTimeout(() => {
      onTickRef.current()
      intervalRef.current = Math.max(
        minInterval,
        intervalRef.current - accelerationStep,
      )
      scheduleNext()
    }, intervalRef.current)
  }, [minInterval, accelerationStep])

  const start = useCallback(() => {
    stop()
    onTickRef.current()
    initialTimer.current = window.setTimeout(() => {
      scheduleNext()
    }, initialDelay)
  }, [stop, scheduleNext, initialDelay])

  useEffect(() => stop, [stop])

  return { start, stop }
}
