import type { ReactNode } from 'react'

export type StatusKind = 'complete' | 'partly' | 'in-progress' | 'unconfirmed'

export interface Status {
  kind: StatusKind
  label: string
  note?: string
}

export interface Screenshot {
  thumb: string
  width: number
  height: number
  alt: string
}

export interface EvidenceFile {
  /** Path from the site root, e.g. "evidence/scrum-open-93.png". Must exist in /evidence. */
  path: string
  /** One line on what the file shows. Also used in the evidence index. */
  description: string
  pages?: number
  shot?: Screenshot
}

export interface Fact {
  term: string
  value: string
  href?: string
}

export interface ExternalLink {
  label: string
  href: string
}

export interface EvidenceItem {
  title: string
  /** Short qualifier shown beside the title, e.g. "Free self-assessment, not a certification". */
  tag?: string
  summary: ReactNode
  facts?: Fact[]
  files?: EvidenceFile[]
  links?: ExternalLink[]
  figure?: 'actions-runs' | 'scrum-attempts'
  /** Explains why there is no file to open. */
  noFile?: string
  /** Marks the whole item as unfinished. Rendered in the accent colour. */
  unfinished?: string
  parts?: string[]
}

export interface Goal {
  id: string
  code: string
  title: string
  /** For tight spaces: the terminal, the nav and the graph overview. Chapters use the full title. */
  short: string
  status: Status
  plannedHours: number
  /** null renders as a placeholder until the figure is filled in. */
  deliveredHours: number | null
  evidence: EvidenceItem[]
  thinking: ReactNode[]
  /** Old assumption against what replaced it, drawn from the reflection. Shown as a diff above it. */
  diff?: DiffLine[]
  outstanding: string[]
}

export interface DiffLine {
  was: string
  now: string
}

export interface FutureGoal {
  name: string
  note?: string
  /** The goal this was carried over from, if any */
  from?: string
  fromHref?: string
}

export interface Run {
  number: number
  event: 'push' | 'pull_request'
  result: 'failure' | 'success'
  sha: string
  /** ISO time in UTC, from the GitHub API */
  at: string
  url: string
}

export interface SkillRating {
  skill: string
  /** Where the skill comes from: UTS's required skills or the job ads */
  source: string
  /** SFIA level, 1 to 7 */
  level: number
  /** The goal in this session that worked on it, if any */
  goal?: string
  why: string
}
