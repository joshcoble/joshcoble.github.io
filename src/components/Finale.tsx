import { useEffect, useRef, type CSSProperties } from 'react'
import { animate, stagger, useInView } from 'motion/react'
import { goals, profile } from '../content/goals'
import { branchColour, branchName, isMerged } from '../lib/branches'
import { EASE_IN_OUT, EASE_OUT, useMotionOK } from '../lib/motion'

// The end of the page: every finished branch merges into main, a pulse runs
// down main, and the last commit is the register update.

// x = MAIN sits exactly on the page's main line (see .finale in graph.css). The
// margin to its left keeps the dots inside the SVG, which is masked.
const MAIN = 11
const LANE_X0 = 54
const LANE_GAP = 30
const FIRST_MERGE = 56
const MERGE_GAP = 42
const CURVE = 40
const merged = goals.filter(isMerged)
const HEAD_Y = FIRST_MERGE + merged.length * MERGE_GAP + 36
const H = HEAD_Y + 14
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six']
const W = LANE_X0 + LANE_GAP * (goals.length - 1) + 24

function lane(i: number) {
  const x = LANE_X0 + LANE_GAP * i
  const y = FIRST_MERGE + MERGE_GAP * i
  return { x, d: `M ${x} 0 L ${x} ${y} C ${x} ${y + CURVE * 0.7} ${MAIN} ${y + CURVE * 0.3} ${MAIN} ${y + CURVE}` }
}

export function Finale() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const motionOK = useMotionOK()

  useEffect(() => {
    const el = ref.current
    if (!el || !inView || !motionOK) return
    const lanes = el.querySelectorAll<SVGPathElement>('.finale-lane')
    const pulse = el.querySelector<SVGCircleElement>('.finale-pulse')
    const head = el.querySelectorAll<HTMLElement>('.finale-head')
    const ring = el.querySelector<SVGCircleElement>('.finale-ring')

    const run = async () => {
      await animate(lanes, { strokeDashoffset: [1, 0] }, { duration: 0.7, delay: stagger(0.16), ease: EASE_IN_OUT })
      el.dataset.merged = ''
      if (pulse) {
        await animate(pulse, { cy: [0, HEAD_Y], opacity: [1, 1] }, { duration: 0.9, ease: EASE_IN_OUT })
        pulse.style.opacity = '0'
      }
      if (ring) animate(ring, { r: [6, 22], opacity: [0.8, 0] }, { duration: 0.8, ease: EASE_OUT })
      await animate(head, { opacity: [0, 1], y: [8, 0] }, { duration: 0.45, delay: stagger(0.08), ease: EASE_OUT })
      el.dataset.played = ''
    }
    run()
  }, [inView, motionOK])

  return (
    <footer ref={ref} className="finale" style={{ '--head-y': `${HEAD_Y}px` } as CSSProperties}>
      <svg
        className="finale-graph"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
        focusable="false"
      >
        <line className="finale-main" x1={MAIN} x2={MAIN} y1="0" y2={HEAD_Y} />
        {goals.map((goal, i) => {
          const { x, d } = lane(i)
          return (
            <g key={goal.id} style={{ color: branchColour(goal.id) }}>
              <path
                className={isMerged(goal) ? 'finale-lane' : 'finale-lane finale-lane--open'}
                d={isMerged(goal) ? d : `M ${x} 0 L ${x} ${HEAD_Y}`}
                pathLength={1}
              />
              <text className="finale-label" x={x + 7} y="40">
                {branchName(goal)}
              </text>
              {isMerged(goal) && <circle className="finale-merge" cx={MAIN} cy={FIRST_MERGE + MERGE_GAP * i + CURVE} r="4" />}
            </g>
          )
        })}
        <circle className="finale-pulse" cx={MAIN} cy="0" r="5" />
        <circle className="finale-ring" cx={MAIN} cy={HEAD_Y} r="6" />
        <circle className="finale-head-dot" cx={MAIN} cy={HEAD_Y} r="7" />
      </svg>

      <div className="finale-text">
        <p className="finale-head finale-commit num">
          <span className="term-ref">HEAD → main</span> register updated {__BUILD_DATE__}
        </p>
        <p className="finale-head finale-summary">
          {merged.length === goals.length
            ? `All ${WORDS[goals.length]} goals merged into main.`
            : `${merged.length} of ${goals.length} goals merged into main.`}
        </p>
        <p className="finale-head finale-name">{profile.name}, University of Technology Sydney</p>
      </div>
    </footer>
  )
}
