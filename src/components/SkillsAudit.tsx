import { useEffect, useRef, useState } from 'react'
import { animate, stagger, useInView } from 'motion/react'
import { futureGoals, goals, skillsAudit } from '../content/goals'
import type { SkillRating } from '../content/types'
import { branchStyle } from '../lib/branches'
import { EASE_OUT, useHydrated, useMotionOK } from '../lib/motion'

// The SFIA 8 levels of responsibility
const SFIA = ['Follow', 'Assist', 'Apply', 'Enable', 'Ensure, advise', 'Initiate, influence', 'Set strategy, inspire, mobilise']

const FILTERS: { key: string; label: string; test: (s: SkillRating) => boolean }[] = [
  { key: 'all', label: 'All skills', test: () => true },
  { key: 'goals', label: 'Goals this session', test: (s) => s.goal !== undefined },
  { key: 'uts', label: 'Required by UTS', test: (s) => s.source === 'Required by UTS' },
  { key: 'ads', label: 'From the job ads', test: (s) => s.source !== 'Required by UTS' },
]

function Where({ rating }: { rating: SkillRating }) {
  const goal = goals.find((g) => g.id === rating.goal)
  if (goal)
    return (
      <p className="skill-where">
        Worked on this session in{' '}
        <a href={`#${goal.id}`} style={branchStyle(goal)}>
          {goal.code} {goal.short}
        </a>
        .
      </p>
    )
  if (futureGoals.some((f) => f.name === rating.skill))
    return (
      <p className="skill-where">
        Not a goal this session. It is first in my <a href="#future">future goals</a>.
      </p>
    )
  return <p className="skill-where">Not a goal this session.</p>
}

/** One row: the skill, its level as a filled seven-step scale, and the reasoning when opened. */
function Skill({ rating }: { rating: SkillRating }) {
  const goal = goals.find((g) => g.id === rating.goal)
  return (
    <li className="skill" data-level={rating.level}>
      <details>
        <summary>
          <span className="skill-name">
            {rating.skill}
            <span className="skill-source">{rating.source}</span>
          </span>
          <span className="sfia-meter" aria-hidden="true">
            {SFIA.map((_, i) => (
              <span key={i} className={i < rating.level ? 'sfia-cell sfia-cell--on' : 'sfia-cell'} />
            ))}
          </span>
          <span className="skill-level">
            Level <span className="num">{rating.level}</span>
            <span className="skill-level-name"> {SFIA[rating.level - 1]}</span>
          </span>
          {goal ? (
            <span className="skill-goal" style={branchStyle(goal)}>
              <span className="nav-swatch" aria-hidden="true" />
              {goal.code}
            </span>
          ) : (
            <span className="skill-goal" />
          )}
        </summary>
        <div className="skill-why">
          <p>{rating.why}</p>
          <Where rating={rating} />
        </div>
      </details>
    </li>
  )
}

export function SkillsAudit() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const motionOK = useMotionOK()
  const hydrated = useHydrated()
  const [filter, setFilter] = useState('all')
  const test = FILTERS.find((f) => f.key === filter)!.test

  // Each scale fills from Follow upward, row by row
  useEffect(() => {
    const el = ref.current
    if (!el || !inView || !motionOK) return
    const rows = [...el.querySelectorAll<HTMLElement>('.sfia-meter')]
    rows.forEach((row, r) => {
      const on = row.querySelectorAll<HTMLElement>('.sfia-cell--on')
      animate(on, { scaleY: [0, 1] }, { duration: 0.35, delay: stagger(0.07, { startDelay: r * 0.06 }), ease: EASE_OUT })
    })
    const t = setTimeout(() => (el.dataset.played = ''), rows.length * 60 + 600)
    return () => clearTimeout(t)
  }, [inView, motionOK])

  const shown = skillsAudit.filter(test)

  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <h2 id="skills-title">Skills audit</h2>
      <p className="section-lede">
        Where I started. These are my self-assessed levels from the skills audit in Assessment Task 1, on the SFIA scale
        of 1 to 7. Four of the skills became this session’s goals. Open a skill to see why I gave it that level.
      </p>

      <ol className="sfia-legend" aria-label="SFIA levels">
        {SFIA.map((name, i) => (
          <li key={name}>
            <span className="num">{i + 1}</span> {name}
          </li>
        ))}
      </ol>

      {hydrated && (
        <div className="skill-filters" role="group" aria-label="Show skills">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className="chip"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="chip-count num">{skillsAudit.filter(f.test).length}</span>
            </button>
          ))}
        </div>
      )}

      <div ref={ref} className="skills-board">
        <div className="skills-head" aria-hidden="true">
          <span />
          <span className="sfia-meter sfia-meter--head">
            {SFIA.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </span>
        </div>
        <ul className="skills-list">
          {shown.map((rating) => (
            <Skill key={rating.skill} rating={rating} />
          ))}
        </ul>
      </div>
    </section>
  )
}
