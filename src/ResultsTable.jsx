import { formatCount, formatScore } from './format.js';

// Отображает страницу записей об обучении и управляет переходами между страницами.
export default function ResultsTable({ rows, page, total, onPageChange }) {
  return (
    <section className="panel table-panel">
      {/* Счётчик показывает общее число записей в выборке. */}
      <div className="table-heading">
        <h2>Enrollment records</h2>
        <span>{formatCount(total)} matches</span>
      </div>
      <div className="table-wrap">
        <table>
          {/* Заголовки определяют порядок полей в таблице. */}
          <thead>
            <tr>
              <th scope="col">Student ID</th><th scope="col">Module</th><th scope="col">Presentation</th>
              <th scope="col">Age band</th><th scope="col">Region</th><th scope="col">Outcome</th>
              <th scope="col">VLE clicks</th><th scope="col">Mean score</th>
            </tr>
          </thead>
          <tbody>
            {/* Каждая строка описывает студента в конкретном проведении модуля. */}
            {rows.map(row => (
              <tr key={row.id}>
                <td>{row.student_id}</td><td>{row.presentation__module_code}</td>
                <td>{row.presentation__presentation_code}</td><td>{row.age_band}</td>
                <td>{row.region}</td>
                <td><span className={`badge ${row.final_result.toLowerCase()}`}>{row.final_result}</span></td>
                <td>{formatCount(row.total_clicks)}</td><td>{formatScore(row.mean_score)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Навигация доступна, если выборка занимает несколько страниц. */}
      {page.pages > 1 && (
        <nav className="pagination" aria-label="Enrollment pages">
          <button type="button" className="secondary" disabled={page.number <= 1}
            onClick={() => onPageChange(page.number - 1)}>Previous</button>
          <span>Page {formatCount(page.number)} of {formatCount(page.pages)}</span>
          <button type="button" className="secondary" disabled={page.number >= page.pages}
            onClick={() => onPageChange(page.number + 1)}>Next</button>
        </nav>
      )}
    </section>
  );
}
