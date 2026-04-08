const MsPlannerLabelManager = (() => {
  const _esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  const PALETTE = ['#E74856','#FF8C00','#FFAB45','#FFF100','#47D16C','#73AA24','#00BCF2','#8764B8','#F472B6','#6B7280'];
  let _container = null;
  let _labels = [];
  let _nextId = 1;
  let _editingId = null;

  function _genId() { return _nextId++; }

  function init(containerId) {
    _container = document.getElementById(containerId);
    if (!_container) return;
    _labels = [
      { id: _genId(), name: 'Priority', color: PALETTE[0], usageCount: 3 },
      { id: _genId(), name: 'In Progress', color: PALETTE[4], usageCount: 7 },
      { id: _genId(), name: 'Review', color: PALETTE[6], usageCount: 2 }
    ];
    render();
  }

  function render() {
    if (!_container) return;
    let html = `<div class="lm-wrap">
      <h3 class="lm-title">Label Manager</h3>
      <div class="lm-create-form">
        <input type="text" class="lm-input" id="lm-new-name" placeholder="New label name..." maxlength="40" />
        <div class="lm-palette" id="lm-palette">
          ${PALETTE.map((c, i) => `<button class="lm-color-swatch${i === 0 ? ' lm-color-selected' : ''}" data-color="${c}" style="background:${c}" title="${c}"></button>`).join('')}
        </div>
        <button class="lm-btn lm-btn-add" id="lm-add-btn">Add Label</button>
      </div>
      <ul class="lm-list">
        ${_labels.map(lb => _renderLabel(lb)).join('')}
      </ul>
    </div>`;
    _container.innerHTML = html;
    _bindEvents();
  }

  function _renderLabel(lb) {
    if (_editingId === lb.id) {
      return `<li class="lm-item" data-id="${lb.id}">
        <span class="lm-pill" style="background:${lb.color}"></span>
        <input type="text" class="lm-edit-input" value="${_esc(lb.name)}" data-id="${lb.id}" maxlength="40" />
        <div class="lm-edit-palette" data-id="${lb.id}">
          ${PALETTE.map(c => `<button class="lm-color-swatch${c === lb.color ? ' lm-color-selected' : ''}" data-color="${c}" data-edit="${lb.id}" style="background:${c}"></button>`).join('')}
        </div>
        <button class="lm-btn lm-btn-save" data-save="${lb.id}">Save</button>
        <button class="lm-btn lm-btn-cancel" data-cancel="${lb.id}">Cancel</button>
      </li>`;
    }
    return `<li class="lm-item" data-id="${lb.id}">
      <span class="lm-pill" style="background:${lb.color}">${_esc(lb.name)}</span>
      <span class="lm-usage">${lb.usageCount} task${lb.usageCount !== 1 ? 's' : ''}</span>
      <button class="lm-btn lm-btn-edit" data-edit-start="${lb.id}">Edit</button>
      <button class="lm-btn lm-btn-delete" data-del="${lb.id}">Delete</button>
    </li>`;
  }

  function _bindEvents() {
    const addBtn = _container.querySelector('#lm-add-btn');
    addBtn?.addEventListener('click', _addLabel);
    _container.querySelector('#lm-new-name')?.addEventListener('keydown', e => { if (e.key === 'Enter') _addLabel(); });

    _container.querySelectorAll('#lm-palette .lm-color-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        _container.querySelectorAll('#lm-palette .lm-color-swatch').forEach(s => s.classList.remove('lm-color-selected'));
        sw.classList.add('lm-color-selected');
      });
    });

    _container.querySelectorAll('[data-edit-start]').forEach(btn => {
      btn.addEventListener('click', () => { _editingId = +btn.dataset.editStart; render(); });
    });

    _container.querySelectorAll('[data-save]').forEach(btn => {
      btn.addEventListener('click', () => _saveEdit(+btn.dataset.save));
    });

    _container.querySelectorAll('[data-cancel]').forEach(btn => {
      btn.addEventListener('click', () => { _editingId = null; render(); });
    });

    _container.querySelectorAll('[data-edit]').forEach(sw => {
      sw.addEventListener('click', () => {
        const id = +sw.dataset.edit;
        const lb = _labels.find(l => l.id === id);
        if (lb) lb.color = sw.dataset.color;
        const parent = sw.closest('.lm-edit-palette');
        parent.querySelectorAll('.lm-color-swatch').forEach(s => s.classList.remove('lm-color-selected'));
        sw.classList.add('lm-color-selected');
      });
    });

    _container.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => _deleteLabel(+btn.dataset.del, btn));
    });
  }

  function _addLabel() {
    const nameInput = _container.querySelector('#lm-new-name');
    const name = (nameInput?.value || '').trim();
    if (!name) { nameInput?.focus(); return; }
    const selSwatch = _container.querySelector('#lm-palette .lm-color-selected');
    const color = selSwatch ? selSwatch.dataset.color : PALETTE[0];
    _labels.push({ id: _genId(), name, color, usageCount: 0 });
    render();
  }

  function _saveEdit(id) {
    const input = _container.querySelector(`.lm-edit-input[data-id="${id}"]`);
    const name = (input?.value || '').trim();
    if (!name) { input?.focus(); return; }
    const lb = _labels.find(l => l.id === id);
    if (lb) lb.name = name;
    _editingId = null;
    render();
  }

  function _deleteLabel(id, btn) {
    if (btn.dataset.confirmed) {
      _labels = _labels.filter(l => l.id !== id);
      render();
      return;
    }
    btn.textContent = 'Confirm?';
    btn.classList.add('lm-btn-confirm');
    btn.dataset.confirmed = 'true';
    setTimeout(() => { if (_container.contains(btn)) { btn.textContent = 'Delete'; btn.classList.remove('lm-btn-confirm'); delete btn.dataset.confirmed; } }, 3000);
  }

  function exportState() { return JSON.parse(JSON.stringify({ labels: _labels, nextId: _nextId })); }

  function importState(state) {
    if (!state) return;
    _labels = state.labels || [];
    _nextId = state.nextId || _labels.length + 1;
    _editingId = null;
    render();
  }

  return { init, render, exportState, importState };
})();
