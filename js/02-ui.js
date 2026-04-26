/* ════════════════════════════════════════════
   js/02-ui.js — UI логіка (сплеш, тема, навігація)
   ════════════════════════════════════════════ */

// ── Сплеш: частинки ─────────────────────────────
(function buildSplash() {
  const container = document.getElementById('splash-particles');
  if (!container) return;

  const frag = document.createDocumentFragment();

  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'splash-particle';

    const size = Math.random() * 8 + 3;

    el.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 8 + 5}s;
      animation-delay:${Math.random() * 4}s;
    `;

    frag.appendChild(el);
  }

  container.appendChild(frag);
})();

// ── Сплеш статус ────────────────────────────────
const statusMsgs = [
  'Ініціалізація...',
  'Завантаження...',
  'Готуємо інтерфейс...',
  'Майже готово...'
];

let splashIdx = 0;

const splashTimer = setInterval(() => {
  const el = document.getElementById('splash-status');
  if (!el) return;

  splashIdx++;

  if (splashIdx < statusMsgs.length) {
    el.textContent = statusMsgs[splashIdx];
  } else {
    clearInterval(splashTimer);
  }
}, 400);

// ── Тема ───────────────────────────────────────

const ICONS = {
  sun: `
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  `,
  moon: `<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>`
};

function applyTheme() {
  document.documentElement.dataset.theme = S.theme;

  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.innerHTML = S.theme === 'dark' ? ICONS.sun : ICONS.moon;
  }
}

function toggleTheme() {
  S.theme = S.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('nx_theme', S.theme);
  applyTheme();
}

// ── Навігація ───────────────────────────────────

const PAGE_TITLES = {
  dashboard: 'Дашборд',
  tasks: 'Завдання',
  kanban: 'Kanban',
  habits: 'Звички',
  goals: 'Цілі',
  timer: 'Таймер',
  orders: 'Замовлення',
  income: 'Фінанси',
  notes: 'Нотатки',
  links: 'Посилання',
};

const RENDERS = {
  dashboard: () => renderDashboard?.(),
  tasks: () => renderTasks?.(),
  kanban: () => renderKanban?.(),
  habits: () => renderHabits?.(),
  goals: () => renderGoals?.(),
  orders: () => renderOrders?.(),
  income: () => renderIncome?.(),
  notes: () => renderNotes?.(),
  links: () => renderLinks?.(),
  timer: () => renderSessions?.(),
};

function navigate(page, el) {
  const pages = document.querySelectorAll('.page');
  const navs = document.querySelectorAll('.nav-item');

  pages.forEach(p => p.classList.remove('active'));
  navs.forEach(n => n.classList.remove('active'));

  document.getElementById(`page-${page}`)?.classList.add('active');
  el?.classList.add('active');

  const title = document.getElementById('topbar-title');
  if (title) title.textContent = PAGE_TITLES[page] || page;

  RENDERS[page]?.();
}