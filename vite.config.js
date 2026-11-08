import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Базовый путь используется для страниц, ресурсов и запросов к API.
const base = '/studentdb/';
const basePath = base.slice(0, -1);

// Перенаправляет /studentdb на /studentdb/ и сохраняет параметры URL.
function redirectBase(server) {
  server.middlewares.use((request, response, next) => {
    const url = request.url || '';
    const [path] = url.split('?');
    if (path !== basePath) return next();
    response.writeHead(308, { Location: base + url.slice(path.length) });
    response.end();
  });
}

// Регистрирует React и перенаправление для обоих режимов Vite.
export default defineConfig({
  plugins: [react(), {
    name: 'studentdb-home-redirect',
    configureServer: redirectBase,
    configurePreviewServer: redirectBase,
  }],
  base,
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // Прокси убирает префикс /studentdb перед отправкой запроса в Django.
    proxy: {
      [base + 'api/']: {
        target: process.env.STUDENT_API_TARGET || 'http://127.0.0.1:8000',
        rewrite: path => path.slice(basePath.length),
      },
    },
  },
});
