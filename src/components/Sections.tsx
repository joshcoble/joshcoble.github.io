import { contactPlaceholder, futureGoals, goals, profile, SITE_REPO } from '../content/goals'
import { fileMeta, fileName } from '../lib/files'
import { OutLink } from './links'

export function Masthead() {
  return (
    <header className="masthead">
      <div className="wrap">
        <p className="kicker num">Professional learning portfolio</p>
        <h1>{profile.name}</h1>
        <p className="intro">
          I’m studying a Bachelor of Computing Science at the University of Technology Sydney, majoring in Business
          Information Systems Management. I’m a cadet on the applications team at NSW Police Force, where I work between
          business needs and technical delivery. I’m working towards IT project and technology management.
        </p>
        <dl className="profile">
          <div>
            <dt>Target roles in my learning plan</dt>
            {profile.targetRoles.map((role) => (
              <dd key={role}>{role}</dd>
            ))}
          </div>
          {profile.wam && (
            <div>
              <dt>Weighted average mark</dt>
              <dd className="num">{profile.wam}</dd>
            </div>
          )}
          <div>
            <dt>Contact</dt>
            <dd>
              <OutLink href={profile.github.href}>{profile.github.label}</OutLink>
            </dd>
            {profile.contact.length > 0
              ? profile.contact.map((c) => (
                  <dd key={c.href}>
                    <OutLink href={c.href}>{c.label}</OutLink>
                  </dd>
                ))
              : <dd>{contactPlaceholder}</dd>}
          </div>
          <div>
            <dt>Register updated</dt>
            <dd className="num">{__BUILD_DATE__}</dd>
          </div>
        </dl>
      </div>
    </header>
  )
}

export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Sections">
      <div className="wrap">
        <ul>
          <li>
            <a href="#register">Register</a>
          </li>
          {goals.map((g) => (
            <li key={g.id}>
              <a href={`#${g.id}`}>
                <span className="num">{g.code}</span>
                <span className="sr-only"> {g.title}</span>
              </a>
            </li>
          ))}
          <li>
            <a href="#future">Future goals</a>
          </li>
          <li>
            <a href="#evidence-index">Evidence index</a>
          </li>
          <li>
            <a href="#how-built">How this site is built</a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export function ReadingNote() {
  return (
    <section className="section reading-note" aria-labelledby="reading-title">
      <h2 id="reading-title">Reading this register</h2>
      <div className="prose">
        <p>
          This register records the four goals in my Professional Learning Plan for 43030 Professional Practice in
          Computing, Assessment Task 3. Each entry shows its status, planned and delivered hours, the evidence, and what
          changed in my thinking.
        </p>
        <p>
          Every file opens directly from its entry, and the <a href="#evidence-index">evidence index</a> lists them all in
          one place. Anything not yet finished is labelled and shown <span className="accent-sample">in this colour</span>.
        </p>
      </div>
    </section>
  )
}

export function FutureGoals() {
  return (
    <section id="future" className="section" aria-labelledby="future-title">
      <h2 id="future-title">Future goals</h2>
      <p className="section-lede">Not started or carried over from this session. None of these is claimed as done.</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Goal</th>
              <th scope="col">Why it is here</th>
              <th scope="col">Carried over from</th>
            </tr>
          </thead>
          <tbody>
            {futureGoals.map((g) => (
              <tr key={g.name}>
                <th scope="row">{g.name}</th>
                <td>{g.note}</td>
                <td className="num">{g.fromHref ? <a href={g.fromHref}>{g.from}</a> : g.from}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function EvidenceIndex() {
  const rows = goals.flatMap((goal) =>
    goal.evidence.flatMap((item) => (item.files ?? []).map((file) => ({ goal, file, meta: fileMeta(file.path) }))),
  )
  return (
    <section id="evidence-index" className="section" aria-labelledby="index-title">
      <h2 id="index-title">Evidence index</h2>
      <p className="section-lede">Every file on this site, one click from here.</p>
      <div className="table-wrap">
        <table className="data-table evidence-index">
          <thead>
            <tr>
              <th scope="col">File</th>
              <th scope="col">What it shows</th>
              <th scope="col">Goal</th>
              <th scope="col">Type</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ goal, file, meta }) => (
              <tr key={file.path}>
                <td>
                  <OutLink href={meta.href} className="file-link">
                    {fileName(file.path)}
                  </OutLink>
                </td>
                <td>{file.description}</td>
                <td className="num">
                  <a href={`#${goal.id}`}>{goal.code}</a>
                </td>
                <td className="num nowrap">
                  {meta.kind}, {meta.size}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function Colophon() {
  return (
    <section id="how-built" className="section" aria-labelledby="built-title">
      <h2 id="built-title">How this site is built</h2>
      <div className="prose">
        <p>
          This site is part of the evidence for <a href="#goal-3">Goal 3</a>. The source is in{' '}
          <OutLink href={SITE_REPO}>joshcoble/joshcoble.github.io</OutLink>. Vite and React render it to static HTML at
          build time, so it reads without JavaScript.
        </p>
        <p>
          On every push to <code>main</code>, the{' '}
          <OutLink href={`${SITE_REPO}/blob/main/.github/workflows/deploy.yml`}>deploy workflow</OutLink> installs
          dependencies, builds the site, fails if any evidence link points to a missing file, and publishes the result to
          GitHub Pages. Each run is listed in the <OutLink href={`${SITE_REPO}/actions`}>Actions history</OutLink>.
        </p>
        <p>Type is IBM Plex Sans and IBM Plex Mono.</p>
      </div>
    </section>
  )
}
