import { useRef } from 'react'
import { animate } from 'motion/mini'
import { ACTIONS_REPO, welcomeRuns } from '../content/actions-runs'
import { EASE_OUT, useReveal } from '../lib/reveal'
import { OutLink } from './links'

const sydneyTime = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Sydney',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const STEP = 0.45

/**
 * Draws the history in the order it happened: the line advances run by run and
 * each result is stamped as the line reaches it, so the two push failures come
 * before the pull request successes.
 */
function playRuns(figure: HTMLElement) {
  const vertical = window.matchMedia('(max-width: 40rem)').matches
  const line = figure.querySelector<HTMLElement>('.runs-line')
  const marks = figure.querySelectorAll<HTMLElement>('.run-fill')
  figure.setAttribute('data-played', '')
  if (line) {
    const axis = vertical ? 'scaleY' : 'scaleX'
    animate(line, { transform: [`${axis}(0)`, `${axis}(1)`] }, { duration: STEP * marks.length, ease: 'linear' })
  }
  marks.forEach((mark, i) => {
    animate(mark, { transform: ['scale(0)', 'scale(1)'] }, { duration: 0.35, delay: STEP * i + 0.15, ease: EASE_OUT })
  })
}

export function ActionsRuns() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, playRuns, 0.6)

  return (
    <figure className="runs" ref={ref} aria-labelledby="runs-caption">
      <div className="runs-track">
        <span className="runs-line" aria-hidden="true" />
        <ol className="runs-list">
          {welcomeRuns.map((run) => (
            <li key={run.number} className={`run run--${run.result}`}>
              <span className="run-mark" aria-hidden="true">
                <span className="run-fill">
                  {run.result === 'failure' ? (
                    <svg viewBox="0 0 12 12" width="12" height="12" focusable="false">
                      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" fill="none" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 12 12" width="12" height="12" focusable="false">
                      <path d="M2.5 6.5l2.3 2.3L9.5 3.8" stroke="currentColor" strokeWidth="1.8" fill="none" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="run-body">
                <OutLink href={run.url} className="run-title">
                  Run {run.number}
                </OutLink>
                <span className="run-result">{run.result === 'failure' ? 'Failed' : 'Succeeded'}</span>
                <span className="run-meta num">
                  on <code>{run.event}</code>
                </span>
                <span className="run-meta num">
                  <time dateTime={run.at}>{sydneyTime.format(new Date(run.at))}</time> ·{' '}
                  <OutLink href={`${ACTIONS_REPO}/commit/${run.sha}`}>
                    <span className="sr-only">Commit </span>
                    {run.sha.slice(0, 7)}
                  </OutLink>
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption id="runs-caption">
        Runs of <code>welcome.yml</code> on 25 October 2026, Sydney time. Runs 1 and 2 were triggered by pushes and
        failed because the step needed pull request data. Runs 3 and 4 were triggered by a pull request and succeeded.
        The exercise’s own Step 0 to 5 checks are left out; the{' '}
        <OutLink href={`${ACTIONS_REPO}/actions`}>full run history</OutLink> is on GitHub.
      </figcaption>
    </figure>
  )
}
