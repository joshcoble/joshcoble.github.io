import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { ACTIONS_REPO, welcomeRuns } from '../content/actions-runs'
import type { Run } from '../content/types'
import { useHydrated, useMotionOK } from '../lib/motion'
import { OutLink } from './links'

type StageState = 'queued' | 'running' | Run['result']

const sydneyTime = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Sydney',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const LABEL: Record<StageState, string> = {
  queued: 'Queued',
  running: 'Running',
  failure: 'Failed',
  success: 'Succeeded',
}

// Replay keeps the real gaps between runs (2, 7 and 6 minutes), compressed to a
// quarter of a second per minute, so the pause before the pull request runs shows.
const SECONDS_PER_MINUTE = 0.25
const RUNNING_FOR = 0.45
const t0 = Date.parse(welcomeRuns[0].at)
const startsAt = welcomeRuns.map((run) => 0.3 + ((Date.parse(run.at) - t0) / 60000) * SECONDS_PER_MINUTE)

const finalStates = () => Object.fromEntries(welcomeRuns.map((r) => [r.number, r.result])) as Record<number, StageState>

function StatusIcon({ state }: { state: StageState }) {
  if (state === 'failure')
    return (
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" fill="none" />
      </svg>
    )
  if (state === 'success')
    return (
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
        <path d="M2.5 6.5l2.3 2.3L9.5 3.8" stroke="currentColor" strokeWidth="1.8" fill="none" />
      </svg>
    )
  return null
}

/**
 * The welcome.yml run history as a pipeline. Each run moves from queued to its
 * real result, in the order and roughly the rhythm it happened. Plays once when
 * first seen; Replay runs it again. Each stage opens the real run on GitHub.
 */
export function Pipeline() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const motionOK = useMotionOK()
  const hydrated = useHydrated()
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [states, setStates] = useState(finalStates)
  const timers = useRef<number[]>([])

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase('playing')
    setStates(Object.fromEntries(welcomeRuns.map((r) => [r.number, 'queued'])) as Record<number, StageState>)
    const at = (seconds: number, fn: () => void) => timers.current.push(window.setTimeout(fn, seconds * 1000))
    welcomeRuns.forEach((run, i) => {
      at(startsAt[i], () => setStates((s) => ({ ...s, [run.number]: 'running' })))
      at(startsAt[i] + RUNNING_FOR, () => setStates((s) => ({ ...s, [run.number]: run.result })))
    })
    at(startsAt[startsAt.length - 1] + RUNNING_FOR + 0.1, () => setPhase('done'))
  }, [])

  useEffect(() => {
    if (inView && motionOK && phase === 'idle') play()
  }, [inView, motionOK, phase, play])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  return (
    <figure ref={ref} className="pipeline" data-phase={phase} aria-labelledby="pipeline-caption">
      <div className="pipeline-head">
        <p className="pipeline-name num">
          <span aria-hidden="true">▸ </span>welcome.yml
        </p>
        {hydrated && motionOK && (
          <button type="button" className="toggle pipeline-replay" onClick={play} disabled={phase === 'playing'}>
            <span className="toggle-sign" aria-hidden="true">
              ↻
            </span>
            Replay
          </button>
        )}
      </div>

      <ol className="stages">
        {welcomeRuns.map((run, i) => {
          const state = states[run.number]
          return (
            <li key={run.number} className="stage" data-state={state} data-result={run.result}>
              {i > 0 && <span className="stage-wire" aria-hidden="true" />}
              <a className="stage-link" href={run.url} target="_blank" rel="noopener">
                <span className="stage-top">
                  <span className="stage-run">Run {run.number}</span>
                  <time className="num" dateTime={run.at}>
                    {sydneyTime.format(new Date(run.at))}
                  </time>
                </span>
                <span className="stage-status">
                  <span className="stage-icon">
                    <StatusIcon state={state} />
                  </span>
                  <span className="stage-label">{LABEL[state]}</span>
                </span>
                <span className="stage-event">
                  on <code>{run.event}</code> · <code>{run.sha.slice(0, 7)}</code>
                </span>
                <span className="sr-only">
                  {' '}
                  (result: {LABEL[run.result]}; opens the run on GitHub in a new tab)
                </span>
              </a>
            </li>
          )
        })}
      </ol>

      <figcaption id="pipeline-caption">
        Runs of <code>welcome.yml</code> on 25 October 2026, Sydney time. Runs 1 and 2 were triggered by pushes and
        failed because the step needed pull request data. Runs 3 and 4 were triggered by a pull request and succeeded.
        The exercise’s own Step 0 to 5 checks are left out; the{' '}
        <OutLink href={`${ACTIONS_REPO}/actions`}>full run history</OutLink> is on GitHub.
      </figcaption>
    </figure>
  )
}
