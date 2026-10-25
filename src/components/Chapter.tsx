import { useEffect, useRef, useState } from 'react'
import { animate, m, useInView, useScroll, useTransform, type MotionValue } from 'motion/react'
import { scrumAttempts } from '../content/goals'
import type { EvidenceFile, EvidenceItem, Goal } from '../content/types'
import { branchName, branchStyle, isMerged } from '../lib/branches'
import { fileMeta, fileName } from '../lib/files'
import { EASE_OUT, useHydrated, useMotionOK } from '../lib/motion'
import { OutLink } from './links'
import { Pipeline } from './Pipeline'
import { Placeholder } from './Placeholder'
import { Thumb } from './Viewer'

type ShotFile = EvidenceFile & { shot: NonNullable<EvidenceFile['shot']> }

// Fact values that are code or data (repos, commits, paths, dates) set in mono; the rest in sans.
const CODE_FACTS = new Set(['Repository', 'Commit', 'Workflow', 'Date'])
const hasShot = (file: EvidenceFile): file is ShotFile => file.shot !== undefined

// Where each evidence commit sits on the pinned branch, as a fraction of its height.
const commitAt = (i: number, n: number) => 0.16 + (0.68 * (i + 0.5)) / n

/* ---------- The branch, pinned beside the goal on wide screens ---------- */

type Progress = { progress: MotionValue<number>; live: boolean }

/** Fills as the reader scrolls past its share of the chapter. Drawn filled when motion is off. */
function CommitDot({ progress, live, at }: Progress & { at: number }) {
  const fill = useTransform(progress, [at - 0.03, at], [0, 1], { clamp: true })
  return (
    <span className="pin-dot" style={{ top: `${at * 100}%` }}>
      <m.span className="pin-dot-fill" style={live ? { scale: fill } : undefined} />
    </span>
  )
}

function PinnedBranch({ goal, progress, live }: Progress & { goal: Goal }) {
  const merged = isMerged(goal)
  const clipId = `clip-${goal.id}`
  const height = useTransform(progress, [0, 1], [0, 1000])
  const n = goal.evidence.length
  // Viewbox is 72 wide by 1000 tall and stretches to the pinned panel; strokes do not scale.
  const d = merged
    ? 'M 20 0 C 20 70 52 50 52 120 L 52 880 C 52 950 20 930 20 1000'
    : 'M 20 0 C 20 70 52 50 52 120 L 52 1000'

  return (
    <div className="pin-graph" aria-hidden="true">
      <svg viewBox="0 0 72 1000" preserveAspectRatio="none" focusable="false">
        <defs>
          <clipPath id={clipId}>
            {live ? <m.rect x="0" y="0" width="72" style={{ height }} /> : <rect x="0" y="0" width="72" height="1000" />}
          </clipPath>
        </defs>
        <path className="pin-ghost" d={d} />
        <path className={merged ? 'pin-line' : 'pin-line pin-line--open'} d={d} clipPath={`url(#${clipId})`} />
      </svg>
      {goal.evidence.map((item, i) => (
        <CommitDot key={item.title} progress={progress} live={live} at={commitAt(i, n)} />
      ))}
      <span className={merged ? 'pin-end pin-end--merge' : 'pin-end pin-end--open'}>
        {merged ? `merge ${branchName(goal)}` : `${branchName(goal)} open`}
      </span>
    </div>
  )
}

/* ---------- Hours ---------- */

/** Counts up to the delivered figure the first time it is seen. A placeholder never animates. */
function Hours({ goal }: { goal: Goal }) {
  const ref = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const motionOK = useMotionOK()
  const delivered = goal.deliveredHours

  useEffect(() => {
    if (!inView || !motionOK || delivered === null) return
    const num = numRef.current
    const controls = animate(0, delivered, {
      duration: 1.2,
      ease: EASE_OUT,
      onUpdate: (v) => {
        if (num) num.textContent = String(Math.round(v))
      },
    })
    if (barRef.current) animate(barRef.current, { scaleX: [0, 1] }, { duration: 1.2, ease: EASE_OUT })
    return () => controls.stop()
  }, [inView, motionOK, delivered])

  const share = delivered === null ? 0 : Math.min(delivered / goal.plannedHours, 1)

  return (
    <div ref={ref} className="hours">
      <div className="hours-col">
        <p className="hours-label">Delivered</p>
        {delivered === null ? (
          <p className="hours-big hours-big--open">
            <Placeholder>to fill</Placeholder>
          </p>
        ) : (
          <p className="hours-big">
            <span ref={numRef}>{delivered}</span>
            <span className="hours-unit">h</span>
          </p>
        )}
      </div>
      <div className="hours-col">
        <p className="hours-label">Planned</p>
        <p className="hours-big hours-big--planned">
          {goal.plannedHours}
          <span className="hours-unit">h</span>
        </p>
      </div>
      <span className="hours-track" aria-hidden="true">
        {delivered !== null && <span ref={barRef} className="hours-fill" style={{ width: `${share * 100}%` }} />}
      </span>
    </div>
  )
}

/* ---------- Evidence, one commit each ---------- */

function FileList({ files }: { files: EvidenceFile[] }) {
  return (
    <ul className="files">
      {files.map((file) => {
        const meta = fileMeta(file.path)
        return (
          <li key={file.path}>
            <OutLink href={meta.href} className="file">
              <span className="file-name">{fileName(file.path)}</span>
              <span className="file-meta num">
                {meta.kind}
                {file.pages ? ` · ${file.pages} pages` : ''} · {meta.size}
              </span>
            </OutLink>
          </li>
        )
      })}
    </ul>
  )
}

function Commit({ item, index, total }: { item: EvidenceItem; index: number; total: number }) {
  const shots = item.files?.filter(hasShot) ?? []
  return (
    <li className={item.unfinished ? 'commit commit--open' : 'commit'}>
      <p className="commit-meta" aria-hidden="true">
        Commit {index + 1} of {total}
      </p>
      <h4 className="commit-title">
        {item.title}
        {item.tag && <span className="commit-tag">{item.tag}</span>}
      </h4>
      {item.unfinished && (
        <p className="open-item">
          <span className="open-item-label">Open</span>
          {item.unfinished}
        </p>
      )}
      <p className="commit-summary">{item.summary}</p>
      {item.parts && (
        <ol className="parts">
          {item.parts.map((part) => (
            <li key={part}>{part}</li>
          ))}
        </ol>
      )}
      {item.figure === 'scrum-attempts' && (
        <table className="attempts">
          <caption className="sr-only">Scrum Open scores, 20 October 2026</caption>
          <tbody>
            {scrumAttempts.map((a) => (
              <tr key={a.attempt}>
                <th scope="row">{a.attempt}</th>
                <td className="num">{a.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {item.facts && (
        <dl className="facts">
          {item.facts.map((fact) => (
            <div key={fact.term}>
              <dt>{fact.term}</dt>
              <dd className={CODE_FACTS.has(fact.term) ? 'num' : undefined}>
                {fact.href ? <OutLink href={fact.href}>{fact.value}</OutLink> : fact.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {item.figure === 'actions-runs' && <Pipeline />}
      {item.files && <FileList files={item.files} />}
      {shots.length > 0 && (
        <div className="thumbs">
          {shots.map((file) => (
            <Thumb key={file.path} file={file} />
          ))}
        </div>
      )}
      {item.noFile && <p className="no-file">{item.noFile}</p>}
    </li>
  )
}

/* ---------- The reflection, as the merge commit ---------- */

function Reflection({ goal }: { goal: Goal }) {
  const hydrated = useHydrated()
  const [open, setOpen] = useState(false)
  const [first, ...rest] = goal.thinking
  const id = `${goal.id}-more`
  // Before hydration (and with no JS) everything is shown; CSS keeps it open without the `js` class.
  const expanded = !hydrated || open

  return (
    <div className="merge">
      <p className="merge-meta num" aria-hidden="true">
        {isMerged(goal) ? `Merge branch '${branchName(goal)}' into main` : `Branch '${branchName(goal)}' is still open`}
      </p>
      <h3 id={`${goal.id}-thinking`} className="merge-title">
        What changed in my thinking
      </h3>
      <div className="prose">
        <p>{first}</p>
        {rest.length > 0 && (
          <m.div
            id={id}
            className="merge-more"
            initial={false}
            animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            inert={!expanded}
          >
            {rest.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </m.div>
        )}
      </div>
      {rest.length > 0 && hydrated && (
        <button type="button" className="toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          <span className="toggle-sign" aria-hidden="true">
            {open ? '−' : '+'}
          </span>
          {open ? 'Show less' : `Read the rest (${rest.length} more ${rest.length === 1 ? 'paragraph' : 'paragraphs'})`}
        </button>
      )}
    </div>
  )
}

/* ---------- The chapter ---------- */

export function Chapter({ goal }: { goal: Goal }) {
  const ref = useRef<HTMLElement>(null)
  const motionOK = useMotionOK()
  // 0 when the chapter's top reaches the pinned position, 1 when its end leaves.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.25', 'end end'] })
  // On narrow screens the branch line runs down the left edge instead.
  const { scrollYProgress: railProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.7'] })
  const merged = isMerged(goal)
  const titleId = `${goal.id}-title`

  return (
    <article
      id={goal.id}
      ref={ref}
      className={merged ? 'chapter' : 'chapter chapter--open'}
      style={branchStyle(goal)}
      aria-labelledby={titleId}
    >
      <m.span
        className="rail-line"
        aria-hidden="true"
        style={motionOK ? { scaleY: railProgress } : undefined}
      />
      <div className="chapter-pin">
        <PinnedBranch goal={goal} progress={scrollYProgress} live={motionOK} />
        <p className="chapter-number" aria-hidden="true">
          <span className="chapter-number-g">G</span>
          {goal.code.slice(1)}
        </p>
        <h2 id={titleId} className="chapter-title">
          <span className="sr-only">{goal.code}: </span>
          {goal.title}
        </h2>
        <p className="chapter-status">
          <span className={merged ? 'status-dot' : 'status-dot status-dot--open'} aria-hidden="true" />
          {goal.status.label}
          <span className="chapter-status-graph">
            {merged ? 'merged into main' : 'open branch, not merged'}
          </span>
        </p>
        <Hours goal={goal} />
      </div>

      <div className="chapter-body">
        <h3 className="sr-only">Evidence</h3>
        <ol className="commits">
          {goal.evidence.map((item, i) => (
            <Commit key={item.title} item={item} index={i} total={goal.evidence.length} />
          ))}
        </ol>
        <Reflection goal={goal} />
      </div>
    </article>
  )
}
