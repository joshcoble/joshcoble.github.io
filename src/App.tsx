import { goals, profile } from './content/goals'
import { GoalEntry } from './components/GoalEntry'
import { Register } from './components/Register'
import { Colophon, EvidenceIndex, FutureGoals, Masthead, ReadingNote, SiteNav } from './components/Sections'

export function App() {
  return (
    <>
      <a className="skip-link" href="#register">
        Skip to the register
      </a>
      <Masthead />
      <SiteNav />
      <main className="wrap">
        <ReadingNote />
        <Register />
        {goals.map((goal) => (
          <GoalEntry key={goal.id} goal={goal} />
        ))}
        <FutureGoals />
        <EvidenceIndex />
        <Colophon />
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <p>{profile.name}, University of Technology Sydney</p>
        </div>
      </footer>
    </>
  )
}
