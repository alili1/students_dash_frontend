import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';

// Монтирует корневой компонент React в контейнер из index.html.
createRoot(document.getElementById('root')).render(<App />);
