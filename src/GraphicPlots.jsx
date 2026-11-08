import { formatCount, formatScore } from './format.js';

// Размеры области построения заданы в координатах SVG.
const plot = { left: 75, top: 16, width: 720, height: 206 };
const bottom = plot.top + plot.height;

// Расширяет нулевой диапазон, чтобы по оси можно было разместить одинаковые значения.
function range(min, max) {
  return min === max ? [min - 0.5, max + 0.5] : [min, max];
}

// Переводит значение на шкалу от 0 до 1.
function scale(value, min, max) {
  return (value - min) / (max - min);
}

// Рисует общую систему координат, подписи и содержимое переданного графика.
function Plot({ xRange, yRange, xLabel, yLabel, count, render, integerY = false }) {
  const x = value => plot.left + scale(value, ...xRange) * plot.width;
  // Координата Y уменьшается вверх, поскольку начало координат SVG находится сверху.
  const y = value => bottom - scale(value, ...yRange) * plot.height;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const yTicks = [...new Set(ticks.map(fraction => {
    const value = yRange[0] + (yRange[1] - yRange[0]) * fraction;
    return integerY ? Math.round(value) : value;
  }))];

  return (
    <figure className="graphic-figure">
      <div className="plot-scroll">
        <svg className="graphic-plot" viewBox="0 0 840 274" role="img" aria-label={`${yLabel} by ${xLabel}`}>
          {/* Горизонтальная сетка и подписи оси Y. */}
          {yTicks.map(value => (
            <g key={value}>
              <line className="plot-grid" x1={plot.left} y1={y(value)} x2={plot.left + plot.width} y2={y(value)} />
              <text x={plot.left - 9} y={y(value)} textAnchor="end" dominantBaseline="middle">
                {integerY ? formatCount(value) : formatScore(value)}
              </text>
            </g>
          ))}
          {/* Подписи оси X распределяются по диапазону показателя. */}
          {ticks.map(fraction => {
            const value = xRange[0] + (xRange[1] - xRange[0]) * fraction;
            return <text key={fraction} x={x(value)} y={bottom + 20} textAnchor="middle">{formatScore(value)}</text>;
          })}
          <path className="plot-axis" d={`M ${plot.left} ${plot.top} V ${bottom} H ${plot.left + plot.width}`} />
          <text x={plot.left + plot.width / 2} y={bottom + 44} textAnchor="middle">{xLabel}</text>
          <text transform={`translate(16 ${plot.top + plot.height / 2}) rotate(-90)`} textAnchor="middle">{yLabel}</text>
          {/* Гистограмма или квантильный график получают функции пересчёта координат. */}
          {render(x, y)}
        </svg>
      </div>
      <figcaption>{formatCount(count)} enrollments with observed values</figcaption>
    </figure>
  );
}

// Рисует по столбцу на интервал, высота соответствует числу записей.
export function HistogramPlot({ bins, count, label }) {
  const top = Math.max(...bins.map(bin => bin.count));
  return (
    <Plot xRange={[bins[0].start, bins.at(-1).end]} yRange={[0, top]} integerY
      xLabel={label} yLabel="Enrollments" count={count}
      render={(x, y) => bins.map(bin => (
        <rect className="histogram-bin" key={bin.start} x={x(bin.start) + 0.5} y={y(bin.count)}
          width={Math.max(0, x(bin.end) - x(bin.start) - 1)} height={bottom - y(bin.count)}>
          <title>{formatScore(bin.start)} to {formatScore(bin.end)} · {formatCount(bin.count)} enrollments</title>
        </rect>
      ))} />
  );
}

// Рисует точки квантилей и соединяет их линией в режиме процентилей.
export function QuantilePlot({ points, count, label, mode }) {
  const xRange = mode === 'empirical' ? [0, 100] : range(points[0].x, points.at(-1).x);
  return (
    <Plot xRange={xRange} yRange={range(points[0].y, points.at(-1).y)}
      xLabel={mode === 'normal' ? 'Theoretical normal quantile' : 'Percentile (%)'}
      yLabel={label} count={count} render={(x, y) => (
        <>
          {mode === 'empirical' && (
            <polyline className="quantile-line" points={points.map(point => `${x(point.x)},${y(point.y)}`).join(' ')} />
          )}
          {points.map(point => (
            <circle className="quantile-dot" key={point.x} cx={x(point.x)} cy={y(point.y)} r="2.6">
              <title>{formatScore(point.x)} · {formatScore(point.y)}</title>
            </circle>
          ))}
        </>
      )} />
  );
}

// Цвет показывает знак корреляции, насыщенность зависит от её модуля.
function cellColor(value) {
  if (value === null) return 'transparent';
  const color = value < 0 ? '184, 91, 56' : '64, 87, 181';
  return `rgba(${color}, ${Math.abs(value) * 0.44})`;
}

// Показывает коэффициенты в таблице с подсказками о числе парных наблюдений.
export function CorrelationTable({ data, labels }) {
  return (
    <div className="table-wrap">
      <table className="correlation-table" aria-label="Pearson correlation coefficients">
        <thead><tr><th scope="col">Metric</th>
          {data.metrics.map(id => <th key={id} scope="col">{labels[id]}</th>)}
        </tr></thead>
        <tbody>
          {data.matrix.map((row, i) => (
            <tr key={data.metrics[i]}><th scope="row">{labels[data.metrics[i]]}</th>
              {row.map(({ value, count }, j) => (
                <td key={data.metrics[j]} style={{ backgroundColor: cellColor(value) }}
                  title={`${formatCount(count)} paired enrollments`}>
                  {value === null ? '—' : value.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
