/* ════════════════════════════════════════════
   js/01-state.js — глобальний стан застосунку
   ════════════════════════════════════════════ */

/**
 * Безпечне читання даних з localStorage
 * Якщо даних нема або вони биті — повертає fallback
 */
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem('nx_' + key)) ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * Центральний стан застосунку
 * Усі дані зберігаються тут і синхронізуються з localStorage
 */
const S = {
  tasks: read('tasks', []),
  notes: read('notes', []),
  orders: read('orders', []),
  income: read('income', []),

  kanban: read('kanban', { todo: [], progress: [], done: [] }),

  sessions: read('sessions', []),
  habits: read('habits', []),
  goals: read('goals', []),
  links: read('links', []),

  theme: localStorage.getItem('nx_theme') || 'light',

  profile: read('profile', {
    name: '',
    email: '',
    role: ''
  }),
};

/**
 * Зберігає конкретний розділ стану в localStorage
 * @param {string} key - назва секції стану
 */
function save(key) {
  localStorage.setItem('nx_' + key, JSON.stringify(S[key]));
}