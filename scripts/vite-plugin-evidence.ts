import fs from 'node:fs'
import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

// Evidence files live in /evidence at the repo root, not in /public, so the
// folder stays exactly as submitted. This plugin serves it in dev, copies it
// into the build output, and exposes each file's size to the page.

const DIR = 'evidence'
const VIRTUAL_ID = 'virtual:evidence'
const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.rtf': 'application/rtf',
}

// Skip Finder metadata and Word lock files (~$name.rtf)
export const isPublishable = (name: string) => !name.startsWith('.') && !name.startsWith('~$')

function listEvidence(root: string) {
  const dir = path.join(root, DIR)
  return fs
    .readdirSync(dir)
    .filter(isPublishable)
    .map((name) => ({ name, bytes: fs.statSync(path.join(dir, name)).size }))
}

export function evidence(): Plugin {
  let config: ResolvedConfig

  return {
    name: 'evidence',
    configResolved(resolved) {
      config = resolved
    },
    resolveId(source) {
      if (source === VIRTUAL_ID) return '\0' + VIRTUAL_ID
    },
    load(id) {
      if (id !== '\0' + VIRTUAL_ID) return
      const sizes = Object.fromEntries(listEvidence(config.root).map((f) => [`${DIR}/${f.name}`, f.bytes]))
      return `export const sizes = ${JSON.stringify(sizes)}`
    },
    configureServer(server) {
      server.middlewares.use(`/${DIR}/`, (req, res, next) => {
        const name = decodeURIComponent((req.url ?? '').split('?')[0].replace(/^\//, ''))
        const file = path.join(config.root, DIR, name)
        if (!isPublishable(name) || name.includes('/') || !fs.existsSync(file)) return next()
        res.setHeader('Content-Type', CONTENT_TYPES[path.extname(name).toLowerCase()] ?? 'application/octet-stream')
        fs.createReadStream(file).pipe(res)
      })
    },
    writeBundle() {
      if (config.build.ssr) return
      const out = path.join(config.root, config.build.outDir, DIR)
      fs.mkdirSync(out, { recursive: true })
      for (const { name } of listEvidence(config.root)) {
        fs.copyFileSync(path.join(config.root, DIR, name), path.join(out, name))
      }
    },
  }
}
