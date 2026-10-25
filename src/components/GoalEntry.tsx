import { scrumAttempts } from '../content/goals'
import type { EvidenceFile, EvidenceItem, Goal } from '../content/types'
import { fileMeta, fileName } from '../lib/files'
import { ActionsRuns } from './ActionsRuns'
import { OutLink } from './links'
import { Placeholder } from './Placeholder'
import { HoursFigures } from './Register'
import { Screenshot } from './Screenshot'
import { Status } from './Status'

type ShotFile = EvidenceFile & { shot: NonNullable<EvidenceFile['shot']> }
const hasShot = (file: EvidenceFile): file is ShotFile => file.shot !== undefined

function FileList({ files }: { files: EvidenceFile[] }) {
  return (
    <ul className="files">
      {files.map((file) => {
        const meta = fileMeta(file.path)
        return (
          <li key={file.path}>
            <OutLink href={meta.href} className="file-link">
              {fileName(file.path)}
            </OutLink>
            <span className="file-meta num">
              {meta.kind}
              {file.pages ? `, ${file.pages} pages` : ''}, {meta.size}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function ScrumAttempts() {
  return (
    <table className="attempts">
      <caption className="sr-only">Scrum Open scores, 20 October 2026</caption>
      <tbody>
        {scrumAttempts.map((a) => (
          <tr key={a.attempt}>
            <th scope="row">{a.attempt}</th>
            <td className="num">{a.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Evidence({ item }: { item: EvidenceItem }) {
  const shots = item.files?.filter(hasShot) ?? []
  return (
    <li className={item.unfinished ? 'ev ev--unfinished' : 'ev'}>
      <h4 className="ev-title">
        {item.title}
        {item.tag && <span className="ev-tag">{item.tag}</span>}
      </h4>
      {item.unfinished && (
        <p>
          <Placeholder>{item.unfinished}</Placeholder>
        </p>
      )}
      <p>{item.summary}</p>
      {item.parts && (
        <ol className="parts">
          {item.parts.map((part) => (
            <li key={part}>{part}</li>
          ))}
        </ol>
      )}
      {item.figure === 'scrum-attempts' && <ScrumAttempts />}
      {item.facts && (
        <dl className="facts">
          {item.facts.map((fact) => (
            <div key={fact.term}>
              <dt>{fact.term}</dt>
              <dd className="num">{fact.href ? <OutLink href={fact.href}>{fact.value}</OutLink> : fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {item.figure === 'actions-runs' && <ActionsRuns />}
      {item.files && <FileList files={item.files} />}
      {shots.length > 0 && (
        <div className="shots">
          {shots.map((file) => (
            <Screenshot key={file.path} file={file} />
          ))}
        </div>
      )}
      {item.noFile && <p className="no-file">{item.noFile}</p>}
    </li>
  )
}

export function GoalEntry({ goal }: { goal: Goal }) {
  const titleId = `${goal.id}-title`
  return (
    <article id={goal.id} className="section goal" aria-labelledby={titleId}>
      <header className="goal-head">
        <p className="goal-code num">{goal.code}</p>
        <h2 id={titleId}>{goal.title}</h2>
        <p className="goal-meta">
          <Status status={goal.status} showNote />
          <HoursFigures goal={goal} />
        </p>
      </header>

      <h3>Evidence</h3>
      <ul className="evidence">
        {goal.evidence.map((item) => (
          <Evidence key={item.title} item={item} />
        ))}
      </ul>

      <h3>What changed in my thinking</h3>
      <div className="prose">
        {goal.thinking.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {goal.outstanding.length > 0 && (
        <>
          <h3>Outstanding</h3>
          <ul className="outstanding">
            {goal.outstanding.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}
