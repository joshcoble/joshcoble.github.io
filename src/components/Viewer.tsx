import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, m } from 'motion/react'
import { goals } from '../content/goals'
import type { EvidenceFile } from '../content/types'
import { branchColour } from '../lib/branches'
import { fileMeta, fileName } from '../lib/files'
import { EASE_OUT, useMotionOK } from '../lib/motion'
import { OutLink } from './links'

type Shot = EvidenceFile & { shot: NonNullable<EvidenceFile['shot']>; goalId: string; goalCode: string }

// Every screenshot on the page, in reading order. Arrow keys move through this list.
const SHOTS: Shot[] = goals.flatMap((goal) =>
  goal.evidence.flatMap((item) =>
    (item.files ?? [])
      .filter((f): f is Shot => f.shot !== undefined)
      .map((f) => ({ ...f, goalId: goal.id, goalCode: goal.code })),
  ),
)

interface ViewerState {
  index: number | null
  /** The screenshot the viewer was opened from; it alone animates back to its thumbnail. */
  origin: number | null
  open: (path: string, opener: HTMLElement) => void
}

const ViewerContext = createContext<ViewerState>({ index: null, origin: null, open: () => {} })

const layoutIdFor = (path: string) => `shot-${path}`
const prefersSlide = (i: number | null, origin: number | null) => i !== null && i !== origin

export function ViewerProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const [index, setIndex] = useState<number | null>(null)
  const [origin, setOrigin] = useState<number | null>(null)
  const [direction, setDirection] = useState(0)
  const motionOK = useMotionOK()

  const open = useCallback((path: string, from: HTMLElement) => {
    const i = SHOTS.findIndex((s) => s.path === path)
    if (i < 0) return
    opener.current = from
    // Open first, so the image mounts into a laid-out dialog and the shared-element
    // transition measures real sizes.
    if (dialog.current && !dialog.current.open) dialog.current.showModal()
    setDirection(0)
    setOrigin(i)
    setIndex(i)
  }, [])

  const close = useCallback(() => {
    setIndex(null)
    setOrigin(null)
    dialog.current?.close()
    opener.current?.focus()
  }, [])

  const step = useCallback((by: number) => {
    setDirection(by)
    setIndex((i) => (i === null ? i : (i + by + SHOTS.length) % SHOTS.length))
  }, [])

  const isOpen = index !== null
  useLayoutEffect(() => {
    if (isOpen) closeButton.current?.focus()
  }, [isOpen])

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    const onCancel = (e: Event) => {
      e.preventDefault()
      close()
    }
    d.addEventListener('cancel', onCancel)
    return () => d.removeEventListener('cancel', onCancel)
  }, [close])

  const value = useMemo(() => ({ index, origin, open }), [index, origin, open])
  const shot = index === null ? null : SHOTS[index]

  return (
    <ViewerContext.Provider value={value}>
      {children}
      <dialog
        ref={dialog}
        className="viewer"
        aria-labelledby="viewer-title"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
      >
        {shot && (
          <div
            className="viewer-frame"
            style={{ '--branch': branchColour(shot.goalId) } as CSSProperties}
            onClick={(e) => {
              if (e.target === e.currentTarget) close()
            }}
          >
            <div className="viewer-bar">
              <p className="viewer-count" aria-live="polite">
                <span className="viewer-goal">{shot.goalCode}</span> {index! + 1} / {SHOTS.length}
              </p>
              <p id="viewer-title" className="viewer-title">
                {shot.description}
              </p>
              <div className="viewer-actions">
                <OutLink href={fileMeta(shot.path).href} className="viewer-open num">
                  {fileName(shot.path)}
                </OutLink>
                <button type="button" className="toggle" onClick={() => step(-1)} aria-label="Previous screenshot">
                  <span aria-hidden="true">←</span>
                </button>
                <button type="button" className="toggle" onClick={() => step(1)} aria-label="Next screenshot">
                  <span aria-hidden="true">→</span>
                </button>
                <button ref={closeButton} type="button" className="toggle" onClick={close}>
                  Close <kbd>Esc</kbd>
                </button>
              </div>
            </div>
            <div className="viewer-stage">
              <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                <m.img
                  key={shot.path}
                  src={fileMeta(shot.path).href}
                  alt={shot.shot.alt}
                  className="viewer-img"
                  width={shot.shot.width}
                  height={shot.shot.height}
                  style={{
                    '--ar': `${shot.shot.width} / ${shot.shot.height}`,
                    '--ar-n': shot.shot.width / shot.shot.height,
                    backgroundImage: `url(${shot.shot.thumb})`,
                  } as CSSProperties}
                  layoutId={index === origin ? layoutIdFor(shot.path) : undefined}
                  custom={direction}
                  initial={prefersSlide(index, origin) && motionOK ? { opacity: 0, x: direction * 60 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={motionOK ? { opacity: 0, x: direction * -60 } : { opacity: 0 }}
                  transition={motionOK ? { duration: 0.45, ease: EASE_OUT } : { duration: 0 }}
                />
              </AnimatePresence>
            </div>
          </div>
        )}
      </dialog>
    </ViewerContext.Provider>
  )
}

/**
 * A screenshot thumbnail. It is a real link to the full PNG; a plain click
 * opens the viewer instead, and the thumbnail itself flies up to fill it.
 */
export function Thumb({ file }: { file: EvidenceFile & { shot: NonNullable<EvidenceFile['shot']> } }) {
  const { index, origin, open } = useContext(ViewerContext)
  const motionOK = useMotionOK()
  const href = fileMeta(file.path).href
  const mine = SHOTS.findIndex((s) => s.path === file.path)
  const lifted = index !== null && origin === mine

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    open(file.path, event.currentTarget)
  }

  return (
    <figure className="thumb">
      <a href={href} onClick={onClick} className="thumb-link" aria-label={`View screenshot: ${file.description}`}>
        <span className="thumb-box" style={{ aspectRatio: `${file.shot.width} / ${file.shot.height}` }}>
          {!lifted && (
            <m.img
              src={file.shot.thumb}
              alt={file.shot.alt}
              width={file.shot.width}
              height={file.shot.height}
              loading="lazy"
              decoding="async"
              layoutId={motionOK ? layoutIdFor(file.path) : undefined}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            />
          )}
        </span>
      </a>
      <figcaption className="thumb-caption">{file.description}</figcaption>
    </figure>
  )
}
