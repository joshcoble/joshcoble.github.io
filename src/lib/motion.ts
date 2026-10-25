import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/**
 * True only in the browser, after hydration, when the reader allows motion.
 *
 * The server and the first client render both see false, so prerendered HTML
 * (and therefore no-JS and reduced-motion readers) always gets each figure in
 * its final state. The `motion-ok` class comes from the inline script in index.html.
 */
export function useMotionOK() {
  return useSyncExternalStore(
    noop,
    () => document.documentElement.classList.contains('motion-ok'),
    () => false,
  )
}

/** True after hydration in the browser. False during prerender. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1]
