import { useEffect, useState } from 'react';
import { getJson } from './api.js';
import { HistogramPlot, QuantilePlot, CorrelationTable } from './GraphicPlots.jsx';

// Загружает данные графика или список показателей и поддерживает повтор запроса.
function useGraphic(query = '') {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // При недостаточном выборе показателей запрос откладывается.
    if (query === null) return;
    const controller = new AbortController();
    getJson('api/graphics/' + (query ? '?' + query : ''), controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setResult({ query, attempt, data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ query, attempt, error: true });
      });
    return () => controller.abort();
  }, [query, attempt]);

  // Учитывает только ответ для текущих параметров и номера попытки.
  const current = result?.query === query && result.attempt === attempt ? result : null;
  return { ...current, retry: () => setAttempt(value => value + 1) };
}

// Показывает загрузку, ошибку, пустую выборку или готовый график.
function GraphicResult({ result, children }) {
  if (result.error) {
    return (
      <p className="notice error" role="alert">
        Could not load the chart data.
        <button className="secondary" type="button" onClick={result.retry}>Try again</button>
      </p>
    );
  }
  if (!result.data) return <p className="notice" role="status">Loading chart data…</p>;
  if (result.data.count === 0) return <p className="notice">No observations for this metric.</p>;
  return children(result.data);
}

// Общий список выбора одного числового показателя для графиков.
function MetricSelect({ metrics, value, onChange }) {
  return (
    <label>Metric
      <select value={value} onChange={event => onChange(event.target.value)}>
        {metrics.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
      </select>
    </label>
  );
}

// Конструктор гистограммы хранит выбранный показатель и количество интервалов.
function Histogram({ metrics }) {
  const [metric, setMetric] = useState('total_clicks');
  const [bins, setBins] = useState('20');
  const result = useGraphic(new URLSearchParams({ chart: 'histogram', metric, bins }).toString());
  const label = metrics.find(item => item.id === metric).label;

  return (
    <section className="panel graphic-section" aria-labelledby="histogram-heading">
      <h2 id="histogram-heading">Distribution histogram</h2>
      <p>Count enrollments in equal-width intervals across the observed range.</p>
      {/* Изменение показателя или числа интервалов обновляет запрос к API. */}
      <div className="graphic-controls">
        <MetricSelect metrics={metrics} value={metric} onChange={setMetric} />
        <label>Bins
          <select value={bins} onChange={event => setBins(event.target.value)}>
            {[5, 10, 20, 30, 40, 60].map(count => <option key={count}>{count}</option>)}
          </select>
        </label>
      </div>
      <GraphicResult result={result}>
        {data => <HistogramPlot bins={data.bins} count={data.count} label={label} />}
      </GraphicResult>
    </section>
  );
}

// Конструктор квантильного графика переключает процентили и нормальный Q–Q.
function Quantile({ metrics }) {
  const [metric, setMetric] = useState('mean_score');
  const [mode, setMode] = useState('empirical');
  const result = useGraphic(new URLSearchParams({ chart: 'quantile', metric, mode }).toString());
  const label = metrics.find(item => item.id === metric).label;

  return (
    <section className="panel graphic-section" aria-labelledby="quantile-heading">
      <h2 id="quantile-heading">Quantile plot</h2>
      <p>{mode === 'normal'
        ? 'Compare observed quantiles with a standard normal distribution.'
        : 'See the observed values at different percentiles of the distribution.'}</p>
      {/* Пользователь выбирает показатель и тип квантильного графика. */}
      <div className="graphic-controls">
        <MetricSelect metrics={metrics} value={metric} onChange={setMetric} />
        <label>Plot type
          <select value={mode} onChange={event => setMode(event.target.value)}>
            <option value="empirical">Empirical percentiles</option>
            <option value="normal">Normal Q–Q</option>
          </select>
        </label>
      </div>
      <GraphicResult result={result}>
        {data => <QuantilePlot points={data.points} count={data.count} label={label} mode={mode} />}
      </GraphicResult>
    </section>
  );
}

// Запрашивает матрицу Пирсона для выбранного набора показателей.
function Correlation({ metrics }) {
  const [selected, setSelected] = useState(metrics.map(({ id }) => id));
  const params = new URLSearchParams({ chart: 'correlation' });
  selected.forEach(metric => params.append('metric', metric));
  const result = useGraphic(selected.length >= 2 ? params.toString() : null);
  const labels = Object.fromEntries(metrics.map(({ id, label }) => [id, label]));

  // Добавляет или убирает показатель, сохраняя порядок из справочника.
  function toggle(id) {
    setSelected(current => current.includes(id)
      ? current.filter(metric => metric !== id)
      : metrics.map(metric => metric.id).filter(metric => metric === id || current.includes(metric)));
  }

  return (
    <section className="panel graphic-section" aria-labelledby="correlation-heading">
      <h2 id="correlation-heading">Correlation matrix</h2>
      <p>Pearson correlation uses enrollments with both values present. A dash indicates insufficient data or a constant metric.</p>
      {/* Флажки определяют строки и столбцы матрицы. */}
      <fieldset className="metric-checks">
        <legend>Metrics</legend>
        {metrics.map(({ id, label }) => (
          <label key={id}><input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} /> {label}</label>
        ))}
      </fieldset>
      {/* Для расчёта матрицы нужны как минимум два показателя. */}
      {selected.length < 2 ? <p className="notice">Select at least two metrics.</p> : (
        <GraphicResult result={result}>
          {data => <CorrelationTable data={data} labels={labels} />}
        </GraphicResult>
      )}
    </section>
  );
}

// Загружает справочник и размещает три независимых конструктора на странице.
export default function Graphics() {
  const catalog = useGraphic();
  return (
    <main className="container graphics-page">
      <section className="hero">
        <div className="eyebrow">Enrollment analysis</div>
        <h1>Graphics</h1>
        <p>Explore the distributions and relationships of numeric enrollment measures.</p>
      </section>
      <GraphicResult result={catalog}>
        {({ metrics }) => (
          /* Конструкторы расположены друг под другом в порядке чтения страницы. */
          <div className="graphics-stack">
            <Histogram metrics={metrics} />
            <Quantile metrics={metrics} />
            <Correlation metrics={metrics} />
          </div>
        )}
      </GraphicResult>
    </main>
  );
}
