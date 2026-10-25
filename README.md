# joshcoble.github.io

Professional learning portfolio for Joshua Coble, Bachelor of Computing Science (Business Information Systems Management), University of Technology Sydney.

The site is a register of the four goals in my Professional Learning Plan for 43030 Professional Practice in Computing, Assessment Task 3. Each goal has its status, planned and delivered hours, evidence files, and what changed in my thinking. Every evidence file is linked directly and is at most two clicks from the top of the page.

Live site: https://joshcoble.github.io

## How it is built

- **Vite, React and TypeScript.** React renders the page to static HTML at build time (`scripts/prerender.mjs`), so the page reads in full without JavaScript. In the browser, React then hydrates it for the animations, the screenshot viewer and the hero shell.
- **The page is a git graph.** Main runs down the left edge. Each goal is a branch that forks off main, carries one commit per piece of evidence, and merges back when the goal is complete. The footer (`Finale.tsx`) merges every branch into main.
- **Motion** (`motion/react`) runs the animations: the hero reveal, the `git log` terminal, the scroll-drawn branches, the hours count-up, the thinking diffs, the Actions pipeline replay, the viewer transition and the finale. Its larger feature set loads after first paint. Readers who prefer reduced motion, and anyone without JavaScript, see every figure in its final state.
- **Commit network** (`Network.tsx`): a 2D canvas behind the hero. It drifts for a few seconds after load or after the pointer moves, then settles; as the hero scrolls away, every node slides onto main. With reduced motion it is one still frame.
- **Hero shell** (`Shell.tsx`): type `help`, `whoami`, `ls`, `open g3`, `evidence` or `clear`. Everything it reaches is also linked from the page.
- **Archivo, IBM Plex Sans and IBM Plex Mono**, self-hosted through Fontsource.
- **No other runtime dependencies.** First-load JavaScript is about 123 KB gzipped, plus 19 KB for Motion's features once the page has loaded.

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

- `profile.wam` is `null`, which hides the WAM. Set it to a string such as `'89.17'` to show it.
- A goal's `diff` lists old assumptions (`was`) against what replaced them (`now`). It is shown above that goal's reflection. Use only lines that the reflection or the evidence already supports.
- A goal whose status is `complete` merges into main everywhere on the page. Any other status draws it as an open, dashed branch.

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
- the screenshot dialog takes focus, steps with the arrow keys, closes on Escape, and returns focus to the thumbnail
- the hero shell answers `help`, rejects unknown commands, recalls history, lists every evidence file, and `open g3` moves both the page and keyboard focus to Goal 3
- with reduced motion, and with JavaScript off, every figure shows its final state

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`:

1. Installs dependencies with `npm ci`.
2. Runs `npm run build`, which fails on a broken evidence link.
3. Uploads `dist/` with `actions/upload-pages-artifact`.
4. Deploys it with `actions/deploy-pages`.

The workflow's token has only `contents: read`, `pages: write` and `id-token: write`.

One-time setup: in the repository, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
