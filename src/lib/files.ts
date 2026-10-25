import { sizes } from 'virtual:evidence'

export type FileKind = 'PDF' | 'PNG' | 'RTF'

/**
 * Type and size for an evidence file. Throws when the file is missing, so a
 * renamed or deleted file fails the build instead of shipping a broken link.
 */
export function fileMeta(path: string): { kind: FileKind; size: string; href: string } {
  const bytes = sizes[path]
  if (bytes === undefined) {
    throw new Error(`Evidence file not found: ${path}. Check the name in src/content/goals.tsx against /evidence.`)
  }
  const kind = path.split('.').pop()!.toUpperCase() as FileKind
  const size = bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`
  return { kind, size, href: `/${path}` }
}

export function fileName(path: string) {
  return path.split('/').pop()!
}
