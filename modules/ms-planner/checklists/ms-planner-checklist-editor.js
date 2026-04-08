const MsPlannerChecklistEditor = (() => {
  const _esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  let _container = null;
  let _items = [];
  let _nextId = 1;
  let _editingId = null;

  function _genId() { return _nextId++; }

  function init(containerId) {
    _container = document.getElementById(containerId);
    if (!_container) return;
    _items = [
      { id: _genId(), text: 'Define requirements', done: true, indent: 0 },
      { id: _genId(), text: 'Create wireframes', done: true, indent: 0 },
      { id: _genId(), text: 'Desktop layout', done: true, indent: 1 },
      { id: _genId(), text: 'Mobile layout', done: false, indent: 1 },
      { id: _genId(), text: 'Implement frontend', done: false, indent: 0 },
      { id: _genId(), text: 'Write unit tests', done: false, indent: 0 }
    ];
    render();
  }

  function _progress() {
    if (_items.length === 0) return { done: 0, total: 0, pct: 0 };
    const done = _items.filter(i => i.done).length;
    return { done, total: _items.length, pct: Math.round((done / _items.length) * 100) };
  }

  function render() {
    if (!_container) return;
    const p = _progress();
    _container.innerHTML = `<div class="ce-wrap">
      <h3 class="ce-title">Checklist Editor</h3>
      <div class="ce-progress-bar-wrap">
        <div class="ce-progress-bar" style="width:${p.pct}%"></div>
      </div>
      <span class="ce-progress-text">${p.done}/${p.total} complete (${p.pct}%)</span>
      <ul class="ce-list">
        ${_items.map((item, idx) => _renderItem(item, idx)).join('')}
      </ul>
      <div class="ce-add-form">
        <input type="text" class="ce-add-input" id="ce-new-text" placeholder="Add checklist item..." maxlength="120" />
        <button class="ce-btn ce-btn-add" id="ce-add-btn">Add</button>
      </div>
    </div>`;
    _bindEvents();
  }

  function _renderItem(item, idx) {
    const indentPx = item.indent * 24;
    if (_editingId === item.id) {
      return `<li class="ce-item" style="padding-left:${indentPx + 12}px" data-id="${item.id}">
        <input type="checkbox" class="ce-cb" data-cid="${item.id}" ${item.done ? 'checked' : ''} />
        <input type="text" class="ce-edit-input" value="${_esc(item.text)}" data-eid="${item.id}" maxlength="120" />
        <button class="ce-btn ce-btn-save" data-save="${item.id}">Save</button>
        <button class="ce-btn ce-btn-cancel" data-cancel="${item.id}">Cancel</button>
      </li>`;
    }
    return `<li class="ce-item${item.done ? ' ce-done' : ''}" style="padding-left:${indentPx + 12}px" data-id="${item.id}">
      <input type="checkbox" class="ce-cb" data-cid="${item.id}" ${item.done ? 'checked' : ''} />
      <span class="ce-text" data-click-edit="${item.id}">${_esc(item.text)}</span>
      <span class="ce-item-actions">
        ${idx > 0 ? `<button class="ce-btn ce-btn-sm" data-move-up="${idx}" title="Move up">&#9650;</button>` : ''}
        ${idx < _items.length - 1 ? `<button class="ce-btn ce-btn-sm" data-move-down="${idx}" title="Move down">&#9660;</button>` : ''}
        <button class="ce-btn ce-btn-sm" data-indent="${item.id}" title="Indent">&#8594;</button>
        <button class="ce-btn ce-btn-sm" data-outdent="${item.id}" title="Outdent">&#8592;</button>
        <button class="ce-btn ce-btn-del" data-del="${item.id}" title="Delete">&times;</button>
      </span>
    </li>`;
  }

  function _bindEvents() {
    _container.querySelectorAll('.ce-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const item = _items.find(i => i.id === +cb.dataset.cid);
        if (item) item.done = cb.checked;
        render();
      });
    });
    _container.querySelectorAll('[data-click-edit]').forEach(el => {
      el.addEventListener('click', () => { _editingId = +el.dataset.clickEdit; render(); });
    });
    _container.querySelectorAll('[data-save]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = +btn.dataset.save;
        const input = _container.querySelector(`.ce-edit-input[data-eid="${id}"]`);
        const text = (input?.value || '').trim();
        if (!text) { input?.focus(); return; }
        const item = _items.find(i => i.id === id);
        if (item) item.text = text;
        _editingId = null;
        render();
      });
    });
    _container.querySelectorAll('[data-cancel]').forEach(btn => {
      btn.addEventListener('click', () => { _editingId = null; render(); });
    });
    _container.querySelectorAll('[data-move-up]').forEach(btn => {
      btn.addEventListener('click', () => { const i = +btn.dataset.moveUp; [_items[i - 1], _items[i]] = [_items[i], _items[i - 1]]; render(); });
    });
    _container.querySelectorAll('[data-move-down]').forEach(btn => {
      btn.addEventListener('click', () => { const i = +btn.dataset.moveDown; [_items[i], _items[i + 1]] = [_items[i + 1], _items[i]]; render(); });
    });
    _container.querySelectorAll('[data-indent]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = _items.find(i => i.id === +btn.dataset.indent);
        if (item && item.indent < 3) { item.indent++; render(); }
      });
    });
    _container.querySelectorAll('[data-outdent]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = _items.find(i => i.id === +btn.dataset.outdent);
        if (item && item.indent > 0) { item.indent--; render(); }
      });
    });
    _container.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => { _items = _items.filter(i => i.id !== +btn.dataset.del); render(); });
    });
    const addBtn = _container.querySelector('#ce-add-btn');
    const addInput = _container.querySelector('#ce-new-text');
    const doAdd = () => {
      const text = (addInput?.value || '').trim();
      if (!text) { addInput?.focus(); return; }
      _items.push({ id: _genId(), text, done: false, indent: 0 });
      render();
    };
    addBtn?.addEventListener('click', doAdd);
    addInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });
  }

  function exportState() { return JSON.parse(JSON.stringify({ items: _items, nextId: _nextId })); }

  function importState(state) {
    if (!state) return;
    _items = state.items || [];
    _nextId = state.nextId || _items.length + 1;
    _editingId = null;
    render();
  }

  return { init, render, exportState, importState };
})();
