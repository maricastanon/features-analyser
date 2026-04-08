const MsPlannerChecklistTemplates = (() => {
  const _esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  let _container = null;
  let _templates = [];
  let _tasks = [];
  let _nextId = 1;
  let _editingId = null;
  let _previewId = null;
  let _creatingCustom = false;
  let _customName = '';
  let _customItems = [];

  function _genId() { return _nextId++; }

  const BUILTINS = [
    { name: 'Code Review', builtin: true, items: ['Review PR description','Check code style','Verify test coverage','Run linter','Test edge cases','Check security implications','Review documentation','Approve or request changes'] },
    { name: 'Bug Fix', builtin: true, items: ['Reproduce the bug','Identify root cause','Write failing test','Implement fix','Verify fix locally','Update documentation'] },
    { name: 'Feature Launch', builtin: true, items: ['Finalize requirements','Complete implementation','Write unit tests','Write integration tests','Update API docs','QA sign-off','Performance benchmarks','Security review','Create release notes','Deploy to production'] },
    { name: 'Design Review', builtin: true, items: ['Review user flows','Check accessibility','Validate responsive layouts','Verify brand consistency','Test with real data','Review animations','Collect stakeholder feedback'] },
    { name: 'Sprint Retrospective', builtin: true, items: ['Gather team feedback','Identify what went well','Identify improvements','Create action items','Schedule follow-ups'] }
  ];

  function init(containerId) {
    _container = document.getElementById(containerId);
    if (!_container) return;
    _templates = BUILTINS.map(t => ({ id: _genId(), name: t.name, builtin: true, items: [...t.items] }));
    _tasks = [
      { id: 101, name: 'Implement search feature', checklist: [] },
      { id: 102, name: 'Fix payment gateway bug', checklist: ['Investigate logs'] },
      { id: 103, name: 'Redesign settings page', checklist: [] }
    ];
    _editingId = null; _previewId = null; _creatingCustom = false;
    render();
  }

  function render() {
    if (!_container) return;
    _container.innerHTML = `<div class="ct-wrap">
      <h3 class="ct-title">Checklist Templates</h3>
      <div class="ct-grid">
        ${_templates.map(t => _renderTemplate(t)).join('')}
        <div class="ct-card ct-card-new">
          ${_creatingCustom ? _renderCreateForm() : `<button class="ct-new-btn" id="ct-start-create">+ Create Custom Template</button>`}
        </div>
      </div>
      ${_previewId ? _renderPreview() : ''}
    </div>`;
    _bindEvents();
  }

  function _renderTemplate(t) {
    const editing = _editingId === t.id;
    return `<div class="ct-card" data-tid="${t.id}">
      <div class="ct-card-header">
        <h4 class="ct-card-name">${_esc(t.name)}</h4>
        <span class="ct-card-count">${t.items.length} items</span>
      </div>
      ${editing ? _renderEditMode(t) : `<ul class="ct-item-list">
        ${t.items.slice(0, 4).map(i => `<li class="ct-item-preview">${_esc(i)}</li>`).join('')}
        ${t.items.length > 4 ? `<li class="ct-item-more">+${t.items.length - 4} more...</li>` : ''}
      </ul>
      <div class="ct-card-actions">
        <button class="ct-btn ct-btn-preview" data-preview="${t.id}">Preview</button>
        <button class="ct-btn ct-btn-edit" data-edit-start="${t.id}">Edit</button>
        ${!t.builtin ? `<button class="ct-btn ct-btn-del" data-del="${t.id}">Delete</button>` : ''}
      </div>`}
    </div>`;
  }

  function _renderEditMode(t) {
    return `<div class="ct-edit-area">
      <ul class="ct-edit-list">
        ${t.items.map((item, idx) => `<li class="ct-edit-item">
          <span class="ct-edit-text">${_esc(item)}</span>
          ${idx > 0 ? `<button class="ct-btn ct-btn-xs" data-eup="${t.id}" data-idx="${idx}">&#9650;</button>` : ''}
          ${idx < t.items.length - 1 ? `<button class="ct-btn ct-btn-xs" data-edown="${t.id}" data-idx="${idx}">&#9660;</button>` : ''}
          <button class="ct-btn ct-btn-xs ct-btn-x" data-erem="${t.id}" data-idx="${idx}">&times;</button>
        </li>`).join('')}
      </ul>
      <div class="ct-edit-add">
        <input type="text" class="ct-edit-input" id="ct-edit-new-${t.id}" placeholder="New item..." maxlength="100" />
        <button class="ct-btn ct-btn-add-item" data-eadd="${t.id}">Add</button>
      </div>
      <button class="ct-btn ct-btn-done" data-edone="${t.id}">Done Editing</button>
    </div>`;
  }

  function _renderCreateForm() {
    return `<div class="ct-create-form">
      <input type="text" class="ct-create-name" id="ct-custom-name" placeholder="Template name..." value="${_esc(_customName)}" maxlength="50" />
      <ul class="ct-create-items">
        ${_customItems.map((item, idx) => `<li class="ct-create-item">
          <span>${_esc(item)}</span>
          <button class="ct-btn ct-btn-xs ct-btn-x" data-crem="${idx}">&times;</button>
        </li>`).join('')}
      </ul>
      <div class="ct-create-add">
        <input type="text" class="ct-create-input" id="ct-custom-item" placeholder="Add item..." maxlength="100" />
        <button class="ct-btn ct-btn-add-item" id="ct-custom-add">Add</button>
      </div>
      <div class="ct-create-actions">
        <button class="ct-btn ct-btn-save" id="ct-custom-save">Save Template</button>
        <button class="ct-btn ct-btn-cancel" id="ct-custom-cancel">Cancel</button>
      </div>
    </div>`;
  }

  function _renderPreview() {
    const t = _templates.find(tp => tp.id === _previewId);
    if (!t) return '';
    return `<div class="ct-preview-overlay">
      <div class="ct-preview-modal">
        <h4 class="ct-preview-title">${_esc(t.name)}</h4>
        <ol class="ct-preview-list">${t.items.map(i => `<li>${_esc(i)}</li>`).join('')}</ol>
        <h5 class="ct-apply-heading">Apply to task:</h5>
        <div class="ct-apply-tasks">
          ${_tasks.map(tk => `<button class="ct-btn ct-btn-apply" data-apply-task="${tk.id}" data-apply-tpl="${t.id}">${_esc(tk.name)}</button>`).join('')}
        </div>
        <button class="ct-btn ct-btn-close" id="ct-close-preview">Close</button>
      </div>
    </div>`;
  }

  function _bindEvents() {
    _container.querySelector('#ct-start-create')?.addEventListener('click', () => { _creatingCustom = true; _customName = ''; _customItems = []; render(); });
    _container.querySelector('#ct-custom-add')?.addEventListener('click', _addCustomItem);
    _container.querySelector('#ct-custom-item')?.addEventListener('keydown', e => { if (e.key === 'Enter') _addCustomItem(); });
    _container.querySelector('#ct-custom-save')?.addEventListener('click', () => {
      const name = (_container.querySelector('#ct-custom-name')?.value || '').trim();
      if (!name || _customItems.length === 0) return;
      _templates.push({ id: _genId(), name, builtin: false, items: [..._customItems] });
      _creatingCustom = false; render();
    });
    _container.querySelector('#ct-custom-cancel')?.addEventListener('click', () => { _creatingCustom = false; render(); });
    _container.querySelectorAll('[data-crem]').forEach(btn => {
      btn.addEventListener('click', () => { _customItems.splice(+btn.dataset.crem, 1); render(); });
    });
    _container.querySelectorAll('[data-preview]').forEach(btn => {
      btn.addEventListener('click', () => { _previewId = +btn.dataset.preview; render(); });
    });
    _container.querySelector('#ct-close-preview')?.addEventListener('click', () => { _previewId = null; render(); });
    _container.querySelectorAll('[data-edit-start]').forEach(btn => {
      btn.addEventListener('click', () => { _editingId = +btn.dataset.editStart; render(); });
    });
    _container.querySelectorAll('[data-edone]').forEach(btn => {
      btn.addEventListener('click', () => { _editingId = null; render(); });
    });
    _container.querySelectorAll('[data-eadd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tid = +btn.dataset.eadd;
        const input = _container.querySelector(`#ct-edit-new-${tid}`);
        const val = (input?.value || '').trim();
        if (!val) { input?.focus(); return; }
        const t = _templates.find(tp => tp.id === tid);
        if (t) { t.items.push(val); render(); }
      });
    });
    _container.querySelectorAll('[data-erem]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = _templates.find(tp => tp.id === +btn.dataset.erem);
        if (t) { t.items.splice(+btn.dataset.idx, 1); render(); }
      });
    });
    _container.querySelectorAll('[data-eup]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = _templates.find(tp => tp.id === +btn.dataset.eup);
        const i = +btn.dataset.idx;
        if (t && i > 0) { [t.items[i - 1], t.items[i]] = [t.items[i], t.items[i - 1]]; render(); }
      });
    });
    _container.querySelectorAll('[data-edown]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = _templates.find(tp => tp.id === +btn.dataset.edown);
        const i = +btn.dataset.idx;
        if (t && i < t.items.length - 1) { [t.items[i], t.items[i + 1]] = [t.items[i + 1], t.items[i]]; render(); }
      });
    });
    _container.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.dataset.confirmed) { btn.textContent = 'Confirm?'; btn.dataset.confirmed = 'true'; setTimeout(() => { if (_container.contains(btn)) { btn.textContent = 'Delete'; delete btn.dataset.confirmed; } }, 3000); return; }
        _templates = _templates.filter(t => t.id !== +btn.dataset.del);
        render();
      });
    });
    _container.querySelectorAll('[data-apply-task]').forEach(btn => {
      btn.addEventListener('click', () => {
        const task = _tasks.find(t => t.id === +btn.dataset.applyTask);
        const tpl = _templates.find(t => t.id === +btn.dataset.applyTpl);
        if (task && tpl) { task.checklist.push(...tpl.items); _previewId = null; render(); }
      });
    });
  }

  function _addCustomItem() {
    const input = _container.querySelector('#ct-custom-item');
    const val = (input?.value || '').trim();
    if (!val) { input?.focus(); return; }
    _customName = (_container.querySelector('#ct-custom-name')?.value || '').trim();
    _customItems.push(val);
    render();
  }

  function exportState() {
    return JSON.parse(JSON.stringify({ templates: _templates, tasks: _tasks, nextId: _nextId }));
  }

  function importState(state) {
    if (!state) return;
    _templates = state.templates || [];
    _tasks = state.tasks || [];
    _nextId = state.nextId || 1;
    _editingId = null; _previewId = null; _creatingCustom = false;
    render();
  }

  return { init, render, exportState, importState };
})();
