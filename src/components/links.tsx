import type { ReactNode } from 'react'

/** Arrow that marks a link leaving this page. The only icon on the site. */
function OutArrow() {
  return (
    <svg className="out-arrow" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
      <path d="M3.5 2.5h6v6M9.5 2.5 2.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

/** Opens in a new tab so the reader keeps their place in the register. */
export function OutLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={className}>
      {children}
      <OutArrow />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
