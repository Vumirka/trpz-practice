/* ════════════════════════════════════════════
   js/05-finance-kanban-notes.js — Фінанси, Kanban, Нотатки
   ════════════════════════════════════════════ */

// ══════════════════════════════════
// ФІНАНСИ (Доходи та Витрати)
// ══════════════════════════════════

/** Додає запис доходу або витрати */
function addIncome() {
  const desc   = document.getElementById('income-desc-input')?.value.trim();
  const amount = +document.getElementById('income-amount-input')?.value || 0;
  const type   = document.getElementById('income-type-input')?.value;
  const cat    = document.getElementById('income-cat-input')?.value;

  if (!desc || !amount) return;

  S.income.unshift({
    id: Date.now(), desc, amount, type, cat,
    date: new Date().toLocaleDateString('uk'),
  });

  save('income');
  closeModal('modal-income');
  ['income-desc-input','income-amount-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderIncome();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
  toast(type === 'income' ? 'Дохід додано' : 'Витрату записано', 'success');
}

/** Видаляє запис за id */
function deleteIncome(id) {
  S.income = S.income.filter(i => i.id !== id);
  save('income');
  renderIncome();
  renderDashboard(); // ОНОВЛЮЄМО ДАШБОРД
}

/** Рендерить таблицю транзакцій та підсумки */
function renderIncome() {
  // Рахуємо доходи, витрати та баланс
  const inc = S.income.filter(i => i.type === 'income').reduce((a, i) => a + i.amount, 0);
  const exp = S.income.filter(i => i.type === 'expense').reduce((a, i) => a + i.amount, 0);
  const bal = inc - exp;

  const totalIncome = document.getElementById('total-income-val');
  const totalExpense = document.getElementById('total-expense-val');
  const totalBalance = document.getElementById('total-balance-val');
  
  if (totalIncome) totalIncome.textContent = '₴' + inc.toLocaleString();
  if (totalExpense) totalExpense.textContent = '₴' + exp.toLocaleString();

  if (totalBalance) {
    totalBalance.textContent = '₴' + bal.toLocaleString();
    totalBalance.className = 'stat-value ' + (bal >= 0 ? 'income-amount-pos' : 'income-amount-neg');
  }

  const tbody = document.getElementById('income-tbody');
  const empty = document.getElementById('income-empty');

  if (!tbody) return;

  if (!S.income.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';
  tbody.innerHTML = S.income.map(i => `
    <tr>
      <td>${escapeHtml(i.desc)}</td>
      <td style="color:var(--text3);font-size:0.76rem">${escapeHtml(i.cat) || '—'}</td>
      <td><span class="income-type type-${i.type}">${i.type === 'income' ? 'Дохід' : 'Витрата'}</span></td>
      <td class="${i.type === 'income' ? 'income-amount-pos' : 'income-amount-neg'}">
        ${i.type === 'income' ? '+' : '-'}₴${i.amount.toLocaleString()}
      </td>
      <td style="color:var(--text3);font-size:0.76rem">${i.date}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="deleteIncome(${i.id})">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </td>
    </table>`).join('');
}

// ══════════════════════════════════
// KANBAN — дошка завдань
// ══════════════════════════════════

let kanbanTargetCol = 'todo'; // Колонка для нової картки

/** Відкриває модалку з прив'язкою до конкретної колонки */
function openKanban(col) {
  kanbanTargetCol = col;
  openModal('modal-kanban');
}

/** Зберігає нову картку в обрану колонку */
function saveKanbanCard() {
  const title = document.getElementById('kanban-card-input')?.value.trim();
  const desc  = document.getElementById('kanban-desc-input')?.value.trim();
  const tag   = document.getElementById('kanban-tag-input')?.value.trim() || 'General';

  if (!title) return;

  S.kanban[kanbanTargetCol].unshift({
    id: Date.now(), title, desc, tag,
    date: new Date().toLocaleDateString('uk'),
  });

  save('kanban');
  closeModal('modal-kanban');
  ['kanban-card-input','kanban-desc-input','kanban-tag-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderKanban();
  toast('Картку додано', 'success');
}

/** Видаляє картку з колонки */
function deleteKanbanCard(col, id) {
  S.kanban[col] = S.kanban[col].filter(c => c.id !== id);
  save('kanban');
  renderKanban();
}

/**
 * Переміщує картку в сусідню колонку.
 * @param {string} col — поточна колонка
 * @param {number} id  — id картки
 * @param {number} dir — -1 (вліво) або +1 (вправо)
 */
function moveKanbanCard(col, id, dir) {
  const cols    = ['todo', 'progress', 'done'];
  const fromIdx = cols.indexOf(col);
  const toIdx   = fromIdx + dir;

  // Перевіряємо межі
  if (toIdx < 0 || toIdx >= cols.length) return;

  const card = S.kanban[col].find(c => c.id === id);
  if (!card) return;

  // Видаляємо з поточної та додаємо до сусідньої
  S.kanban[col]        = S.kanban[col].filter(c => c.id !== id);
  S.kanban[cols[toIdx]].unshift(card);

  save('kanban');
  renderKanban();
}

/** Рендерить всі три колонки дошки */
function renderKanban() {
  ['todo', 'progress', 'done'].forEach((col, ci) => {
    const cards = S.kanban[col];

    // Оновлюємо лічильник
    const cntEl = document.getElementById('cnt-' + col);
    if (cntEl) cntEl.textContent = cards.length;

    const container = document.getElementById('kanban-' + col);
    if (!container) return;
    
    container.innerHTML = cards.map(c => `
      <div class="kanban-card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">
          <div class="kanban-card-title">${escapeHtml(c.title)}</div>
          <button style="cursor:pointer;color:var(--text3);flex-shrink:0;background:none;border:none;padding:0"
            onclick="deleteKanbanCard('${col}',${c.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        ${c.desc ? `<div class="kanban-card-desc">${escapeHtml(c.desc)}</div>` : ''}
        <div class="kanban-card-footer">
          <span class="kanban-card-tag">${escapeHtml(c.tag)}</span>
          <div style="display:flex;gap:4px">
            ${ci > 0 ? `<button class="btn btn-ghost btn-xs" onclick="moveKanbanCard('${col}',${c.id},-1)">←</button>` : ''}
            ${ci < 2 ? `<button class="btn btn-ghost btn-xs" onclick="moveKanbanCard('${col}',${c.id},1)">→</button>`  : ''}
          </div>
        </div>
        ${c.date ? `<div class="kanban-card-date" style="margin-top:6px">${c.date}</div>` : ''}
      </div>`).join('');
  });
}

// ══════════════════════════════════
// НОТАТКИ
// ══════════════════════════════════

let noteImgData = null; // base64-рядок завантаженого зображення

/** Обробляє вибір зображення для нотатки */
function handleNoteImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    noteImgData = ev.target.result;

    // Показуємо прев'ю та приховуємо зону завантаження
    const prev = document.getElementById('note-img-preview');
    const uploadArea = document.getElementById('note-upload-area');
    if (prev) {
      prev.src = noteImgData;
      prev.style.display = 'block';
    }
    if (uploadArea) uploadArea.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

/**
 * Активує вибрану color-pill.
 * @param {HTMLElement} el      — клікнутий елемент
 * @param {string}      groupId — id контейнера з пілюлями
 */
function selectColor(el, groupId) {
  document.querySelectorAll(`#${groupId} .color-pill`).forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
}

/** Повертає hex-колір обраної пілюлі в групі */
function getSelectedColor(groupId) {
  const sel = document.querySelector(`#${groupId} .color-pill.selected`);
  return sel ? sel.dataset.color : '#bfa3f0';
}

/** Зберігає нову нотатку */
function addNote() {
  const title = document.getElementById('note-title-input')?.value.trim();
  const body  = document.getElementById('note-body-input')?.value.trim();
  const tag   = document.getElementById('note-tag-input')?.value.trim();
  const color = getSelectedColor('note-color-pills');

  if (!title) return;

  S.notes.unshift({
    id: Date.now(), title, body, tag, color,
    img: noteImgData,
    date: new Date().toLocaleDateString('uk'),
  });

  save('notes');
  closeModal('modal-note');
  ['note-title-input','note-body-input','note-tag-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Скидаємо зображення
  noteImgData = null;
  const preview = document.getElementById('note-img-preview');
  const uploadArea = document.getElementById('note-upload-area');
  if (preview) preview.style.display = 'none';
  if (uploadArea) uploadArea.style.display = 'block';

  renderNotes();
  updateProfileUI();
  toast('Нотатку збережено', 'success');
}

/** Видаляє нотатку за id */
function deleteNote(id) {
  S.notes = S.notes.filter(n => n.id !== id);
  save('notes');
  renderNotes();
}

/** Рендерить сітку нотаток (з пошуком) */
function renderNotes() {
  const q        = (document.getElementById('notes-search')?.value || '').toLowerCase();
  const el       = document.getElementById('notes-grid');
  if (!el) return;
  
  const filtered = q
    ? S.notes.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
    : S.notes;

  // Кнопка "нова нотатка" завжди в кінці сітки
  const addBtn = `
    <div class="add-note-btn" onclick="openModal('modal-note')">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Нова нотатка
    </div>`;

  if (!filtered.length) { 
    el.innerHTML = addBtn; 
    return; 
  }

  el.innerHTML = filtered.map(n => `
    <div class="note-card" style="--note-color:${n.color}">
      <div class="note-title">${escapeHtml(n.title)}</div>
      <div class="note-body">${escapeHtml(n.body) || ''}</div>
      ${n.img ? `<img class="note-image" src="${n.img}" alt="">` : ''}
      <div class="note-footer">
        <div style="display:flex;gap:6px;align-items:center">
          ${n.tag ? `<span class="note-tag">${escapeHtml(n.tag)}</span>` : ''}
          <span class="note-date">${n.date}</span>
        </div>
        <div class="note-actions">
          <button class="btn btn-danger btn-xs" onclick="deleteNote(${n.id})">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`).join('') + addBtn;
}