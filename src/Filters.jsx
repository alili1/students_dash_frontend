// Выводит управляемый выпадающий список и передаёт выбранное значение родителю.
function Filter({ label, value, options, placeholder, onChange }) {
  return (
    <label>
      {label}
      <select value={value} onChange={event => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

// Формирует панель отбора записей по модулю, его проведению, результату и возрасту.
export default function Filters({ options, filters, onChange, onReset }) {
  const modules = [...new Set(options.presentations.map(item => item.module_code))];
  const presentations = [...new Set(options.presentations
    .filter(item => !filters.module || item.module_code === filters.module)
    .map(item => item.presentation_code))].sort();

  // При смене модуля сохраняет ранее выбранное проведение, если оно доступно.
  function changeModule(module) {
    const hasPresentation = options.presentations.some(item =>
      (!module || item.module_code === module) && item.presentation_code === filters.presentation);
    onChange({ ...filters, module, presentation: hasPresentation ? filters.presentation : '' });
  }

  return (
    <section className="panel filters" aria-label="Cohort filters">
      {/* Списки модуля и проведения связаны, результат и возраст выбираются независимо. */}
      <Filter label="Module" value={filters.module} options={modules} placeholder="All modules"
        onChange={changeModule} />
      <Filter label="Presentation" value={filters.presentation} options={presentations}
        placeholder="All presentations" onChange={presentation => onChange({ ...filters, presentation })} />
      <Filter label="Final outcome" value={filters.outcome} options={options.outcomes}
        placeholder="All outcomes" onChange={outcome => onChange({ ...filters, outcome })} />
      <Filter label="Age band" value={filters.age} options={options.ages}
        placeholder="All age bands" onChange={age => onChange({ ...filters, age })} />
      {/* Возвращает все параметры отбора к исходным значениям. */}
      <button className="secondary" type="button" onClick={onReset}>Clear filters</button>
    </section>
  );
}
