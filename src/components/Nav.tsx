import { goals } from '../content/goals'
import { branchStyle } from '../lib/branches'

export function Nav() {
  return (
    <nav className="nav" aria-label="Sections">
      <a href="#top" className="nav-home num">
        <span className="commit-dot commit-dot--main" aria-hidden="true" />
        <span className="nav-name">
          joshcoble<span className="nav-branch">/main</span>
        </span>
      </a>
      <ul className="nav-links">
        <li>
          <a href="#register" className="nav-link">
            Register
          </a>
        </li>
        {goals.map((goal) => (
          <li key={goal.id}>
            <a href={`#${goal.id}`} className="nav-link nav-link--goal" style={branchStyle(goal)}>
              <span className="nav-swatch" aria-hidden="true" />
              {goal.code}
              <span className="nav-short"> {goal.short}</span>
            </a>
          </li>
        ))}
        <li className="nav-wide">
          <a href="#evidence-index" className="nav-link">
            Evidence
          </a>
        </li>
      </ul>
    </nav>
  )
}
