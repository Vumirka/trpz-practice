/* ════════════════════════════════════════════
   js/03-helpers.js — Модалки, тости, дата/привітання, бейджі, профіль
   ════════════════════════════════════════════ */

// ── Модальні вікна ────────────────────────────────────────────

/** Відкриває модальне вікно за id */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

/** Закриває модальне вікно за id */
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// Закриття кліком на підложку (overlay) ──
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ── Toast-сповіщення ────────────────────────────────────────

/**
 * Показує тимчасове сповіщення.
 * @param {string} msg  — текст повідомлення
 * @param {string} type — тип: 'info' | 'success' | 'error'
 */
function toast(msg, type = 'info') {
  const icons = { info: '💡', success: '✅', error: '❌' };

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${icons[type] || '💬'}</span>${msg}`;

  const container = document.getElementById('toast-container');
  if (container) container.appendChild(el);

  // Автоматично зникає через 2.6с
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

// ── Дата та привітання ───────────────────────────────────────

/** Оновлює дату у топбарі та текст привітання */
function updateDate() {
  const now = new Date();

  const days   = ['Неділя','Понеділок','Вівторок','Середа','Четвер','П\'ятниця','Субота'];
  const months = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];

  // Виводимо поточну дату
  const dateEl = document.getElementById('topbar-date');
  if (dateEl) {
    dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  }

  // Вибір привітання за часом доби
  const h  = now.getHours();
  const gr = h < 5  ? 'Доброї ночі'
           : h < 12 ? 'Доброго ранку'
           : h < 17 ? 'Добрий день'
           : h < 22 ? 'Добрий вечір'
           :           'Доброї ночі';

  const greetEl = document.getElementById('greeting-text');
  if (greetEl) {
    const name = S.profile.name;
    greetEl.textContent = gr + (name ? `, ${name}` : '') + '!';
  }

  // Підзаголовок — мотиваційна фраза залежно від дня тижня
  const subEl = document.getElementById('greeting-sub');
  if (subEl) {
    const subs = [
      'Сьогодні чудовий день для продуктивності',
      'Зроби щось велике сьогодні!',
      'Рухайся до своїх цілей!',
      'Кожен крок наближає до мети',
    ];
    subEl.textContent = subs[now.getDay() % subs.length];
  }
}

// ── Бейджі (лічильники у навігації) ──────────────────────────

/** Оновлює числові бейджі на пунктах меню */
function updateBadges() {
  // Кількість активних (не виконаних) завдань
  const tasksBadge = document.getElementById('tasks-badge');
  if (tasksBadge) {
    tasksBadge.textContent = S.tasks.filter(t => !t.done).length;
  }

  // Кількість замовлень "нове" або "в роботі"
  const ordersBadge = document.getElementById('orders-badge');
  if (ordersBadge) {
    ordersBadge.textContent = S.orders.filter(o => o.status === 'new' || o.status === 'progress').length;
  }
}

// ── Профіль користувача ──────────────────────────────────────

/** Зберігає профіль та оновлює UI */
function saveProfile() {
  S.profile.name  = document.getElementById('profile-name')?.value.trim() || '';
  S.profile.email = document.getElementById('profile-email')?.value.trim() || '';
  S.profile.role  = document.getElementById('profile-role')?.value.trim() || '';

  save('profile');
  updateProfileUI();
  closeModal('modal-profile');
  toast('Профіль збережено', 'success');
  updateDate(); // оновлюємо привітання з новим ім'ям
}

/** Рендерить дані профілю у панелі користувача */
function updateProfileUI() {
  const name     = S.profile.name || '?';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  // Аватар з ініціалами
  const userAvatar = document.getElementById('user-avatar');
  const upAvatar = document.getElementById('up-avatar-text');
  if (userAvatar) userAvatar.textContent = initials;
  if (upAvatar) upAvatar.textContent = initials;
  
  const upName = document.getElementById('up-name-text');
  const upEmail = document.getElementById('up-email-text');
  if (upName) upName.textContent = name || 'Гість';
  if (upEmail) upEmail.textContent = S.profile.email || 'Не вказано';

  // Статистика в панелі
  const doneTasksEl = document.getElementById('up-done-tasks');
  const sessionsEl = document.getElementById('up-sessions');
  const notesEl = document.getElementById('up-notes');
  if (doneTasksEl) doneTasksEl.textContent = S.tasks.filter(t => t.done).length;
  if (sessionsEl) sessionsEl.textContent = S.sessions.length;
  if (notesEl) notesEl.textContent = S.notes.length;

  // Значення в полях форми профілю
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileRole = document.getElementById('profile-role');
  if (profileName) profileName.value = S.profile.name;
  if (profileEmail) profileEmail.value = S.profile.email;
  if (profileRole) profileRole.value = S.profile.role;
}

/** Перемикає видимість панелі профілю */
function toggleUserPanel() {
  updateProfileUI();
  const panel = document.getElementById('user-panel');
  if (panel) panel.classList.toggle('open');
}

// Закриття панелі кліком поза нею ──
document.addEventListener('click', e => {
  const panel  = document.getElementById('user-panel');
  const avatar = document.getElementById('user-avatar');
  if (panel && panel.classList.contains('open') && !panel.contains(e.target) && e.target !== avatar) {
    panel.classList.remove('open');
  }
});

/** Видаляє всі дані після підтвердження */
function clearAllData() {
  if (!confirm('Видалити ВСІ дані? Цю дію не можна скасувати!')) return;

  ['tasks','notes','orders','income','kanban','sessions','habits','goals','links'].forEach(k => {
    localStorage.removeItem('nx_' + k);
  });

  location.reload();
}