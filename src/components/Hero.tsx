import { useEffect, useRef } from 'react'
import { animate, stagger } from 'motion/react'
import { contactPlaceholder, profile } from '../content/goals'
import { EASE_OUT, useMotionOK } from '../lib/motion'
import { OutLink } from './links'
import { Network } from './Network'
import { Terminal } from './Terminal'

/** The name lands like a poster: each line rises out of its own mask, then the intro follows. */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const motionOK = useMotionOK()

  useEffect(() => {
    const el = ref.current
    if (!el || !motionOK) return
    const lines = el.querySelectorAll<HTMLElement>('.hero-line > span')
    const after = el.querySelectorAll<HTMLElement>('.hero-after')
    animate(lines, { y: ['108%', '0%'] }, { duration: 0.9, delay: stagger(0.09), ease: EASE_OUT })
    animate(after, { opacity: [0, 1], y: [14, 0] }, { duration: 0.6, delay: stagger(0.08, { startDelay: 0.35 }), ease: EASE_OUT })
  }, [motionOK])

  const [first, ...rest] = profile.name.split(' ')

  return (
    <header ref={ref} className="hero" id="top">
      <Network />
      <div className="hero-inner">
        <p className="hero-kicker hero-after">
          <span className="commit-dot commit-dot--main" aria-hidden="true" />
          <span>Professional learning portfolio</span>
          <span className="hero-kicker-sep" aria-hidden="true">
            /
          </span>
          <span>43030 Professional Practice in Computing</span>
        </p>

        <h1 className="hero-name">
          <span className="hero-line">
            <span>{first}</span>
          </span>{' '}
          <span className="hero-line">
            <span>{rest.join(' ')}</span>
          </span>
        </h1>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-intro hero-after">
              I’m studying a Bachelor of Computing Science at the University of Technology Sydney, majoring in Business
              Information Systems Management. I’m a cadet on the applications team at NSW Police Force, where I work
              between business needs and technical delivery. I’m working towards IT project and technology management.
            </p>

            <dl className="hero-facts hero-after">
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
                {profile.contact.length > 0 ? (
                  profile.contact.map((c) => (
                    <dd key={c.href}>
                      <OutLink href={c.href}>{c.label}</OutLink>
                    </dd>
                  ))
                ) : (
                  <dd>{contactPlaceholder}</dd>
                )}
              </div>
            </dl>
          </div>

          <div className="hero-after hero-term">
            <Terminal />
          </div>
        </div>
      </div>
    </header>
  )
}
