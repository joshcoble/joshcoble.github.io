# joshcoble.github.io

Professional learning portfolio for Joshua Coble, Bachelor of Computing Science (Business Information Systems Management), University of Technology Sydney.

The site is a register of the four goals in my Professional Learning Plan for 43030 Professional Practice in Computing, Assessment Task 3. Each goal has its status, planned and delivered hours, evidence files, and what changed in my thinking. Every evidence file is linked directly and is at most two clicks from the top of the page.

Live site: https://joshcoble.github.io

## How it is built

- **Vite, React and TypeScript.** React renders the page to static HTML at build time (`scripts/prerender.mjs`), so the page reads in full without JavaScript. In the browser, React then hydrates it for the screenshot dialogs and the two animations.
- **Motion** (`motion/mini` and `inView`) runs the two animations: the delivered-hours bars in the register, and the Actions run history in Goal 3. Readers who prefer reduced motion, and anyone without JavaScript, see both in their final state.
- **IBM Plex Sans and IBM Plex Mono**, self-hosted through Fontsource.
- **No other runtime dependencies.** First-load JavaScript is about 81 KB gzipped.

## Evidence files

Evidence lives in `evidence/` at the repo root, exactly as submitted. A small Vite plugin (`scripts/vite-plugin-evidence.ts`) serves the folder during development, copies it into `dist/evidence/` at build time, and gives the page each file's size. Finder metadata (`.DS_Store`) and Word lock files (`~$*`) are never copied.

The build fails if:

- a file named in `src/content/goals.tsx` is missing from `evidence/`
- the built page links to any local path that is not in `dist/`, or to an in-page anchor with no matching id (`scripts/check-evidence.mjs`)

Screenshot thumbnails in `public/thumbs/` are 720 px JPEG copies of the PNGs. They were made with macOS `sips`. If you change a screenshot, regenerate its thumbnail:

```sh
sips -s format jpeg -s formatOptions 72 --resampleWidth 720 evidence/NAME.png --out public/thumbs/NAME.jpg
```

## Editing content

All copy and facts are in `src/content/goals.tsx`. Run data for the Actions figure is in `src/content/actions-runs.ts`, copied from the GitHub REST API.

### Placeholders still to fill

| Where | What |
| --- | --- |
| `goals.tsx`, each goal's `deliveredHours` | Delivered hours for G1 to G4 (currently `null`, shown as "to fill") |
| `goals.tsx`, G1 `status` | Choose `complete` or `partly`, and set the label to match |
| `goals.tsx`, `profile.contact` | LinkedIn URL and/or email, e.g. `{ label: 'LinkedIn', href: 'https://…' }` |
| `goals.tsx`, `profile.wam` | Set to `'89.17'` to show the WAM, or leave `null` to hide it |
| `goals.tsx`, G4 "Project plan" item | When the plan is finished, add its file to `evidence/`, add it under `files`, and remove `unfinished` |

## Commands

```sh
npm ci                 # install exact versions from package-lock.json
npm run dev            # dev server at http://localhost:5173
npm run build          # type-check, build, prerender, check evidence links
npm run preview        # serve dist/ at http://localhost:4173
npm test               # Playwright + axe tests against the preview server
node scripts/check-evidence.mjs --external   # also request every external URL
```

The first time you run the tests, install the browser with `npx playwright install chromium`.

## Tests

`tests/site.spec.ts` runs against the production build:

- axe checks for WCAG 2.2 A and AA, plus axe best practices, at 375, 768 and 1280 px
- no horizontal scrolling at those widths
- every tab stop shows a visible focus outline, and the skip link is the first tab stop
- a goal can be reached from the register, and its file opens with one more click
- every evidence link returns 200 with the right content type
- the screenshot dialog takes focus, closes on Escape, and returns focus to the thumbnail
- with reduced motion, and with JavaScript off, every figure shows its final state

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`:

1. Installs dependencies with `npm ci`.
2. Runs `npm run build`, which fails on a broken evidence link.
3. Uploads `dist/` with `actions/upload-pages-artifact`.
4. Deploys it with `actions/deploy-pages`.

The workflow's token has only `contents: read`, `pages: write` and `id-token: write`.

One-time setup: in the repository, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
