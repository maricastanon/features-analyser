const MsPlannerBucketManager = (() => {
  const _esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  let _root = null;
  let _buckets = [];
  let _nextId = 1;

  const _colors = ['#e91e63', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'];

  function _newBucket(name, color) {
    return { id: _nextId++, name, color: color || _colors[0], collapsed: false, taskCount: Math.floor(Math.random() * 12) };
  }

  function _save() { _render(); }

  function _render() {
    if (!_root) return;
    const html = `
      <div class="bm-toolbar">
        <h2 class="bm-title">Bucket Manager</h2>
        <button class="bm-btn bm-btn-add" data-action="add-bucket">+ New Bucket</button>
      </div>
      <div class="bm-add-form bm-hidden" id="bm-add-form">
        <input class="bm-input" id="bm-new-name" placeholder="Bucket name" maxlength="60" />
        <select class="bm-select" id="bm-new-color">${_colors.map(c => `<option value="${c}" style="color:${c}">${c}</option>`).join('')}</select>
        <button class="bm-btn bm-btn-confirm" data-action="confirm-add">Add</button>
        <button class="bm-btn bm-btn-cancel" data-action="cancel-add">Cancel</button>
      </div>
      <ul class="bm-list">${_buckets.map((b, i) => `
        <li class="bm-item${b.collapsed ? ' bm-collapsed' : ''}" data-id="${b.id}">
          <span class="bm-color-dot" style="background:${_esc(b.color)}"></span>
          <span class="bm-name" data-action="start-rename" data-id="${b.id}">${_esc(b.name)}</span>
          <span class="bm-count">${b.taskCount} task${b.taskCount !== 1 ? 's' : ''}</span>
          <div class="bm-actions">
            <button class="bm-btn-icon" data-action="move-up" data-id="${b.id}" ${i === 0 ? 'disabled' : ''} title="Move up">&#9650;</button>
            <button class="bm-btn-icon" data-action="move-down" data-id="${b.id}" ${i === _buckets.length - 1 ? 'disabled' : ''} title="Move down">&#9660;</button>
            <button class="bm-btn-icon" data-action="toggle-collapse" data-id="${b.id}" title="${b.collapsed ? 'Expand' : 'Collapse'}">${b.collapsed ? '&#9654;' : '&#9660;'}</button>
            <input type="color" class="bm-color-picker" data-action="pick-color" data-id="${b.id}" value="${_esc(b.color)}" title="Bucket color" />
            <button class="bm-btn-icon bm-btn-delete" data-action="delete" data-id="${b.id}" title="Delete">&#10005;</button>
          </div>
          <div class="bm-rename-form bm-hidden" id="bm-rename-${b.id}">
            <input class="bm-input bm-rename-input" value="${_esc(b.name)}" maxlength="60" />
            <button class="bm-btn bm-btn-confirm" data-action="confirm-rename" data-id="${b.id}">Save</button>
            <button class="bm-btn bm-btn-cancel" data-action="cancel-rename" data-id="${b.id}">Cancel</button>
          </div>
        </li>`).join('')}
      </ul>
      ${_buckets.length === 0 ? '<p class="bm-empty">No buckets yet. Create one to get started.</p>' : ''}`;
    _root.innerHTML = html;
  }

  function _findBucket(id) { return _buckets.find(b => b.id === id); }
  function _findIndex(id) { return _buckets.findIndex(b => b.id === id); }

  function _handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id, 10);

    if (action === 'add-bucket') {
      const form = _root.querySelector('#bm-add-form');
      form.classList.remove('bm-hidden');
      form.querySelector('#bm-new-name').focus();
    } else if (action === 'confirm-add') {
      const name = _root.querySelector('#bm-new-name').value.trim();
      const color = _root.querySelector('#bm-new-color').value;
      if (name) { _buckets.push(_newBucket(name, color)); _save(); }
    } else if (action === 'cancel-add') {
      _root.querySelector('#bm-add-form').classList.add('bm-hidden');
    } else if (action === 'start-rename') {
      const form = _root.querySelector(`#bm-rename-${id}`);
      if (form) { form.classList.remove('bm-hidden'); form.querySelector('.bm-rename-input').focus(); }
    } else if (action === 'confirm-rename') {
      const input = _root.querySelector(`#bm-rename-${id} .bm-rename-input`);
      const b = _findBucket(id);
      if (b && input.value.trim()) { b.name = input.value.trim(); _save(); }
    } else if (action === 'cancel-rename') {
      const form = _root.querySelector(`#bm-rename-${id}`);
      if (form) form.classList.add('bm-hidden');
    } else if (action === 'delete') {
      const idx = _findIndex(id);
      if (idx !== -1) { _buckets.splice(idx, 1); _save(); }
    } else if (action === 'move-up') {
      const idx = _findIndex(id);
      if (idx > 0) { [_buckets[idx - 1], _buckets[idx]] = [_buckets[idx], _buckets[idx - 1]]; _save(); }
    } else if (action === 'move-down') {
      const idx = _findIndex(id);
      if (idx < _buckets.length - 1) { [_buckets[idx], _buckets[idx + 1]] = [_buckets[idx + 1], _buckets[idx]]; _save(); }
    } else if (action === 'toggle-collapse') {
      const b = _findBucket(id);
      if (b) { b.collapsed = !b.collapsed; _save(); }
    }
  }

  function _handleColorChange(e) {
    if (e.target.dataset.action !== 'pick-color') return;
    const id = parseInt(e.target.dataset.id, 10);
    const b = _findBucket(id);
    if (b) { b.color = e.target.value; _save(); }
  }

  function _handleDblClick(e) {
    const nameEl = e.target.closest('[data-action="start-rename"]');
    if (!nameEl) return;
    const id = parseInt(nameEl.dataset.id, 10);
    const form = _root.querySelector(`#bm-rename-${id}`);
    if (form) { form.classList.remove('bm-hidden'); form.querySelector('.bm-rename-input').focus(); }
  }

  return {
    init(containerId) {
      _root = document.getElementById(containerId);
      if (!_root) return;
      _root.classList.add('bm-root');
      _buckets = [_newBucket('To Do', '#2196f3'), _newBucket('In Progress', '#ff9800'), _newBucket('Done', '#4caf50')];
      _root.addEventListener('click', _handleClick);
      _root.addEventListener('input', _handleColorChange);
      _root.addEventListener('dblclick', _handleDblClick);
      _render();
    },
    render() { _render(); },
    exportState() { return JSON.parse(JSON.stringify({ buckets: _buckets, nextId: _nextId })); },
    importState(state) {
      if (!state) return;
      _buckets = state.buckets || [];
      _nextId = state.nextId || _buckets.length + 1;
      _render();
    }
  };
})();
