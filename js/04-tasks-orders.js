/* ════════════════════════════════════════════
   js/04-tasks-orders.js — Дашборд, завдання, замовлення
   ════════════════════════════════════════════ */

// ── Мапа назв статусів замовлень ─────────────────────────────
const ORDER_STATUS = {
  new:       'Нове',
  progress:  'В роботі',
  done:      'Виконано',
  cancelled: 'Скасовано',
};

// ══════════════════════════════════
// ДАШБОРД
// ══════════════════════════════════

/** Рендерить дашборд: статистику, останні задачі, замовлення, звички */
function renderDashboard() {
  // ── Статистичні плитки ──
  const dashTasks = document.getElementById('dash-tasks');
  const dashOrders = document.getElementById('dash-orders');
  if (dashTasks) dashTasks.textContent = S.tasks.filter(t => !t.done).length;
  if (dashOrders) dashOrders.textContent = S.orders.length;

  const totalIncome = S.income.filter(i => i.type === 'income').reduce((a, i) => a + i.amount, 0);
  const dashIncome = document.getElementById('dash-income');
  if (dashIncome) dashIncome.textContent = '₴' + totalIncome.toLocaleString();

  const totalSecs = S.sessions.reduce((a, s) => a + s.seconds, 0);
  const dashTime = document.getElementById('dash-time');
  if (dashTime) dashTime.textContent = (totalSecs / 3600).toFixed(1) + 'г';

  // ── Останні завдання (до 5) ──
  const recentTasks = S.tasks.filter(t => !t.done).slice(0, 5);
  const rtEl = document.getElementById('dash-recent-tasks');

  if (rtEl) {
    if (!recentTasks.length) {
      rtEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🎉</div><div class="empty-text">Завдань немає</div></div>';
    } else {
      rtEl.innerHTML = recentTasks.map(t => `
        <div class="task-item" style="animation:none">
          <div class="task-check ${t.done ? 'checked' : ''}" onclick="toggleTask(${t.id});renderDashboard()">
            ${t.done ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
          </div>
          <div class="task-text">${escapeHtml(t.name)}</div>
          <span class="task-priority priority-${t.priority}">
            ${{ high: '!!! Важливий', med: 'Середній', low: 'Низький' }[t.priority]}
          </span>
        </div>`).join('');
    }
  }

  // ── Останні замовлення (до 4) ──
  const recentOrders = S.orders.slice(0, 4);
  const roEl = document.getElementById('dash-recent-orders');

  if (roEl) {
    if (!recentOrders.length) {
      roEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📬</div><div class="empty-text">Замовлень немає</div></div>';
    } else {
      roEl.innerHTML = recentOrders.map(o => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="font-family:Unbounded;font-size:0.72rem;color:var(--accent);background:var(--accent4);padding:3px 8px;border-radius:6px">${escapeHtml(o.num)}</div>
          <div style="flex:1;font-weight:700;font-size:0.84rem">${escapeHtml(o.client)}</div>
          <span class="order-status status-${o.status}">${ORDER_STATUS[o.status]}</span>
          <span style="font-family:Unbounded;font-weight:700;font-size:0.8rem">₴${o.amount.toLocaleString()}</span>
        </div>`).join('');
    }
  }

  // ── Звички на сьогодні ──
  const todayKey = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];
  const hEl = document.getElementById('dash-habits');

  if (hEl) {
    if (!S.habits.length) {
      hEl.innerHTML = '<div class="empty-state"><div class="empty-icon" style="font-size:1.6rem">⭐</div><div class="empty-text">Немає звичок</div></div>';
    } else {
      hEl.innerHTML = S.habits.slice(0, 5).map(h => {
        const done = h.days && h.days[todayKey];
        return `
          <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:1.2rem">${h.icon || '⭐'}</span>
            <div style="flex:1;font-weight:700;font-size:0.86rem">${escapeHtml(h.name)}</div>
            <div style="cursor:pointer" onclick="toggleHabitDay(${h.id},'${todayKey}');renderDashboard()">
              ${done
                ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>'
                : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/></svg>'}
            </div>
          </div>`;
      }).join('');
    }
  }
}

// Допоміжна функція для безпечного виведення HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// ══════════════════════════════════
// ЗАВДАННЯ
// ══════════════════════════════════

let taskFilter = 'all'; // поточний фільтр: all | active | done | high

/** Швидке додавання завдання з рядка вводу */
function quickAddTask() {
  const name     = document.getElementById('quick-task-input')?.value.trim();
  const priority = document.getElementById('quick-priority')?.value;
  if (!name) return;

  S.tasks.unshift({
    id: Date.now(), name, priority,
    done: false,
    date: new Date().toLocaleDateString('uk'),
    subtasks: [],
  });

  save('tasks');
  const input = document.getElementById('quick-task-input');
  if (input) input.value = '';
  renderTasks();
  updateBadges();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
  toast('Завдання додано', 'success');
}

/** Додавання завдання через модальне вікно (з підзавданнями) */
function addTask() {
  const name     = document.getElementById('task-name-input')?.value.trim();
  const priority = document.getElementById('task-priority-input')?.value;
  const due      = document.getElementById('task-due-input')?.value;
  const subRaw   = document.getElementById('task-sub-input')?.value;

  // Розбиваємо підзавдання через кому
  const subtasks = subRaw
    ? subRaw.split(',').map(s => ({ text: s.trim(), done: false })).filter(s => s.text)
    : [];

  if (!name) return;

  S.tasks.unshift({
    id: Date.now(), name, priority,
    done: false,
    date: new Date().toLocaleDateString('uk'),
    due, subtasks,
  });

  save('tasks');
  closeModal('modal-task');
  ['task-name-input','task-due-input','task-sub-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderTasks();
  updateBadges();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
  toast('Завдання додано', 'success');
}

/** Перемикає стан "виконано" для завдання */
function toggleTask(id) {
  const task = S.tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    save('tasks');
    renderTasks();
    updateBadges();
    updateProfileUI();
    renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
  }
}

/** Видаляє завдання за id */
function deleteTask(id) {
  S.tasks = S.tasks.filter(t => t.id !== id);
  save('tasks');
  renderTasks();
  updateBadges();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
  toast('Видалено');
}

/** Встановлює фільтр та перерендерує список */
function filterTasks(f, el) {
  taskFilter = f;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  renderTasks();
}

/** Рендерить список завдань з урахуванням фільтру */
function renderTasks() {
  const labels = { high: '!!! Важливий', med: 'Середній', low: 'Низький' };
  const cls    = { high: 'priority-high', med: 'priority-med', low: 'priority-low' };

  // Фільтруємо список
  let list = [...S.tasks];
  if (taskFilter === 'active') list = list.filter(t => !t.done);
  if (taskFilter === 'done')   list = list.filter(t => t.done);
  if (taskFilter === 'high')   list = list.filter(t => t.priority === 'high');

  const el = document.getElementById('task-list');

  if (!el) return;

  if (!list.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
            <path d="M9 11l3 3L22 4"/>
          </svg>
        </div>
        <div class="empty-text">Немає завдань</div>
      </div>`;
    return;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  el.innerHTML = list.map(t => {
    const dueDate  = t.due ? new Date(t.due) : null;
    const isOverdue = dueDate && !t.done && dueDate < now;

    // Рядок дедлайну
    const dueStr = dueDate
      ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠️ ' : ''}${dueDate.toLocaleDateString('uk')}</span>`
      : '';

    // Підзавдання
    const subsHtml = t.subtasks && t.subtasks.length
      ? `<div class="task-subtasks">
          ${t.subtasks.map((s, i) => `
            <div class="subtask-item">
              <div class="task-check ${s.done ? 'checked' : ''}" style="width:16px;height:16px" onclick="toggleSubtask(${t.id},${i})">
                ${s.done ? '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
              </div>
              <span style="${s.done ? 'text-decoration:line-through;color:var(--text3)' : ''}">${escapeHtml(s.text)}</span>
            </div>`).join('')}
        </div>`
      : '';

    return `
      <div class="task-item ${t.done ? 'done' : ''}">
        <div class="task-check ${t.done ? 'checked' : ''}" onclick="toggleTask(${t.id})">
          ${t.done ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </div>
        <div style="flex:1">
          <div class="task-text">${escapeHtml(t.name)}</div>
          ${subsHtml}
        </div>
        <div class="task-meta">
          ${dueStr}
          <span class="task-priority ${cls[t.priority]}">${labels[t.priority]}</span>
          <span class="task-delete" onclick="deleteTask(${t.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </span>
        </div>
      </div>`;
  }).join('');
}

/** Перемикає виконання підзавдання */
function toggleSubtask(taskId, subIdx) {
  const task = S.tasks.find(t => t.id === taskId);
  if (task && task.subtasks[subIdx]) {
    task.subtasks[subIdx].done = !task.subtasks[subIdx].done;
    save('tasks');
    renderTasks();
  }
}

// ══════════════════════════════════
// ЗАМОВЛЕННЯ
// ══════════════════════════════════

/** Додає нове замовлення */
function addOrder() {
  const client = document.getElementById('order-client-input')?.value.trim();
  const desc   = document.getElementById('order-desc-input')?.value.trim();
  const amount = +document.getElementById('order-amount-input')?.value || 0;
  const status = document.getElementById('order-status-input')?.value;
  const due    = document.getElementById('order-due-input')?.value;

  if (!client) return;

  // Генеруємо номер замовлення типу #001
  const num = '#' + String(S.orders.length + 1).padStart(3, '0');

  S.orders.unshift({
    id: Date.now(), num, client, desc, amount, status, due,
    date: new Date().toLocaleDateString('uk'),
  });

  save('orders');
  closeModal('modal-order');
  ['order-client-input','order-desc-input','order-amount-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderOrders();
  updateBadges();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
  toast('Замовлення додано', 'success');
}

/** Видаляє замовлення за id */
function deleteOrder(id) {
  S.orders = S.orders.filter(o => o.id !== id);
  save('orders');
  renderOrders();
  updateBadges();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
  toast('Видалено');
}

/** Рендерить список замовлень */
function renderOrders() {
  const el = document.getElementById('orders-list');

  if (!el) return;

  if (!S.orders.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
          </svg>
        </div>
        <div class="empty-text">Замовлень поки немає</div>
      </div>`;
    return;
  }

  el.innerHTML = S.orders.map(o => `
    <div class="order-card">
      <div class="order-num">${escapeHtml(o.num)}</div>
      <div class="order-info">
        <div class="order-client">${escapeHtml(o.client)}</div>
        <div class="order-desc">${escapeHtml(o.desc) || '—'} · ${o.date}${o.due ? ' · до ' + new Date(o.due).toLocaleDateString('uk') : ''}</div>
      </div>
      <span class="order-status status-${o.status}">${ORDER_STATUS[o.status]}</span>
      <div class="order-amount">₴${o.amount.toLocaleString()}</div>
      <button class="btn btn-ghost btn-sm" onclick="deleteOrder(${o.id})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`).join('');
}