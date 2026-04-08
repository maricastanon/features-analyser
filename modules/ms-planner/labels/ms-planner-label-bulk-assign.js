const MsPlannerLabelBulkAssign = (() => {
  const _esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  let _container = null;
  let _labels = [];
  let _tasks = [];
  let _selectedTasks = new Set();
  let _selectedLabels = new Set();
  let _undoSnapshot = null;

  function init(containerId) {
    _container = document.getElementById(containerId);
    if (!_container) return;
    _labels = [
      { id: 1, name: 'Priority', color: '#E74856' },
      { id: 2, name: 'In Progress', color: '#47D16C' },
      { id: 3, name: 'Review', color: '#00BCF2' },
      { id: 4, name: 'Bug', color: '#FF8C00' },
      { id: 5, name: 'Feature', color: '#8764B8' }
    ];
    _tasks = [
      { id: 1, name: 'Fix login page crash', labelIds: [1, 4] },
      { id: 2, name: 'Add dark mode toggle', labelIds: [5] },
      { id: 3, name: 'Update API docs', labelIds: [3] },
      { id: 4, name: 'Refactor auth service', labelIds: [2] },
      { id: 5, name: 'Design new dashboard', labelIds: [5] },
      { id: 6, name: 'Patch XSS vulnerability', labelIds: [1, 4] }
    ];
    _selectedTasks.clear();
    _selectedLabels.clear();
    _undoSnapshot = null;
    render();
  }

  function render() {
    if (!_container) return;
    const affectedTasks = _tasks.filter(t => _selectedTasks.has(t.id));
    _container.innerHTML = `<div class="ba-wrap">
      <h3 class="ba-title">Bulk Label Assignment</h3>
      <div class="ba-columns">
        <div class="ba-col ba-tasks-col">
          <h4 class="ba-col-title">Tasks <span class="ba-sel-count">${_selectedTasks.size} selected</span></h4>
          <label class="ba-select-all"><input type="checkbox" id="ba-sel-all" ${_selectedTasks.size === _tasks.length ? 'checked' : ''} /> Select All</label>
          <ul class="ba-task-list">
            ${_tasks.map(t => `<li class="ba-task-row${_selectedTasks.has(t.id) ? ' ba-task-selected' : ''}">
              <label class="ba-task-label">
                <input type="checkbox" class="ba-task-cb" data-tid="${t.id}" ${_selectedTasks.has(t.id) ? 'checked' : ''} />
                <span class="ba-task-name">${_esc(t.name)}</span>
              </label>
              <span class="ba-task-pills">${t.labelIds.map(lid => {
                const lb = _labels.find(l => l.id === lid);
                return lb ? `<span class="ba-mini-pill" style="background:${lb.color}">${_esc(lb.name)}</span>` : '';
              }).join('')}</span>
            </li>`).join('')}
          </ul>
        </div>
        <div class="ba-col ba-labels-col">
          <h4 class="ba-col-title">Labels to Assign</h4>
          <div class="ba-label-toggles">
            ${_labels.map(lb => `<button class="ba-label-toggle${_selectedLabels.has(lb.id) ? ' ba-label-on' : ''}" data-lid="${lb.id}" style="--lbl-color:${lb.color}">${_esc(lb.name)}</button>`).join('')}
          </div>
          <div class="ba-apply-actions">
            <button class="ba-btn ba-btn-apply" id="ba-apply" ${_selectedTasks.size === 0 || _selectedLabels.size === 0 ? 'disabled' : ''}>Apply Labels</button>
            <button class="ba-btn ba-btn-remove" id="ba-remove" ${_selectedTasks.size === 0 || _selectedLabels.size === 0 ? 'disabled' : ''}>Remove Labels</button>
            <button class="ba-btn ba-btn-undo" id="ba-undo" ${_undoSnapshot ? '' : 'disabled'}>Undo</button>
          </div>
        </div>
      </div>
      ${affectedTasks.length > 0 && _selectedLabels.size > 0 ? `<div class="ba-preview">
        <h4 class="ba-preview-title">Preview: ${affectedTasks.length} task${affectedTasks.length !== 1 ? 's' : ''} will be affected</h4>
        <ul class="ba-preview-list">${affectedTasks.map(t => `<li class="ba-preview-item">${_esc(t.name)}</li>`).join('')}</ul>
      </div>` : ''}
    </div>`;
    _bindEvents();
  }

  function _bindEvents() {
    _container.querySelector('#ba-sel-all')?.addEventListener('change', e => {
      _selectedTasks = e.target.checked ? new Set(_tasks.map(t => t.id)) : new Set();
      render();
    });
    _container.querySelectorAll('.ba-task-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = +cb.dataset.tid;
        cb.checked ? _selectedTasks.add(id) : _selectedTasks.delete(id);
        render();
      });
    });
    _container.querySelectorAll('.ba-label-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = +btn.dataset.lid;
        _selectedLabels.has(id) ? _selectedLabels.delete(id) : _selectedLabels.add(id);
        render();
      });
    });
    _container.querySelector('#ba-apply')?.addEventListener('click', () => {
      _undoSnapshot = JSON.parse(JSON.stringify(_tasks));
      const lids = [..._selectedLabels];
      _tasks.forEach(t => {
        if (_selectedTasks.has(t.id)) {
          lids.forEach(lid => { if (!t.labelIds.includes(lid)) t.labelIds.push(lid); });
        }
      });
      render();
    });
    _container.querySelector('#ba-remove')?.addEventListener('click', () => {
      _undoSnapshot = JSON.parse(JSON.stringify(_tasks));
      const lids = [..._selectedLabels];
      _tasks.forEach(t => {
        if (_selectedTasks.has(t.id)) {
          t.labelIds = t.labelIds.filter(lid => !lids.includes(lid));
        }
      });
      render();
    });
    _container.querySelector('#ba-undo')?.addEventListener('click', () => {
      if (_undoSnapshot) { _tasks = _undoSnapshot; _undoSnapshot = null; render(); }
    });
  }

  function exportState() {
    return { labels: _labels, tasks: JSON.parse(JSON.stringify(_tasks)), selectedTasks: [..._selectedTasks], selectedLabels: [..._selectedLabels] };
  }

  function importState(state) {
    if (!state) return;
    _labels = state.labels || [];
    _tasks = state.tasks || [];
    _selectedTasks = new Set(state.selectedTasks || []);
    _selectedLabels = new Set(state.selectedLabels || []);
    _undoSnapshot = null;
    render();
  }

  return { init, render, exportState, importState };
})();
