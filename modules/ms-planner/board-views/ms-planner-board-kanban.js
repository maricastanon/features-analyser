const MsPlannerBoardKanban = (() => {
  let container = null;
  let columns = [
    { id: 'todo', title: 'To Do', cards: [] },
    { id: 'doing', title: 'Doing', cards: [] },
    { id: 'done', title: 'Done', cards: [] }
  ];
  let nextId = 1;
  let draggedCard = null;
  let dragSourceCol = null;

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) return;
    container.classList.add('kb-root');
    _seedData();
    render();
  }

  function _seedData() {
    columns[0].cards = [
      { id: nextId++, title: 'Design login page', assignee: 'Alice', priority: 3, due: '2026-04-15' },
      { id: nextId++, title: 'Write API docs', assignee: 'Bob', priority: 1, due: '2026-04-20' }
    ];
    columns[1].cards = [
      { id: nextId++, title: 'Build dashboard', assignee: 'Carol', priority: 2, due: '2026-04-12' }
    ];
    columns[2].cards = [
      { id: nextId++, title: 'Setup CI pipeline', assignee: 'Dan', priority: 2, due: '2026-04-08' }
    ];
  }

  function render() {
    if (!container) return;
    container.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'kb-board';
    columns.forEach(col => board.appendChild(_renderColumn(col)));
    container.appendChild(board);
  }

  function _renderColumn(col) {
    const el = document.createElement('div');
    el.className = 'kb-column';
    el.dataset.colId = col.id;
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('kb-column--dragover'); });
    el.addEventListener('dragleave', () => el.classList.remove('kb-column--dragover'));
    el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('kb-column--dragover'); _dropCard(col.id); });

    el.innerHTML = `<div class="kb-column-header"><span class="kb-column-title">${esc(col.title)}</span><span class="kb-count">${col.cards.length}</span></div>`;
    const list = document.createElement('div');
    list.className = 'kb-card-list';
    col.cards.forEach(card => list.appendChild(_renderCard(card, col.id)));
    el.appendChild(list);
    el.appendChild(_renderAddForm(col));
    return el;
  }

  function _renderCard(card, colId) {
    const el = document.createElement('div');
    el.className = 'kb-card';
    el.draggable = true;
    el.addEventListener('dragstart', () => { draggedCard = card; dragSourceCol = colId; el.classList.add('kb-card--dragging'); });
    el.addEventListener('dragend', () => el.classList.remove('kb-card--dragging'));

    const dots = '<span class="kb-priority-dot"></span>'.repeat(card.priority);
    const initial = card.assignee ? card.assignee.charAt(0).toUpperCase() : '?';
    const overdue = new Date(card.due) < new Date() ? ' kb-due--overdue' : '';

    el.innerHTML = `
      <div class="kb-card-body">
        <div class="kb-card-title">${esc(card.title)}</div>
        <div class="kb-card-meta">
          <span class="kb-avatar">${esc(initial)}</span>
          <span class="kb-priority">${dots}</span>
          <span class="kb-due${overdue}">${esc(card.due)}</span>
        </div>
      </div>
      <div class="kb-card-actions">
        <button class="kb-btn-action kb-btn-edit" title="Edit">&#9998;</button>
        <button class="kb-btn-action kb-btn-delete" title="Delete">&times;</button>
        <button class="kb-btn-action kb-btn-move" title="Move">&#8644;</button>
      </div>`;

    el.querySelector('.kb-btn-delete').addEventListener('click', () => { _removeCard(colId, card.id); render(); });
    el.querySelector('.kb-btn-edit').addEventListener('click', () => _showEditForm(el, card, colId));
    el.querySelector('.kb-btn-move').addEventListener('click', () => { _moveCardNext(colId, card.id); render(); });
    return el;
  }

  function _showEditForm(cardEl, card, colId) {
    const form = document.createElement('div');
    form.className = 'kb-inline-form';
    form.innerHTML = `
      <input class="kb-input" value="${esc(card.title)}" data-field="title" />
      <input class="kb-input kb-input--sm" value="${esc(card.assignee)}" data-field="assignee" placeholder="Assignee" />
      <input class="kb-input kb-input--sm" type="number" value="${card.priority}" min="1" max="3" data-field="priority" />
      <input class="kb-input kb-input--sm" type="date" value="${card.due}" data-field="due" />
      <div class="kb-form-btns"><button class="kb-btn kb-btn-save">Save</button><button class="kb-btn kb-btn-cancel">Cancel</button></div>`;
    cardEl.replaceWith(form);
    form.querySelector('.kb-btn-save').addEventListener('click', () => {
      card.title = form.querySelector('[data-field="title"]').value.trim() || card.title;
      card.assignee = form.querySelector('[data-field="assignee"]').value.trim() || card.assignee;
      card.priority = Math.min(3, Math.max(1, parseInt(form.querySelector('[data-field="priority"]').value) || 1));
      card.due = form.querySelector('[data-field="due"]').value || card.due;
      render();
    });
    form.querySelector('.kb-btn-cancel').addEventListener('click', () => render());
  }

  function _renderAddForm(col) {
    const wrap = document.createElement('div');
    wrap.className = 'kb-add-wrap';
    const btn = document.createElement('button');
    btn.className = 'kb-btn kb-btn-add';
    btn.textContent = '+ Add card';
    btn.addEventListener('click', () => {
      btn.style.display = 'none';
      const form = document.createElement('div');
      form.className = 'kb-inline-form';
      form.innerHTML = `
        <input class="kb-input" placeholder="Title" data-field="title" />
        <input class="kb-input kb-input--sm" placeholder="Assignee" data-field="assignee" />
        <input class="kb-input kb-input--sm" type="number" placeholder="Priority 1-3" min="1" max="3" data-field="priority" />
        <input class="kb-input kb-input--sm" type="date" data-field="due" />
        <div class="kb-form-btns"><button class="kb-btn kb-btn-save">Add</button><button class="kb-btn kb-btn-cancel">Cancel</button></div>`;
      wrap.appendChild(form);
      form.querySelector('.kb-btn-save').addEventListener('click', () => {
        const title = form.querySelector('[data-field="title"]').value.trim();
        if (!title) return;
        col.cards.push({
          id: nextId++, title,
          assignee: form.querySelector('[data-field="assignee"]').value.trim() || 'Unassigned',
          priority: Math.min(3, Math.max(1, parseInt(form.querySelector('[data-field="priority"]').value) || 1)),
          due: form.querySelector('[data-field="due"]').value || '2026-12-31'
        });
        render();
      });
      form.querySelector('.kb-btn-cancel').addEventListener('click', () => render());
    });
    wrap.appendChild(btn);
    return wrap;
  }

  function _dropCard(targetColId) {
    if (!draggedCard || !dragSourceCol) return;
    if (dragSourceCol === targetColId) return;
    const srcCol = columns.find(c => c.id === dragSourceCol);
    const tgtCol = columns.find(c => c.id === targetColId);
    srcCol.cards = srcCol.cards.filter(c => c.id !== draggedCard.id);
    tgtCol.cards.push(draggedCard);
    draggedCard = null;
    dragSourceCol = null;
    render();
  }

  function _removeCard(colId, cardId) {
    const col = columns.find(c => c.id === colId);
    col.cards = col.cards.filter(c => c.id !== cardId);
  }

  function _moveCardNext(colId, cardId) {
    const idx = columns.findIndex(c => c.id === colId);
    const nextIdx = (idx + 1) % columns.length;
    const col = columns[idx];
    const card = col.cards.find(c => c.id === cardId);
    col.cards = col.cards.filter(c => c.id !== cardId);
    columns[nextIdx].cards.push(card);
  }

  function exportState() {
    return JSON.parse(JSON.stringify({ columns, nextId }));
  }

  function importState(state) {
    if (!state || !state.columns) return;
    columns = state.columns;
    nextId = state.nextId || columns.reduce((m, c) => Math.max(m, ...c.cards.map(k => k.id)), 0) + 1;
    render();
  }

  return { init, render, exportState, importState };
})();
