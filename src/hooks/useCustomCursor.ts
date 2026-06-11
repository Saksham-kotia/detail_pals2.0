/**
 * useCustomCursor — Context-aware cursor follower
 * =================================================
 * Tracks mouse position and exposes a cursor state that
 * the CustomCursor component renders as a morphing dot.
 *
 * Cursor states:
 *   default  — small gold dot (12px)
 *   hover    — expanded ring (44px) with "explore" label
 *   drag     — horizontal arrows, "drag" label (gallery sliders)
 *   cta      — filled gold circle (36px) with "book" label
 *   view     — expanded ring with "view" label (gallery items)
 *   hide     — transparent (text inputs, selects)
 *
 * Usage:
 *   Components set the cursor state via data attributes:
 *     data-cursor="hover"   — any interactive element
 *     data-cursor="drag"    — comparison sliders
 *     data-cursor="cta"     — primary CTAs
 *     data-cursor="view"    — gallery cards
 *     data-cursor="hide"    — form inputs
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export type CursorState = 'default' | 'hover' | 'drag' | 'cta' | 'view' | 'hide'

export interface CursorData {
  x:     number
  y:     number
  state: CursorState
}

export function useCustomCursor() {
  const [cursor, setCursor] = useState<CursorData>({ x: -100, y: -100, state: 'default' })
  const stateRef = useRef<CursorState>('default')

  const updatePosition = useCallback((e: MouseEvent) => {
    setCursor(prev => ({ ...prev, x: e.clientX, y: e.clientY }))
  }, [])

  const updateState = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const cursorEl = target.closest('[data-cursor]') as HTMLElement | null
    const newState = (cursorEl?.dataset.cursor as CursorState) ?? 'default'
    if (newState !== stateRef.current) {
      stateRef.current = newState
      setCursor(prev => ({ ...prev, state: newState }))
    }
  }, [])

  useEffect(() => {
    // Only on devices with a fine pointer (mouse)
    const hasMouse = window.matchMedia('(pointer: fine)').matches
    if (!hasMouse) return

    window.addEventListener('mousemove', updatePosition, { passive: true })
    window.addEventListener('mouseover',  updateState,   { passive: true })

    return () => {
      window.removeEventListener('mousemove', updatePosition)
      window.removeEventListener('mouseover',  updateState)
    }
  }, [updatePosition, updateState])

  return cursor
}
