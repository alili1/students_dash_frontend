import { useEffect, useState } from 'react';
import { getJson } from './api.js';
import Filters from './Filters.jsx';
import OverviewCharts from './OverviewCharts.jsx';
import ResultsTable from './ResultsTable.jsx';
import { formatCount, formatScore } from './format.js';

// Пустые значения фильтров соответствуют всей выборке.
const defaults = { module: '', presentation: '', outcome: '', age: '' };

// Страница данных хранит состояние фильтров и пагинации, загружает и распределяет данные.
export default function Dashboard() {
  const [filters, setFilters] = useState(defaults);
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState(null);
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  // Параметры запроса содержат номер страницы и только заполненные фильтры.
  const params = new URLSearchParams({ page });
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();

  // Варианты фильтров загружаются при открытии страницы и повторной попытке.
  useEffect(() => {
    const controller = new AbortController();
    getJson('api/options/', controller.signal)
      .then(data => setOptions(data))
      .catch(() => {
        if (!controller.signal.aborted) setOptions(null);
      });
    return () => controller.abort();
  }, [attempt]);

  // При смене запроса загружает новую выборку и отменяет предыдущий запрос.
  useEffect(() => {
    const controller = new AbortController();
    getJson(`api/dashboard/?${query}`, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setResult({ query, attempt, data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ query, attempt, error: true });
      });
    return () => controller.abort();
  }, [query, attempt]);

  // Проверяет, относится ли полученный результат к текущему запросу.
  const current = result?.query === query && result.attempt === attempt ? result : null;
  const data = result?.data;
  const hasData = Boolean(data?.summary.enrollments);

  // После изменения фильтров открывает первую страницу новой выборки.
  function changeFilters(next) {
    setFilters(next);
    setPage(1);
  }

  return (
    <main className="container">
      {/* Заголовок страницы поясняет, какие данные можно исследовать. */}
      <section className="hero">
        <div className="eyebrow">Open University Learning Analytics Dataset</div>
        <h1>Student engagement & outcomes</h1>
        <p>Explore how students interacted with course materials and how their enrollments ended.</p>
      </section>

      {/* Панель фильтров появляется после загрузки доступных значений. */}
      {options && <Filters options={options} filters={filters} onChange={changeFilters}
        onReset={() => changeFilters(defaults)} />}

      {/* Статусы загрузки, ошибки и отсутствия записей выводятся отдельно. */}
      {!current && <p className="notice" role="status">Loading cohort data…</p>}
      {current?.error && (
        <div className="notice error" role="alert">
          Could not load dashboard data. Check that Django and PostgreSQL are running.
          <button type="button" className="secondary" onClick={() => setAttempt(value => value + 1)}>
            Try again
          </button>
        </div>
      )}
      {current?.data && !hasData && (
        <p className="notice">
          {options?.presentations.length
            ? 'No enrollments match these filters.'
            : 'No enrollments have been imported. Run the Django import_oulad command to load the dataset.'}
        </p>
      )}

      {hasData && !current?.error && (
        <div aria-busy={!current}>
          {/* Сводные показатели относятся ко всей отфильтрованной выборке. */}
          <section className="metrics" aria-label="Cohort totals">
            <div className="panel metric"><span>Unique students</span><strong>{formatCount(data.summary.students)}</strong></div>
            <div className="panel metric"><span>Enrollments</span><strong>{formatCount(data.summary.enrollments)}</strong></div>
            <div className="panel metric"><span>VLE clicks</span><strong>{formatCount(data.summary.clicks)}</strong></div>
            <div className="panel metric"><span>Mean enrollment score</span><strong>{formatScore(data.summary.mean_score)}</strong></div>
          </section>
          {/* Диаграммы показывают сводку, таблица содержит только текущую страницу. */}
          <OverviewCharts outcomes={data.outcomes} ages={data.ages} />
          <ResultsTable rows={data.rows} page={data.page} total={data.summary.enrollments} onPageChange={setPage} />
        </div>
      )}
      {/* Подвал указывает источник и лицензию данных. */}
      <footer>Data from The Open University · OULAD · CC BY 4.0</footer>
    </main>
  );
}
