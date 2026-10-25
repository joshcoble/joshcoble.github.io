import { useRef } from 'react'
import { animate } from 'motion/mini'
import { goals } from '../content/goals'
import type { Goal } from '../content/types'
import { EASE_OUT, useReveal } from '../lib/reveal'
import { Placeholder } from './Placeholder'
import { Status } from './Status'

// Every bar shares one scale so goals can be compared by length.
const SCALE = Math.max(...goals.map((g) => Math.max(g.plannedHours, g.deliveredHours ?? 0)))
const pct = (hours: number) => `${(hours / SCALE) * 100}%`

const totalPlanned = goals.reduce((sum, g) => sum + g.plannedHours, 0)
const allDelivered = goals.every((g) => g.deliveredHours !== null)
const totalDelivered = goals.reduce((sum, g) => sum + (g.deliveredHours ?? 0), 0)

/** The delivered bar grows along the planned track, so the gap between plan and delivery reads at a glance. */
function playBars(table: HTMLElement) {
  table.querySelectorAll<HTMLElement>('.hours-done').forEach((bar, i) => {
    bar.closest('.hours-bar')?.setAttribute('data-played', '')
    animate(bar, { transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: 0.9, delay: 0.12 * i, ease: EASE_OUT })
  })
}

export function HoursFigures({ goal }: { goal: Goal }) {
  return (
    <span className="hours-figs">
      <span>
        Planned <b>{goal.plannedHours}</b> h
      </span>
      <span>
        Delivered{' '}
        {goal.deliveredHours === null ? (
          <Placeholder>to fill</Placeholder>
        ) : (
          <>
            <b>{goal.deliveredHours}</b> h
          </>
        )}
      </span>
    </span>
  )
}

function HoursBar({ goal }: { goal: Goal }) {
  return (
    <span className="hours-bar" aria-hidden="true">
      <span className="hours-planned" style={{ width: pct(goal.plannedHours) }} />
      {goal.deliveredHours !== null && <span className="hours-done" style={{ width: pct(goal.deliveredHours) }} />}
    </span>
  )
}

function fileCount(goal: Goal) {
  const n = goal.evidence.reduce((sum, item) => sum + (item.files?.length ?? 0), 0)
  return `${n} ${n === 1 ? 'file' : 'files'}`
}

export function Register() {
  const ref = useRef<HTMLTableElement>(null)
  useReveal(ref, playBars, 0.6)

  return (
    <section id="register" className="section" aria-labelledby="register-title">
      <h2 id="register-title">Register</h2>
      <p className="section-lede">
        Bars share one scale. The outline is planned hours; the solid fill is hours delivered.
      </p>
      <div className="table-wrap">
        <table className="register" ref={ref}>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Goal and status</th>
              <th scope="col">Hours</th>
              <th scope="col" className="col-evidence">
                Evidence
              </th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal) => (
              <tr key={goal.id}>
                <th scope="row" className="num">
                  {goal.code}
                </th>
                <td>
                  <a href={`#${goal.id}`} className="register-goal">
                    {goal.title}
                  </a>
                  <Status status={goal.status} />
                </td>
                <td className="register-hours">
                  <HoursFigures goal={goal} />
                  <HoursBar goal={goal} />
                </td>
                <td className="num col-evidence">{fileCount(goal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={2}>
                Total
              </th>
              <td className="register-hours">
                <span className="hours-figs">
                  <span>
                    Planned <b>{totalPlanned}</b> h
                  </span>
                  <span>
                    Delivered{' '}
                    {allDelivered ? <>
                        <b>{totalDelivered}</b> h
                      </> : <Placeholder>to fill</Placeholder>}
                  </span>
                </span>
              </td>
              <td className="col-evidence" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
