import type { CSSProperties } from 'react'
import type { Goal } from '../content/types'

// Each goal is a branch in the page's git graph, with one colour used for
// everything that belongs to it. Defined here rather than in content, so the
// content files stay facts only.
const COLOURS: Record<string, string> = {
  'goal-1': 'var(--g1)',
  'goal-2': 'var(--g2)',
  'goal-3': 'var(--g3)',
  'goal-4': 'var(--g4)',
}

export function branchColour(goalId: string) {
  return COLOURS[goalId] ?? 'var(--main)'
}

/** Sets --branch for a subtree, so links, focus rings and graph lines inside take the goal's colour. */
export function branchStyle(goal: Pick<Goal, 'id'>): CSSProperties {
  return { '--branch': branchColour(goal.id) } as CSSProperties
}

/** A goal merges back into main once the goal itself is met. */
export const isMerged = (goal: Pick<Goal, 'status'>) => goal.status.kind === 'complete'

/** Short branch name shown in the graph, e.g. "g3". */
export const branchName = (goal: Pick<Goal, 'code'>) => goal.code.toLowerCase()
