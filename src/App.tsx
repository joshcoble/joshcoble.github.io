import { LazyMotion } from 'motion/react'
import { goals } from './content/goals'
import { Chapter } from './components/Chapter'
import { Finale } from './components/Finale'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Register } from './components/Register'
import { Colophon, EvidenceIndex, FutureGoals, ReadingNote } from './components/Sections'
import { SkillsAudit } from './components/SkillsAudit'
import { ViewerProvider } from './components/Viewer'

const loadFeatures = () => import('./lib/motion-features').then((mod) => mod.default)

export function App() {
  return (
    <LazyMotion features={loadFeatures} strict>
      <ViewerProvider>
        <a className="skip-link" href="#register">
          Skip to the register
        </a>
        <Nav />
        <div className="page">
          <Hero />
          <main>
            <div className="legacy">
              <ReadingNote />
              <Register />
            </div>
            {goals.map((goal) => (
              <Chapter key={goal.id} goal={goal} />
            ))}
            <div className="legacy">
              <SkillsAudit />
              <FutureGoals />
              <EvidenceIndex />
              <Colophon />
            </div>
          </main>
          <Finale />
        </div>
      </ViewerProvider>
    </LazyMotion>
  )
}
