import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { animate, stagger } from 'motion/react'
import { goals } from '../content/goals'
import type { Goal } from '../content/types'
import { branchColour, isMerged } from '../lib/branches'
import { EASE_IN_OUT, EASE_OUT, useMotionOK } from '../lib/motion'

const COMMAND = 'git log --graph --oneline'

// Graph geometry, in px. One row per line of output.
const ROW = 32
const MAIN_X = 10
const LANE = 19
const laneX = (i: number) => MAIN_X + LANE * (i + 1)

// Newest first, as git log prints it: HEAD, then G4 to G1, then where the plan started.
const ordered = [...goals].reverse()
const ROWS = ordered.length + 2
const rowY = (r: number) => r * ROW + ROW / 2
const HEAD_ROW = 0
const ROOT_ROW = ROWS - 1
const GRAPH_W = laneX(goals.length - 1) + MAIN_X

function lanePath(goal: Goal) {
  const lane = goals.indexOf(goal)
  const x = laneX(lane)
  const row = ordered.indexOf(goal) + 1
  const yFork = rowY(ROOT_ROW)
  // Every branch forks from main at the root and climbs to its own commit.
  let d = `M ${MAIN_X} ${yFork} C ${MAIN_X} ${yFork - ROW * 0.45} ${x} ${yFork - ROW * 0.3} ${x} ${yFork - ROW * 0.75}`
  if (isMerged(goal)) {
    // A merged branch carries on up and curves back into main at HEAD.
    const yHead = rowY(HEAD_ROW)
    d += ` L ${x} ${yHead + ROW * 0.75} C ${x} ${yHead + ROW * 0.3} ${MAIN_X} ${yHead + ROW * 0.45} ${MAIN_X} ${yHead}`
  } else {
    d += ` L ${x} ${rowY(row)}`
  }
  return d
}

/**
 * The hero's terminal. Types the command, prints one line per goal, then the
 * graph draws upward from the root and splits into the four branches. Each
 * line links to its goal; hovering or focusing one lights its branch.
 */
export function Terminal() {
  const ref = useRef<HTMLDivElement>(null)
  const motionOK = useMotionOK()
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !motionOK) return
    const chars = el.querySelectorAll<HTMLElement>('.term-char')
    const rows = el.querySelectorAll<HTMLElement>('.term-row')
    const clip = el.querySelector<SVGRectElement>('.term-clip')
    const dots = el.querySelectorAll<SVGElement>('.term-dot')
    const graphH = ROWS * ROW
    // Hide the graph before it is first seen; the terminal is still fading in at this point.
    clip?.setAttribute('y', String(graphH))
    clip?.setAttribute('height', '0')

    const run = async () => {
      await new Promise((r) => setTimeout(r, 650)) // after the name has landed
      await animate(chars, { opacity: [0, 1] }, { duration: 0.01, delay: stagger(0.045) })
      el.dataset.typed = ''
      await animate(rows, { opacity: [0, 1], x: [-8, 0] }, { duration: 0.28, delay: stagger(0.07), ease: EASE_OUT })
      if (clip) {
        animate(0, graphH, {
          duration: 1.1,
          ease: EASE_IN_OUT,
          onUpdate: (h) => {
            clip.setAttribute('y', String(graphH - h))
            clip.setAttribute('height', String(h))
          },
        })
      }
      // Dots pop as the drawing passes them, bottom first.
      await animate(
        [...dots].reverse(),
        { scale: [0, 1] },
        { duration: 0.3, delay: stagger(1.1 / dots.length), ease: EASE_OUT },
      )
      el.dataset.played = ''
    }
    run()
  }, [motionOK])

  return (
    <div
      ref={ref}
      className="term"
      data-active={active ?? undefined}
      onMouseLeave={() => setActive(null)}
    >
      <div className="term-bar" aria-hidden="true">
        <span className="term-lights">
          <i />
          <i />
          <i />
        </span>
        <span className="num">~/joshcoble.github.io</span>
      </div>

      <p className="term-cmd num">
        <span className="term-prompt" aria-hidden="true">
          $
        </span>{' '}
        <span className="sr-only">{COMMAND}</span>
        <span aria-hidden="true">
          {[...COMMAND].map((c, i) => (
            <span key={i} className="term-char">
              {c}
            </span>
          ))}
        </span>
        <span className="term-caret" aria-hidden="true" />
      </p>

      <div className="term-out">
        <svg
          className="term-graph"
          width={GRAPH_W}
          height={ROWS * ROW}
          viewBox={`0 0 ${GRAPH_W} ${ROWS * ROW}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <clipPath id="term-reveal">
              <rect className="term-clip" x="0" y="0" width={GRAPH_W} height={ROWS * ROW} />
            </clipPath>
          </defs>
          <g clipPath="url(#term-reveal)">
            <line
              className="term-main"
              x1={MAIN_X}
              x2={MAIN_X}
              y1={rowY(HEAD_ROW)}
              y2={rowY(ROOT_ROW)}
            />
            {goals.map((goal) => (
              <path
                key={goal.id}
                className="term-lane"
                data-goal={goal.id}
                data-open={isMerged(goal) ? undefined : ''}
                d={lanePath(goal)}
                style={{ stroke: branchColour(goal.id) }}
              />
            ))}
          </g>
          <circle className="term-dot term-dot--main" cx={MAIN_X} cy={rowY(HEAD_ROW)} r="5" />
          {ordered.map((goal, i) => (
            <circle
              key={goal.id}
              className="term-dot"
              data-goal={goal.id}
              data-open={isMerged(goal) ? undefined : ''}
              cx={laneX(goals.indexOf(goal))}
              cy={rowY(i + 1)}
              r="5"
              style={{ '--branch': branchColour(goal.id) } as CSSProperties}
            />
          ))}
          <circle className="term-dot term-dot--main" cx={MAIN_X} cy={rowY(ROOT_ROW)} r="5" />
        </svg>

        <ol className="term-rows" style={{ paddingLeft: GRAPH_W + 8 }}>
          <li className="term-row term-row--main num">
            <span className="term-ref">HEAD → main</span> register updated {__BUILD_DATE__}
          </li>
          {ordered.map((goal) => (
            <li key={goal.id} className="term-row" data-goal={goal.id}>
              <a
                href={`#${goal.id}`}
                className="term-link"
                style={{ '--branch': branchColour(goal.id) } as CSSProperties}
                onMouseEnter={() => setActive(goal.id)}
                onFocus={() => setActive(goal.id)}
                onBlur={() => setActive(null)}
              >
                <span className="term-code">{goal.code}</span>
                <span className="term-title">{goal.short}</span>
                <span className={`term-state${isMerged(goal) ? '' : ' term-state--open'}`}>
                  {isMerged(goal) ? 'merged' : 'open'}
                </span>
              </a>
            </li>
          ))}
          <li className="term-row term-row--main num">
            <span className="term-ref">main</span> professional learning plan
          </li>
        </ol>
      </div>
    </div>
  )
}
