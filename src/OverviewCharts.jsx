import { formatCount, formatScore } from './format.js';

// Рисует горизонтальные полосы и выводит числовые значения рядом с ними.
function Bars({ title, description, items, max, format = formatCount }) {
  return (
    <section className="panel chart">
      <h2>{title}</h2>
      <p>{description}</p>
      <ul className="bars">
        {items.map(({ label, value, color }) => (
          <li key={label}>
            <div className="bar-label"><span>{label}</span><strong>{format(value)}</strong></div>
            {/* Длина полосы пропорциональна значению на шкале диаграммы. */}
            <div className="track" aria-hidden="true">
              <div className={`bar ${color || ''}`} style={{ width: `${value / max * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Преобразует сводку API в три диаграммы страницы данных.
export default function OverviewCharts({ outcomes, ages }) {
  return (
    <div className="charts">
      {/* Количество записей по каждому итоговому результату. */}
      <Bars title="Final outcomes" description="Enrollments by recorded result"
        items={outcomes.map(row => ({
          label: row.final_result, value: row.enrollments, color: row.final_result.toLowerCase(),
        }))} max={Math.max(1, ...outcomes.map(row => row.enrollments))} />
      {/* Среднее число кликов на одну запись для каждого результата. */}
      <Bars title="VLE engagement" description="Mean clicks per enrollment, by final result"
        items={outcomes.map(row => ({
          label: row.final_result, value: row.mean_clicks, color: row.final_result.toLowerCase(),
        }))} max={Math.max(1, ...outcomes.map(row => row.mean_clicks))} />
      {/* Доля Pass и Distinction среди записей каждой возрастной группы. */}
      <Bars title="Pass rate by age" description="Pass or distinction as a share of enrollments"
        items={ages.map(row => ({
          label: row.age_band, value: row.passed * 100 / row.enrollments,
        }))} max={100} format={value => `${formatScore(value)}%`} />
    </div>
  );
}
