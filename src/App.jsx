import Dashboard from './Dashboard.jsx';
import Graphics from './Graphics.jsx';

// Общий префикс адресов берётся из конфигурации Vite.
const base = import.meta.env.BASE_URL;
const source = 'https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad';

// Справочник шести числовых показателей, доступных в конструкторах графиков.
const features = [
  ['VLE clicks', 'Total recorded clicks on Virtual Learning Environment resources for an enrollment. Enrollments with no recorded clicks have a value of zero.'],
  ['Mean assessment score', 'The arithmetic mean of the recorded assessment scores for an enrollment, on a 0–100 scale. Each score has equal weight. The value is blank if there are no scored assessments.'],
  ['Studied credits', 'The total number of credits the student was studying at the time of the enrollment.'],
  ['Previous attempts', 'The number of times the student had previously attempted this module.'],
  ['Presentation length (days)', 'The duration in days of this specific offering of the module.'],
  ['Registration day', 'The registration date as a day offset from the start of the presentation. Negative values indicate registration before the start. Unknown dates are blank.'],
];

// Собирает главную страницу из описания набора данных и справочника показателей.
function Home() {
  return (
    <main className="container">
      <section className="hero">
        <div className="eyebrow">About the dataset</div>
        <h1>Open University Learning Analytics Dataset</h1>
      </section>
      {/* Краткое описание набора данных и ссылка на страницу Kaggle. */}
      <section className="panel dataset-summary" aria-label="Dataset overview">
        <p>The Open University Learning Analytics Dataset (OULAD) describes distance-learning students and their interactions with online course materials. It covers seven modules taught across 22 presentations. The dataset records 32,593 enrollments from 28,785 unique students.</p>
        <p>Its seven files link enrollment and demographic information to registrations, assessments, and virtual learning environment activity. The activity logs record daily clicks on individual resources. Final results identify enrollments that ended in a distinction, pass, fail, or withdrawal.</p>
        <a href={source}>View the OULAD dataset on Kaggle</a>
      </section>
      {/* Термины и определения выводятся семантическим списком. */}
      <section className="panel dataset-summary feature-guide" aria-labelledby="feature-guide-title">
        <h2 id="feature-guide-title">Features used in the graphics</h2>
        <p>Each observation describes one student enrolled in one module presentation.</p>
        <dl>
          {features.map(([name, description]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}

// Выбирает страницу по текущему адресу и добавляет общую навигацию.
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const root = base.slice(0, -1);
  const current = path === root + '/data' ? 'data' : path === root + '/graphics' ? 'graphics' : '';
  const home = path === root || path === '';

  return (
    <>
      {/* Ссылка с названием ведёт на главную, меню открывает данные и графики. */}
      <header className="topbar">
        <div className="container site-header">
          <a className="brand" href={base} aria-current={home ? 'page' : undefined}>
            <span aria-hidden="true">◫</span> Student Activity Lab
          </a>
          <nav aria-label="Main navigation">
            <a href={base + 'data'} aria-current={current === 'data' ? 'page' : undefined}>Data</a>
            <a href={base + 'graphics'} aria-current={current === 'graphics' ? 'page' : undefined}>Graphics</a>
          </nav>
        </div>
      </header>
      {/* Содержимое и подвал выбираются в зависимости от маршрута. */}
      {current === 'data' && <Dashboard />}
      {current === 'graphics' && <Graphics />}
      {home && <><Home /><footer className="site-footer" /></>}
      {!home && !current && <main className="container"><h1>Page not found</h1><a href={base}>Home</a></main>}
    </>
  );
}
