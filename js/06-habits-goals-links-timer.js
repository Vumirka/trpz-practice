/* ════════════════════════════════════════════
   js/06-habits-goals-links-timer.js — Звички, Цілі, Посилання, Таймер
   ════════════════════════════════════════════ */

// ══════════════════════════════════
// ЗВИЧКИ
// ══════════════════════════════════

/** Масив ключів днів тижня (пн–нд) */
const WEEKDAYS       = ['mon','tue','wed','thu','fri','sat','sun'];
/** Локалізовані скорочення */
const WEEKDAY_LABELS = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];

/** Додає нову звичку */
function addHabit() {
  const name = document.getElementById('habit-name-input')?.value.trim();
  const goal = +document.getElementById('habit-goal-input')?.value;
  const icon = document.getElementById('habit-icon-input')?.value || '⭐';

  if (!name) return;

  S.habits.unshift({ id: Date.now(), name, goal, icon, days: {}, streak: 0 });

  save('habits');
  closeModal('modal-habit');
  const nameInput = document.getElementById('habit-name-input');
  const iconInput = document.getElementById('habit-icon-input');
  if (nameInput) nameInput.value = '';
  if (iconInput) iconInput.value = '';
  renderHabits();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
  toast('Звичку додано', 'success');
}

/**
 * Відмічає / знімає відмітку дня для звички.
 * @param {number} id     — id звички
 * @param {string} dayKey — ключ дня ('mon'...'sun')
 */
function toggleHabitDay(id, dayKey) {
  const habit = S.habits.find(h => h.id === id);
  if (!habit) return;

  if (!habit.days) habit.days = {};
  habit.days[dayKey] = !habit.days[dayKey];

  // Streak — кількість виконаних днів цього тижня
  habit.streak = WEEKDAYS.filter(d => habit.days[d]).length;

  save('habits');
  renderHabits();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
}

/** Видаляє звичку за id */
function deleteHabit(id) {
  S.habits = S.habits.filter(h => h.id !== id);
  save('habits');
  renderHabits();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
}

/** Рендерить список звичок */
function renderHabits() {
  const el = document.getElementById('habits-list');

  if (!el) return;

  if (!S.habits.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" style="font-size:2.5rem">🌱</div>
        <div class="empty-text">Немає звичок</div>
        <div class="empty-sub">Додай першу звичку</div>
      </div>`;
    return;
  }

  el.innerHTML = S.habits.map(h => {
    const doneCount = WEEKDAYS.filter(d => h.days && h.days[d]).length;
    const pct       = Math.round(doneCount / 7 * 100);

    return `
      <div class="habit-item">
        <div class="habit-header">
          <span style="font-size:1.4rem">${h.icon || '⭐'}</span>
          <div class="habit-name">${escapeHtml(h.name)}</div>
          <div class="habit-streak">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            ${doneCount}/${7} цього тижня
          </div>
          <button class="btn btn-ghost btn-sm" onclick="deleteHabit(${h.id})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="habit-week">
          ${WEEKDAYS.map((d, i) => `
            <div class="habit-day ${h.days && h.days[d] ? 'done' : ''}" onclick="toggleHabitDay(${h.id},'${d}')">
              ${WEEKDAY_LABELS[i]}
            </div>`).join('')}
        </div>
        <div class="habit-progress">
          <div class="habit-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join('');
}

// ══════════════════════════════════
// ЦІЛІ
// ══════════════════════════════════

/** Додає нову ціль */
function addGoal() {
  const name     = document.getElementById('goal-name-input')?.value.trim();
  const cat      = document.getElementById('goal-cat-input')?.value;
  const progress = Math.min(100, Math.max(0, +document.getElementById('goal-progress-input')?.value || 0));
  const due      = document.getElementById('goal-due-input')?.value;

  if (!name) return;

  S.goals.unshift({
    id: Date.now(), name, cat, progress, due,
    date: new Date().toLocaleDateString('uk'),
  });

  save('goals');
  closeModal('modal-goal');
  const nameInput = document.getElementById('goal-name-input');
  if (nameInput) nameInput.value = '';
  renderGoals();
  toast('Ціль додано', 'success');
}

/**
 * Оновлює відсоток виконання цілі (з range-слайдера).
 * @param {number} id  — id цілі
 * @param {*}      val — нове значення 0–100
 */
function updateGoalProgress(id, val) {
  const goal = S.goals.find(g => g.id === id);
  if (!goal) return;

  goal.progress = Math.min(100, Math.max(0, +val));
  save('goals');
  renderGoals();
}

/** Видаляє ціль за id */
function deleteGoal(id) {
  S.goals = S.goals.filter(g => g.id !== id);
  save('goals');
  renderGoals();
}

/** Рендерить список цілей */
function renderGoals() {
  const el = document.getElementById('goals-list');

  if (!el) return;

  if (!S.goals.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <div class="empty-text">Немає цілей</div>
        <div class="empty-sub">Поставте першу ціль</div>
      </div>`;
    return;
  }

  el.innerHTML = S.goals.map(g => `
    <div class="goal-card">
      <div class="goal-header">
        <div class="goal-title">${escapeHtml(g.name)}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="goal-percent">${g.progress}%</div>
          <span class="goal-category">${escapeHtml(g.cat)}</span>
          <button class="btn btn-ghost btn-sm" onclick="deleteGoal(${g.id})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="goal-progress-bar">
        <div class="goal-progress-fill" style="width:${g.progress}%"></div>
      </div>
      <div class="goal-meta">
        <span>${g.date}</span>
        <div style="display:flex;align-items:center;gap:8px">
          ${g.due ? `<span>до ${new Date(g.due).toLocaleDateString('uk')}</span>` : ''}
          <input type="range" min="0" max="100" value="${g.progress}"
            style="width:80px;accent-color:var(--accent)"
            oninput="updateGoalProgress(${g.id},this.value)">
        </div>
      </div>
    </div>`).join('');
}

// ══════════════════════════════════
// ПОСИЛАННЯ (Закладки)
// ══════════════════════════════════

/** Додає нове посилання */
function addLink() {
  const title = document.getElementById('link-title-input')?.value.trim();
  let   url   = document.getElementById('link-url-input')?.value.trim();
  const icon  = document.getElementById('link-icon-input')?.value || '🔗';

  if (!title || !url) return;

  // Автоматично додаємо протокол якщо відсутній
  if (!url.startsWith('http')) url = 'https://' + url;

  S.links.unshift({
    id: Date.now(), title, url, icon,
    date: new Date().toLocaleDateString('uk'),
  });

  save('links');
  closeModal('modal-link');
  ['link-title-input','link-url-input','link-icon-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderLinks();
  toast('Посилання збережено', 'success');
}

/** Видаляє посилання за id */
function deleteLink(id) {
  S.links = S.links.filter(l => l.id !== id);
  save('links');
  renderLinks();
}

/** Рендерить сітку посилань */
function renderLinks() {
  const el = document.getElementById('links-grid');

  if (!el) return;

  if (!S.links.length) {
    el.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon" style="font-size:2rem">🔗</div>
        <div class="empty-text">Немає збережених посилань</div>
      </div>`;
    return;
  }

  el.innerHTML = S.links.map(l => `
    <a class="link-card" href="${l.url}" target="_blank" rel="noopener">
      <div class="link-favicon">${l.icon || '🔗'}</div>
      <div class="link-info">
        <div class="link-title">${escapeHtml(l.title)}</div>
        <div class="link-url">${escapeHtml(l.url.replace(/^https?:\/\//, ''))}</div>
      </div>
      <button class="btn btn-ghost btn-xs" onclick="event.preventDefault();deleteLink(${l.id})">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </a>`).join('');
}

// ══════════════════════════════════
// ТАЙМЕР (Помодоро)
// ══════════════════════════════════

let timerInterval = null;   // id setInterval
let timerSeconds  = 0;      // поточна кількість секунд
let timerRunning  = false;  // чи запущено таймер
let timerStart    = 0;      // timestamp старту (для точності)
let pomodoroMax   = 25 * 60; // максимум — 25 хвилин

/** Запускає таймер */
function startTimer() {
  if (timerRunning) return;

  timerRunning = true;
  timerStart   = Date.now() - timerSeconds * 1000;

  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    timerSeconds = Math.floor((Date.now() - timerStart) / 1000);

    // Досягнуто максимуму — зупиняємо
    if (timerSeconds >= pomodoroMax) {
      timerSeconds = pomodoroMax;
      stopTimer();
      toast('⏰ Час вийшов!', 'success');
      return;
    }
    updateTimerDisplay();
  }, 500);

  const startBtn = document.getElementById('timer-start-btn');
  const pauseBtn = document.getElementById('timer-pause-btn');
  const modeLabel = document.getElementById('timer-mode-label');
  
  if (startBtn) startBtn.style.display = 'none';
  if (pauseBtn) pauseBtn.style.display = '';
  if (modeLabel) modeLabel.textContent = 'Відлік...';
}

/** Ставить таймер на паузу */
function pauseTimer() {
  if (!timerRunning) return;
  
  if (timerInterval) clearInterval(timerInterval);
  timerRunning = false;

  const startBtn = document.getElementById('timer-start-btn');
  const pauseBtn = document.getElementById('timer-pause-btn');
  const modeLabel = document.getElementById('timer-mode-label');
  
  if (startBtn) startBtn.style.display = '';
  if (pauseBtn) pauseBtn.style.display = 'none';
  if (modeLabel) modeLabel.textContent = 'Пауза';
}

/** Зупиняє таймер та зберігає сесію */
function stopTimer() {
  if (timerSeconds === 0) {
    // Якщо таймер на нулі, просто скидаємо інтерфейс
    if (timerInterval) clearInterval(timerInterval);
    timerRunning = false;
    const startBtn = document.getElementById('timer-start-btn');
    const pauseBtn = document.getElementById('timer-pause-btn');
    if (startBtn) startBtn.style.display = '';
    if (pauseBtn) pauseBtn.style.display = 'none';
    return;
  }

  if (timerInterval) clearInterval(timerInterval);
  
  // Зберігаємо сесію зі зазначеною задачею
  const task = document.getElementById('timer-task-name')?.value || 'Задача';
  if (timerSeconds > 0) {
    S.sessions.unshift({
      id: Date.now(), task,
      seconds: timerSeconds,
      date: new Date().toLocaleDateString('uk'),
    });
    save('sessions');
    toast(`Сесію збережено: ${formatDuration(timerSeconds)}`, 'success');
  }

  // Скидаємо таймер
  timerSeconds = 0;
  timerRunning = false;
  updateTimerDisplay();

  const startBtn = document.getElementById('timer-start-btn');
  const pauseBtn = document.getElementById('timer-pause-btn');
  const taskInput = document.getElementById('timer-task-name');
  const modeLabel = document.getElementById('timer-mode-label');
  
  if (startBtn) startBtn.style.display = '';
  if (pauseBtn) pauseBtn.style.display = 'none';
  if (taskInput) taskInput.value = '';
  if (modeLabel) modeLabel.textContent = 'Готовий';

  renderSessions();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
  updateProfileUI();
}

/** Оновлює відображення часу та прогрес-кільце */
function updateTimerDisplay() {
  const h = String(Math.floor(timerSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(timerSeconds % 60).padStart(2, '0');

  const display = document.getElementById('timer-display');
  if (display) display.textContent = `${h}:${m}:${s}`;

  // Обраховуємо зсув SVG-кільця (від 0 до circumference)
  const pct = Math.min(1, timerSeconds / pomodoroMax);
  const circumference = 2 * Math.PI * 80;
  const fill = document.getElementById('timer-ring-fill');
  if (fill) fill.style.strokeDashoffset = circumference * (1 - pct);

  // Синхронізуємо загальний час на дашборді
  const totalSecs = S.sessions.reduce((a, s) => a + s.seconds, 0) + timerSeconds;
  const dashEl = document.getElementById('dash-time');
  if (dashEl) dashEl.textContent = (totalSecs / 3600).toFixed(1) + 'г';
}

/**
 * Форматує секунди у читабельний рядок.
 * @param {number} secs — кількість секунд
 * @returns {string} — наприклад: "1г 5хв" або "42с"
 */
function formatDuration(secs) {
  const h   = Math.floor(secs / 3600);
  const m   = Math.floor((secs % 3600) / 60);
  const sec = secs % 60;
  return h ? `${h}г ${m}хв` : m ? `${m}хв ${sec}с` : `${sec}с`;
}

/** Рендерить список збережених сесій */
function renderSessions() {
  const el = document.getElementById('timer-sessions');

  if (!el) return;

  if (!S.sessions.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="empty-text">Ще не починав</div>
      </div>`;
    return;
  }

  el.innerHTML = S.sessions.slice(0, 10).map(s => `
    <div class="session-item">
      <div>
        <div class="session-task">${escapeHtml(s.task)}</div>
        <div class="session-date">${s.date}</div>
      </div>
      <div class="session-duration">${formatDuration(s.seconds)}</div>
    </div>`).join('');

  // Оновлюємо загальний час на дашборді
  const totalSecs = S.sessions.reduce((a, s) => a + s.seconds, 0);
  const dashEl = document.getElementById('dash-time');
  if (dashEl) dashEl.textContent = (totalSecs / 3600).toFixed(1) + 'г';
}

// ══════════════════════════════════
// ІНІЦІАЛІЗАЦІЯ ДОДАТКУ
// ══════════════════════════════════

/** Запускається при завантаженні DOM */
function init() {
  // Застосовуємо збережену тему
  applyTheme();

  // Запускаємо годинник дати/привітання
  updateDate();
  setInterval(updateDate, 60000);

  // Оновлюємо бейджі та рендеримо початкову сторінку
  updateBadges();
  
  // Рендеримо всі основні компоненти при старті
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderSessions === 'function') renderSessions();
  if (typeof renderTasks === 'function') renderTasks();
  if (typeof renderOrders === 'function') renderOrders();
  if (typeof renderKanban === 'function') renderKanban();
  if (typeof renderHabits === 'function') renderHabits();
  if (typeof renderGoals === 'function') renderGoals();
  if (typeof renderIncome === 'function') renderIncome();
  if (typeof renderNotes === 'function') renderNotes();
  if (typeof renderLinks === 'function') renderLinks();
  
  updateProfileUI();

  // Ініціалізуємо SVG-кільце таймера
  const circumference = 2 * Math.PI * 80;
  const fill = document.getElementById('timer-ring-fill');
  if (fill) {
    fill.style.strokeDasharray  = circumference;
    fill.style.strokeDashoffset = circumference;
  }

  // Приховуємо сплеш-екран після 1.9с
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) splash.classList.add('hidden');
  }, 1900);
}

// Запускаємо після готовності DOM ──
document.addEventListener('DOMContentLoaded', init);