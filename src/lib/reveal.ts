import { useEffect, type RefObject } from 'react'
import { inView } from 'motion'

/**
 * Runs `play` once, the first time the element is mostly on screen.
 *
 * The inline script in index.html adds `motion-ok` to <html> only when the
 * reader has not asked for reduced motion. Without it, CSS shows every figure
 * in its finished state and this hook does nothing.
 */
export function useReveal<T extends Element>(ref: RefObject<T | null>, play: (el: T) => void, amount = 0.5) {
  useEffect(() => {
    const el = ref.current
    if (!el || !document.documentElement.classList.contains('motion-ok')) return
    return inView(
      el,
      () => {
        play(el)
        // Returning nothing means the callback runs only on first entry.
      },
      { amount },
    )
  }, [ref, play, amount])
}

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
