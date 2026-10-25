import type { ReactNode } from 'react'

/** Marks content still to be filled in. Uses the accent colour, which on this site means "open item". */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="placeholder" data-placeholder="">
      {children}
    </span>
  )
}
