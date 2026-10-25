import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { goals, profile } from '../content/goals'
import { branchStyle } from '../lib/branches'
import { fileMeta, fileName } from '../lib/files'
import { useMotionOK } from '../lib/motion'
import { OutLink } from './links'

// A small working shell under the hero's git log. It is a shortcut, not the way
// round the site: everything it reaches is also linked from the page.

const PLACES: Record<string, { id: string; label: string }> = {
  register: { id: 'register', label: 'the register' },
  evidence: { id: 'evidence-index', label: 'the evidence index' },
  future: { id: 'future', label: 'future goals' },
  skills: { id: 'skills', label: 'the skills audit' },
  site: { id: 'how-built', label: 'how this site is built' },
}
for (const goal of goals) {
  const place = { id: goal.id, label: `${goal.code} ${goal.short}` }
  PLACES[goal.code.toLowerCase()] = place
  PLACES[goal.code.slice(1)] = place
  PLACES[goal.id] = place
}

const HELP: [string, string][] = [
  ['help', 'list these commands'],
  ['whoami', 'who this portfolio belongs to'],
  ['ls', 'list the goals'],
  ['open g1 … g4', 'jump to a goal'],
  ['open register', 'also skills, evidence, future, site'],
  ['evidence', 'list every evidence file'],
  ['clear', 'clear this output'],
]

interface Entry {
  id: number
  input: string
  output: ReactNode
}

function goTo(id: string, smooth: boolean) {
  const target = document.getElementById(id)
  if (!target) return
  history.pushState(null, '', `#${id}`)
  target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  // Move focus with the reader, so the next Tab continues from the section they asked for
  const heading = target.querySelector<HTMLElement>('h2') ?? target
  heading.tabIndex = -1
  heading.focus({ preventScroll: true })
}

export function Shell() {
  const motionOK = useMotionOK()
  const [log, setLog] = useState<Entry[]>([])
  const [value, setValue] = useState('')
  const past = useRef<string[]>([])
  const cursor = useRef(0)
  const nextId = useRef(0)
  const logRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log])

  function respond(raw: string): ReactNode | 'clear' {
    const [cmd = '', ...args] = raw.toLowerCase().split(/\s+/)
    const arg = args.join(' ')
    switch (cmd) {
      case 'help':
      case '?':
        return (
          <dl className="shell-help">
            {HELP.map(([c, d]) => (
              <div key={c}>
                <dt>{c}</dt>
                <dd>{d}</dd>
              </div>
            ))}
          </dl>
        )
      case 'whoami':
        return (
          <>
            <p>
              {profile.name}. Bachelor of Computing Science student at UTS, majoring in Business Information Systems
              Management. Cadet on the applications team at NSW Police Force. Working towards IT project and technology
              management.
            </p>
            <p>
              <OutLink href={profile.github.href}>{profile.github.label}</OutLink>
              {profile.contact.map((c) => (
                <span key={c.href}>
                  {'  '}
                  <OutLink href={c.href}>{c.label}</OutLink>
                </span>
              ))}
            </p>
          </>
        )
      case 'ls':
        return (
          <ul className="shell-list">
            {goals.map((goal) => (
              <li key={goal.id} style={branchStyle(goal)}>
                <a href={`#${goal.id}`} className="shell-goal">
                  {goal.code.toLowerCase()}/
                </a>{' '}
                {goal.title} <span className="shell-dim">({goal.status.label.toLowerCase()})</span>
              </li>
            ))}
          </ul>
        )
      case 'open':
      case 'cd': {
        if (!arg) return 'open what? Try open g3.'
        const place = PLACES[arg.replace(/\/$/, '')]
        if (!place) return `Nothing called ${arg}. Try open g1 to open g4, or open register.`
        goTo(place.id, motionOK)
        return `Opening ${place.label}.`
      }
      case 'evidence':
        return (
          <ul className="shell-list">
            {goals.flatMap((goal) =>
              goal.evidence.flatMap((item) =>
                (item.files ?? []).map((file) => {
                  const meta = fileMeta(file.path)
                  return (
                    <li key={file.path} style={branchStyle(goal)}>
                      <span className="shell-goal">{goal.code.toLowerCase()}</span>{' '}
                      <OutLink href={meta.href}>{fileName(file.path)}</OutLink>{' '}
                      <span className="shell-dim">{meta.size}</span>
                    </li>
                  )
                }),
              ),
            )}
          </ul>
        )
      case 'clear':
        return 'clear'
      default:
        return `command not found: ${cmd}. Type help for the list.`
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const input = value.trim()
    setValue('')
    if (!input) return
    past.current.push(input)
    cursor.current = past.current.length
    const output = respond(input)
    if (output === 'clear') return setLog([])
    setLog((entries) => [...entries.slice(-5), { id: nextId.current++, input, output }])
  }

  // Up and Down step through earlier commands, as in a real shell
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    const earlier = past.current
    if (!earlier.length) return
    e.preventDefault()
    cursor.current = Math.min(earlier.length, Math.max(0, cursor.current + (e.key === 'ArrowUp' ? -1 : 1)))
    setValue(earlier[cursor.current] ?? '')
  }

  return (
    <div className="shell">
      {log.length > 0 && (
        <div ref={logRef} className="shell-log" role="log" aria-label="Terminal output" tabIndex={0}>
          {log.map((entry) => (
            <div key={entry.id} className="shell-entry">
              <p className="shell-echo">
                <span aria-hidden="true">$ </span>
                {entry.input}
              </p>
              <div className="shell-out">{entry.output}</div>
            </div>
          ))}
        </div>
      )}
      <form className="shell-form" onSubmit={submit}>
        <label htmlFor="shell-input" className="sr-only">
          Terminal command. Type help for the list.
        </label>
        <span className="term-prompt" aria-hidden="true">
          $
        </span>
        <input
          id="shell-input"
          className="shell-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="type help"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
        />
      </form>
    </div>
  )
}
