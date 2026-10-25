// Renders the app to static HTML and writes it into dist/index.html, so the
// page is complete before any JavaScript runs.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// React picks its production server build from NODE_ENV at import time.
process.env.NODE_ENV = 'production'

const dist = path.resolve('dist')
const ssrDir = path.resolve('dist-ssr')
const entry = fs.readdirSync(ssrDir).find((f) => /^entry-server\.(m?js)$/.test(f))
if (!entry) throw new Error(`No entry-server bundle found in ${ssrDir}`)

const { render } = await import(pathToFileURL(path.join(ssrDir, entry)).href)
const templatePath = path.join(dist, 'index.html')
const template = fs.readFileSync(templatePath, 'utf8')
if (!template.includes('<!--app-->')) throw new Error('dist/index.html has no <!--app--> marker')

const html = render()
fs.writeFileSync(templatePath, template.replace('<!--app-->', html))
fs.rmSync(ssrDir, { recursive: true, force: true })
console.log(`prerender: wrote ${(html.length / 1024).toFixed(1)} KB of HTML into dist/index.html`)
