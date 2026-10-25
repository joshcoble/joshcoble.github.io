import type { Status as StatusType } from '../content/types'

/** Complete items stay in ink. Anything still open gets the accent colour and a filled marker. */
export function Status({ status, showNote = false }: { status: StatusType; showNote?: boolean }) {
  return (
    <span className={`status status--${status.kind}`}>
      <span className="status-mark" aria-hidden="true" />
      <span className="status-label">{status.label}</span>
      {showNote && status.note && <span className="status-note">{status.note}</span>}
    </span>
  )
}
