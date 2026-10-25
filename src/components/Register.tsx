import { goals } from '../content/goals'
import type { Goal } from '../content/types'
import { Status } from './Status'

function fileCount(goal: Goal) {
  const n = goal.evidence.reduce((sum, item) => sum + (item.files?.length ?? 0), 0)
  return `${n} ${n === 1 ? 'file' : 'files'}`
}

export function Register() {
  return (
    <section id="register" className="section" aria-labelledby="register-title">
      <h2 id="register-title">Register</h2>
      <div className="table-wrap">
        <table className="register">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Goal and status</th>
              <th scope="col" className="col-evidence">
                Evidence
              </th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal) => (
              <tr key={goal.id}>
                <th scope="row" className="num">
                  {goal.code}
                </th>
                <td>
                  <a href={`#${goal.id}`} className="register-goal">
                    {goal.title}
                  </a>
                  <Status status={goal.status} />
                </td>
                <td className="num col-evidence">{fileCount(goal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
