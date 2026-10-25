import { useId, useRef, type MouseEvent } from 'react'
import type { EvidenceFile } from '../content/types'
import { fileMeta, fileName } from '../lib/files'
import { OutLink } from './links'

/**
 * A thumbnail that is a real link to the full PNG. With a plain click it opens
 * the image in a native <dialog> instead, so the reader keeps their place.
 * Modifier clicks, middle clicks and no-JS all fall through to the link.
 */
export function Screenshot({ file }: { file: EvidenceFile & { shot: NonNullable<EvidenceFile['shot']> } }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const { href } = fileMeta(file.path)

  function open(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!dialog.current?.showModal) return
    event.preventDefault()
    dialog.current.showModal()
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialog.current) dialog.current.close()
  }

  return (
    <figure className="shot">
      <a href={href} onClick={open} className="shot-link">
        <img
          src={file.shot.thumb}
          alt={file.shot.alt}
          width={file.shot.width}
          height={file.shot.height}
          loading="lazy"
          decoding="async"
        />
      </a>
      <figcaption className="shot-caption">{file.description}</figcaption>

      <dialog ref={dialog} className="shot-dialog" aria-labelledby={titleId} onClick={closeOnBackdrop}>
        <div className="shot-dialog-bar">
          <p id={titleId} className="shot-dialog-title">
            {file.description}
          </p>
          <OutLink href={href} className="shot-dialog-open">
            Open {fileName(file.path)}
          </OutLink>
          <button type="button" className="button" onClick={() => dialog.current?.close()} autoFocus>
            Close
          </button>
        </div>
        <img src={href} alt={file.shot.alt} loading="lazy" decoding="async" />
      </dialog>
    </figure>
  )
}
