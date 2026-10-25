import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useScroll } from 'motion/react'
import { goals } from '../content/goals'
import type { Goal } from '../content/types'
import { branchStyle } from '../lib/branches'
import { EASE_OUT, useHydrated, useMotionOK } from '../lib/motion'

// Everything the bottom sheet lists on small screens
const SHEET_LINKS: { href: string; label: string; goal?: Goal }[] = [
  { href: '#register', label: 'Register' },
  ...goals.map((goal) => ({ href: `#${goal.id}`, label: goal.short, goal })),
  { href: '#skills', label: 'Skills audit' },
  { href: '#future', label: 'Future goals' },
  { href: '#evidence-index', label: 'Evidence index' },
  { href: '#how-built', label: 'How this site is built' },
]

/** The goal whose chapter crosses a line 40% down the screen, or null when the reader is on main. */
function useCurrentGoal() {
  const [current, setCurrent] = useState<Goal | null>(null)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.hero')
    let raf = 0
    const check = () => {
      raf = 0
      const line = window.innerHeight * 0.4
      setCurrent(
        goals.find((goal) => {
          const rect = document.getElementById(goal.id)?.getBoundingClientRect()
          return rect !== undefined && rect.top <= line && rect.bottom > line
        }) ?? null,
      )
      setCompact(hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return { current, compact }
}

/** Bottom sheet menu for small screens. A modal dialog, so focus stays inside and Escape closes it. */
function Sheet({ current }: { current: Goal | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const close = () => dialogRef.current?.close()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    // Fires for Escape, the close button, a link and a click outside alike
    const onClose = () => {
      setOpen(false)
      buttonRef.current?.focus()
    }
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="nav-menu-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          dialogRef.current?.showModal()
          setOpen(true)
        }}
      >
        Menu
      </button>
      <dialog
        ref={dialogRef}
        className="sheet"
        aria-labelledby="sheet-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
        onKeyDown={(e) => {
          // A modal dialog lets Tab leave for the browser's own controls; wrap it instead
          if (e.key !== 'Tab') return
          const items = e.currentTarget.querySelectorAll<HTMLElement>('a[href], button')
          const first = items[0]
          const last = items[items.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }}
      >
        <div className="sheet-inner">
          <div className="sheet-head">
            <h2 id="sheet-title" className="sheet-title">
              Sections
            </h2>
            <button type="button" className="sheet-close" onClick={close}>
              Close
            </button>
          </div>
          <ul className="sheet-links">
            {SHEET_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="sheet-link"
                  style={link.goal ? branchStyle(link.goal) : undefined}
                  aria-current={link.goal && link.goal === current ? 'location' : undefined}
                  onClick={close}
                >
                  {link.goal && (
                    <span className="sheet-code">
                      <span className="nav-swatch" aria-hidden="true" />
                      {link.goal.code}
                    </span>
                  )}
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  )
}

export function Nav() {
  const hydrated = useHydrated()
  const motionOK = useMotionOK()
  const { current, compact } = useCurrentGoal()
  const { scrollYProgress } = useScroll()
  const slide = motionOK ? { duration: 0.28, ease: EASE_OUT } : { duration: 0 }

  return (
    <nav
      className="nav"
      aria-label="Sections"
      data-compact={compact ? '' : undefined}
      data-sheet={hydrated ? '' : undefined}
      style={current ? branchStyle(current) : undefined}
    >
      <a href="#top" className="nav-head">
        <span className="commit-dot" aria-hidden="true" />
        <span className="nav-head-ref num">
          HEAD <span aria-hidden="true">→</span>
        </span>{' '}
        <span className="nav-head-slot">
          <AnimatePresence initial={false}>
            <m.span
              key={current?.id ?? 'main'}
              className={current ? 'nav-head-branch' : 'nav-head-branch num'}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-110%', opacity: 0 }}
              transition={slide}
            >
              {current ? (
                <>
                  <b>{current.code}</b> · {current.short}
                </>
              ) : (
                'main'
              )}
            </m.span>
          </AnimatePresence>
        </span>
      </a>

      <ul className="nav-links">
        <li>
          <a href="#register" className="nav-link">
            Register
          </a>
        </li>
        {goals.map((goal) => (
          <li key={goal.id}>
            <a
              href={`#${goal.id}`}
              className="nav-link nav-link--goal"
              style={branchStyle(goal)}
              aria-current={goal === current ? 'location' : undefined}
            >
              <span className="nav-swatch" aria-hidden="true" />
              {goal.code}
              <span className="nav-short"> {goal.short}</span>
            </a>
          </li>
        ))}
        <li className="nav-wide">
          <a href="#evidence-index" className="nav-link">
            Evidence
          </a>
        </li>
      </ul>

      {hydrated && <Sheet current={current} />}
      {hydrated && <m.span className="nav-progress" aria-hidden="true" style={{ scaleX: scrollYProgress }} />}
    </nav>
  )
}
