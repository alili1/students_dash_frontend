// Единые настройки отображения целых и дробных чисел в интерфейсе.
const integers = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });
const decimals = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });

// Форматирует счётчики и целые значения с разделителями разрядов.
export const formatCount = value => integers.format(value);
// Показывает до одного знака после запятой или прочерк при отсутствии значения.
export const formatScore = value => value == null ? '—' : decimals.format(value);
