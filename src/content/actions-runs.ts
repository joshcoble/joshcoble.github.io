import type { Run } from './types'

// Runs of .github/workflows/welcome.yml in joshcoble/skills-hello-github-actions,
// copied from the GitHub REST API (GET /repos/{owner}/{repo}/actions/runs).
// The exercise's own Step 0 to 5 checker workflows are left out.

export const ACTIONS_REPO = 'https://github.com/joshcoble/skills-hello-github-actions'

export const welcomeRuns: Run[] = [
  {
    number: 1,
    event: 'push',
    result: 'failure',
    sha: 'f224af5ae41fbbe8bbf15edc5404c5f121426653',
    at: '2026-10-25T06:51:25Z',
    url: `${ACTIONS_REPO}/actions/runs/40170597191`,
  },
  {
    number: 2,
    event: 'push',
    result: 'failure',
    sha: 'aed19cd2523562c91ede61d32b37aefe5f870c1f',
    at: '2026-10-25T06:53:27Z',
    url: `${ACTIONS_REPO}/actions/runs/40170721942`,
  },
  {
    number: 3,
    event: 'pull_request',
    result: 'success',
    sha: '7513dd3b5d4aca93315182ee749e61b9f3b62392',
    at: '2026-10-25T07:00:17Z',
    url: `${ACTIONS_REPO}/actions/runs/40171140903`,
  },
  {
    number: 4,
    event: 'pull_request',
    result: 'success',
    sha: '556608156b00b588790270f47383f25ec7cb7bef',
    at: '2026-10-25T07:06:10Z',
    url: `${ACTIONS_REPO}/actions/runs/40171519842`,
  },
]
