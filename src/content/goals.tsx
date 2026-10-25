import { Placeholder } from '../components/Placeholder'
import type { FutureGoal, Goal } from './types'

// All site copy and facts live in this file. Fill the placeholders by replacing
// each `null` or <Placeholder> with the real value; the README lists them all.

const GH = 'https://github.com/joshcoble'
const REVIEW_REPO = `${GH}/skills-review-pull-requests2`
const MERGE_REPO = `${GH}/skills-resolve-merge-conflicts`
const ACTIONS_REPO = `${GH}/skills-hello-github-actions`
export const SITE_REPO = `${GH}/joshcoble.github.io`

export const profile = {
  name: 'Joshua Coble',
  github: { label: 'github.com/joshcoble', href: GH },
  /** Set to e.g. { label: 'LinkedIn', href: 'https://…' } entries. Empty shows a placeholder. */
  contact: [] as { label: string; href: string }[],
  /** Set to '89.17' to show the WAM. null hides it. */
  wam: null as string | null,
  targetRoles: ['Senior IT Project Manager (Harvey Robinson)', 'Head of Supply Chain Technology (Latitude IT)'],
}

export const goals: Goal[] = [
  {
    id: 'goal-1',
    code: 'G1',
    title: 'Ethical practice with Indigenous communities',
    short: 'Indigenous ethics',
    status: { kind: 'complete', label: 'Complete' },
    plannedHours: 40,
    deliveredHours: null,
    evidence: [
      {
        title: 'CARE Principles mapping of the Saibai Island waste management proposal',
        summary: (
          <>
            Tests my group’s waste management proposal for Saibai Island, a Torres Strait Islander community, against the
            CARE Principles for Indigenous Data Governance. For each principle it records how the proposal measured up
            and what I would now do differently. The proposal was written for Communication for IT Professionals in 2025.
          </>
        ),
        files: [
          {
            path: 'evidence/care-mapping-saibai.pdf',
            description: 'CARE Principles mapping of the Saibai Island proposal',
            pages: 4,
          },
        ],
      },
      {
        title: 'AIATSIS ethical framework case study',
        summary: 'My case study on the AIATSIS ethical framework, submitted for this subject as Assessment Task 2.',
        files: [
          {
            path: 'evidence/aiatsis-case-study.pdf',
            description:
              'An email to management recommending a design studio pause its AI-generated Indigenous imagery range. It applies the AIATSIS Code, Indigenous Cultural and Intellectual Property, and free, prior and informed consent to a commercial decision, and proposes partnering with Aboriginal and Torres Strait Islander artists instead.',
            pages: 3,
          },
        ],
      },
    ],
    thinking: [
      <>
        Our report quoted the observation that Saibai had come to “rely on a system that was built for them not with
        them”. Then we proposed exactly that. Everything we knew came from secondary sources, our own decision matrix
        chose the design, and the executive summary still called it community co-design.
      </>,
      <>
        The weakest part was mine. The implementation plan I wrote gave households 60 days of letters and posters, then
        fined those who still did not separate their waste. I wrote it as a standard council approach and did not ask
        what monitoring and penalising households would mean in a community with strong traditions of collective
        decision-making.
      </>,
      <>
        The census counts 340 residents. Residents say it is closer to 500. I used the official figure and never asked
        whose number the design should rely on. Where official data and a community’s account differ, I would now
        record both and treat the community’s account as the one that needs answering.
      </>,
      <>
        Saibai is a Torres Strait Islander community, and Torres Strait Islander peoples are distinct from Aboriginal
        peoples. I wrote the mapping about that context specifically, not about Indigenous communities in general.
      </>,
    ],
    outstanding: [],
  },
  {
    id: 'goal-2',
    code: 'G2',
    title: 'Foundations in cybersecurity governance',
    short: 'Cyber governance',
    status: { kind: 'complete', label: 'Complete' },
    plannedHours: 45,
    deliveredHours: null,
    evidence: [
      {
        title: 'Essential Eight Maturity Model summary',
        summary:
          'Summarises the eight mitigation strategies, the four maturity levels and the rules for applying them, then explains why the controls matter to a project manager. Built only from public guidance from the Australian Signals Directorate.',
        files: [
          {
            path: 'evidence/essential-eight-summary.pdf',
            description: 'Essential Eight Maturity Model summary, from public ASD guidance',
            pages: 4,
          },
        ],
      },
      {
        title: 'Subject cybersecurity module and quizzes',
        summary: 'Completed.',
        noFile: 'Completed within the subject, so there is no separate file.',
      },
      {
        title: 'Capture the Flag exercises',
        tag: 'Prior evidence',
        summary:
          'Placed in the top 20% in two workplace Capture the Flag exercises, covering web exploitation, forensics, AI and log analysis.',
        noFile: 'There is no public artefact for these exercises.',
      },
    ],
    thinking: [
      <>
        An organisation’s Essential Eight maturity is set by its weakest strategy, not its strongest. ASD asks for the
        same maturity level across all eight before any one is raised, because the strategies are designed to work
        together.
      </>,
      <>
        The model is usually discussed as the security team’s concern. For a project manager, its controls arrive on every
        project as requirements: application control and patching for new software, restricted privileges for admin
        accounts, a tested backup and restore path before go-live. Each one affects scope, schedule and cost, and it
        costs less to plan for them than to find them in a late security review.
      </>,
      <>
        The same least-privilege idea came up again in <a href="#goal-3">Goal 3</a>, in how GitHub scopes the token it
        gives each workflow job.
      </>,
    ],
    outstanding: [],
  },
  {
    id: 'goal-3',
    code: 'G3',
    title: 'Software development tools: collaborative Git and CI/CD',
    short: 'Git and CI/CD',
    status: { kind: 'complete', label: 'Complete' },
    plannedHours: 40,
    deliveredHours: null,
    evidence: [
      {
        title: 'Reviewing a pull request',
        summary: 'Reviewed a pull request in a GitHub Skills exercise. My review suggestion was applied in the commit history.',
        facts: [
          { term: 'Repository', value: 'joshcoble/skills-review-pull-requests2', href: REVIEW_REPO },
          {
            term: 'Commit',
            value: '206340a  Apply suggestion from @joshcoble',
            href: `${REVIEW_REPO}/commit/206340ac57d1511dea6c9de9efd4a3beef445326`,
          },
          { term: 'Date', value: '25 October 2026' },
        ],
        files: [
          {
            path: 'evidence/gh-review-pull-requests.png',
            description: 'Repository page showing the applied suggestion on index.html',
            shot: {
              thumb: '/thumbs/gh-review-pull-requests.jpg',
              width: 720,
              height: 423,
              alt: 'GitHub repository skills-review-pull-requests2. The latest commit on index.html reads “Apply suggestion from @joshcoble”.',
            },
          },
          {
            path: 'evidence/gh-review-pull-requests-complete.png',
            description: 'Exercise issue closed as completed',
            shot: {
              thumb: '/thumbs/gh-review-pull-requests-complete.jpg',
              width: 720,
              height: 453,
              alt: 'GitHub issue thread where the github-actions bot confirms the exercise is finished and closes the issue as completed.',
            },
          },
        ],
      },
      {
        title: 'Resolving a merge conflict',
        summary: (
          <>
            Resolved a merge conflict on <code>resume.md</code> between the <code>main</code> and{' '}
            <code>my-resume</code> branches, then merged the pull request.
          </>
        ),
        facts: [
          { term: 'Repository', value: 'joshcoble/skills-resolve-merge-conflicts', href: MERGE_REPO },
          {
            term: 'Commit',
            value: "eeea4eb  Merge branch 'main' into my-resume",
            href: `${MERGE_REPO}/commit/eeea4eb885c325be4f2c431f1cfa853551831520`,
          },
          { term: 'Date', value: '25 October 2026' },
        ],
        files: [
          {
            path: 'evidence/gh-resolve-merge-conflicts.png',
            description: 'Repository page showing the merge commit on resume.md',
            shot: {
              thumb: '/thumbs/gh-resolve-merge-conflicts.jpg',
              width: 720,
              height: 423,
              alt: 'GitHub repository skills-resolve-merge-conflicts. The latest commit on resume.md reads “Merge branch main into my-resume”.',
            },
          },
          {
            path: 'evidence/gh-resolve-merge-conflicts-complete.png',
            description: 'Exercise issue closed with the review summary',
            shot: {
              thumb: '/thumbs/gh-resolve-merge-conflicts-complete.jpg',
              width: 720,
              height: 578,
              alt: 'Closed GitHub issue “Exercise: Resolve Merge Conflicts”, with the bot’s review listing the skills completed.',
            },
          },
        ],
      },
      {
        title: 'Writing a GitHub Actions workflow',
        summary: (
          <>
            Wrote <code>welcome.yml</code>, a workflow that posts a welcome comment on pull requests. It failed twice
            before it worked. The run history below shows why.
          </>
        ),
        facts: [
          { term: 'Repository', value: 'joshcoble/skills-hello-github-actions', href: ACTIONS_REPO },
          {
            term: 'Workflow',
            value: '.github/workflows/welcome.yml',
            href: `${ACTIONS_REPO}/blob/main/.github/workflows/welcome.yml`,
          },
          { term: 'Date', value: '25 October 2026' },
        ],
        figure: 'actions-runs',
        files: [
          {
            path: 'evidence/gh-actions-runs.png',
            description: 'Actions tab listing every run, including the two failures',
            shot: {
              thumb: '/thumbs/gh-actions-runs.jpg',
              width: 720,
              height: 704,
              alt: 'GitHub Actions run list for skills-hello-github-actions: nine runs, two failed “Post welcome comment” runs on pushes, the rest successful.',
            },
          },
          {
            path: 'evidence/gh-hello-actions.png',
            description: 'Repository page after the exercise was completed',
            shot: {
              thumb: '/thumbs/gh-hello-actions.jpg',
              width: 720,
              height: 704,
              alt: 'GitHub repository skills-hello-github-actions showing the .github folder updated by “Update welcome.yml” and the exercise marked complete.',
            },
          },
        ],
      },
      {
        title: 'GitHub Student Developer Pack',
        summary: 'Application approved.',
        noFile: 'No file is published for the approval.',
      },
      {
        title: 'This site',
        summary:
          'This portfolio is Goal 3 evidence too. A GitHub Actions workflow builds it, checks that every evidence link points to a real file, and deploys it to GitHub Pages on each push to main.',
        facts: [
          { term: 'Repository', value: 'joshcoble/joshcoble.github.io', href: SITE_REPO },
          {
            term: 'Workflow',
            value: '.github/workflows/deploy.yml',
            href: `${SITE_REPO}/blob/main/.github/workflows/deploy.yml`,
          },
          { term: 'Run history', value: 'Actions tab', href: `${SITE_REPO}/actions` },
        ],
      },
    ],
    thinking: [
      <>
        A workflow’s trigger decides what event data its steps receive. My step read pull request data, so it failed on
        the two push events and succeeded once a pull request triggered it.
      </>,
      <>
        <code>GITHUB_TOKEN</code> is created for each job, scoped to one repository, and expires when the job ends. That
        is least privilege applied to automation, the same principle as restricting administrative privileges in the
        Essential Eight (<a href="#goal-2">Goal 2</a>).
      </>,
    ],
    outstanding: [],
  },
  {
    id: 'goal-4',
    code: 'G4',
    title: 'Selecting and applying a project delivery methodology',
    short: 'Delivery methodology',
    status: { kind: 'in-progress', label: 'In progress' },
    plannedHours: 50,
    deliveredHours: null,
    evidence: [
      {
        title: 'Scrum.org Scrum Open assessment',
        tag: 'Free self-assessment, not a certification',
        summary:
          'Sat twice on 20 October 2026, using the feedback on each question to correct my understanding between attempts. The score summary shows the second attempt only. The reflection note documents both.',
        figure: 'scrum-attempts',
        files: [
          {
            path: 'evidence/scrum-open-93.png',
            description: 'Scrum Open score summary, second attempt (93.3%)',
            shot: {
              thumb: '/thumbs/scrum-open-93.jpg',
              width: 720,
              height: 581,
              alt: 'Scrum.org Scrum Open result: 93.3%, duration 11 minutes 12 seconds, started and finished on Tuesday 20 October 2026.',
            },
          },
          {
            path: 'evidence/scrum-open-reflection.pdf',
            description: 'Reflection note covering both Scrum Open attempts',
            pages: 3,
          },
        ],
      },
      {
        title: 'Project plan',
        unfinished: 'In progress. This entry will link to the plan when it is finished.',
        summary: 'A project plan in five parts, where I have to argue a choice of delivery approach for a specific project:',
        parts: ['Project brief', 'Schedule', 'Risk register', 'Stakeholder map', 'Methodology justification'],
      },
    ],
    thinking: [
      <>
        I had treated the Sprint as the timebox and the events inside it as loosely scheduled meetings. Sprint Planning,
        the Sprint Review and the Sprint Retrospective each have their own maximum length, and the Daily Scrum is 15
        minutes however long the Sprint runs. A timebox is a limit, not a target.
      </>,
      <>
        I also assumed Scrum replaces project managers. Scrum does not define a project manager role, but that describes
        one framework’s structure. It does not mean organisations stop needing people who own delivery, budget and
        stakeholders.
      </>,
      <>
        That changed how I read the Senior IT Project Manager ad. Its call for confidence choosing between Agile,
        Waterfall and hybrid approaches asks for judgement about which structure suits the work, not for running
        ceremonies.
      </>,
      <>
        I still rate myself at SFIA level 1 for delivery methodology. Knowing a framework is not the same as applying
        it, and the project plan is where I have to apply it.
      </>,
    ],
    outstanding: [],
  },
]

export const scrumAttempts = [
  { attempt: 'First attempt', score: '70%' },
  { attempt: 'Second attempt', score: '93.3%' },
]

export const futureGoals: FutureGoal[] = [
  {
    name: 'Budget and financial management',
    note: 'My largest gap. Both target roles require it.',
  },
  {
    name: 'Professional Scrum Master I',
    note: 'The next step after the Scrum Open assessment, and substantially harder. Not yet attempted.',
    from: 'Goal 4',
    fromHref: '#goal-4',
  },
  { name: 'PRINCE2 Foundation', note: 'Carried over from this session.', from: 'Goal 4', fromHref: '#goal-4' },
  {
    name: 'ISC2 Certified in Cybersecurity',
    note: 'Carried over from this session.',
    from: 'Goal 2',
    fromHref: '#goal-2',
  },
  { name: 'GitHub Foundations', note: 'Carried over from this session.', from: 'Goal 3', fromHref: '#goal-3' },
  { name: 'ServiceNow Certified System Administrator' },
  { name: 'ITIL 4 Foundation' },
]

/** Shown in the masthead contact row until profile.contact is filled. */
export const contactPlaceholder = <Placeholder>To fill: LinkedIn URL and/or email</Placeholder>
