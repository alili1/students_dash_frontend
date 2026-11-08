// Запрашивает JSON по базовому пути приложения и сообщает об ошибках HTTP.
export async function getJson(path, signal) {
  const response = await fetch(import.meta.env.BASE_URL + path, { signal });
  if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
  return response.json();
}
