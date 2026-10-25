// Fails the build if the built page links to anything that is not in dist/,
// or to an in-page anchor that does not exist. Also reports evidence files
// that nothing links to.
//
//   node scripts/check-evidence.mjs             local files and anchors
//   node scripts/check-evidence.mjs --external  also request every external URL
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const decode = (s) => s.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&quot;', '"')

const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => decode(m[1]))
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))

const errors = []
const local = new Set()
const external = new Set()

for (const ref of refs) {
  if (ref.startsWith('#')) {
    if (!ids.has(ref.slice(1))) errors.push(`anchor ${ref} has no matching id`)
  } else if (/^https?:\/\//.test(ref)) {
    external.add(ref)
  } else if (ref.startsWith('/')) {
    const file = path.join(dist, decodeURIComponent(ref.split(/[?#]/)[0]))
    local.add(ref)
    if (!fs.existsSync(file)) errors.push(`${ref} is linked but missing from dist/`)
  } else if (!ref.startsWith('mailto:')) {
    errors.push(`unexpected relative link ${ref}`)
  }
}

const evidenceDir = path.join(dist, 'evidence')
const unlinked = fs.existsSync(evidenceDir)
  ? fs.readdirSync(evidenceDir).filter((f) => !local.has(`/evidence/${f}`))
  : []

if (process.argv.includes('--external')) {
  for (const url of external) {
    try {
      let res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
      if (res.status === 405 || res.status === 403) res = await fetch(url, { redirect: 'follow' })
      if (!res.ok) errors.push(`${url} returned ${res.status}`)
    } catch (err) {
      errors.push(`${url} failed: ${err.message}`)
    }
  }
}

const evidenceLinks = [...local].filter((r) => r.startsWith('/evidence/'))
console.log(
  `check-evidence: ${evidenceLinks.length} evidence files linked, ${local.size} local paths, ${ids.size} ids, ${external.size} external URLs${process.argv.includes('--external') ? ' (requested)' : ' (not requested)'}`,
)
if (unlinked.length) console.warn(`check-evidence: not linked from the page: ${unlinked.join(', ')}`)
if (errors.length) {
  console.error(errors.map((e) => `  ✗ ${e}`).join('\n'))
  process.exit(1)
}
