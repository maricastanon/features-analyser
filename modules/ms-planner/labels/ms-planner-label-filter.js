const MsPlannerLabelFilter = (() => {
  const _esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  let _container = null;
  let _labels = [];
  let _tasks = [];
  let _activeFilters = new Set();
  let _matchMode = 'any';

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
      { id: 2, name: 'Add dark mode toggle', labelIds: [2, 5] },
      { id: 3, name: 'Update API docs', labelIds: [3] },
      { id: 4, name: 'Refactor auth service', labelIds: [1, 2, 3] },
      { id: 5, name: 'Design new dashboard', labelIds: [5] },
      { id: 6, name: 'Fix memory leak in worker', labelIds: [1, 4, 2] },
      { id: 7, name: 'Add export CSV feature', labelIds: [5, 3] },
      { id: 8, name: 'Patch XSS vulnerability', labelIds: [1, 4] }
    ];
    _activeFilters.clear();
    _matchMode = 'any';
    render();
  }

  function _getFiltered() {
    if (_activeFilters.size === 0) return _tasks;
    const ids = [..._activeFilters];
    return _tasks.filter(t => {
      if (_matchMode === 'all') return ids.every(id => t.labelIds.includes(id));
      return ids.some(id => t.labelIds.includes(id));
    });
  }

  function render() {
    if (!_container) return;
    const filtered = _getFiltered();
    const activeCount = _activeFilters.size;
    _container.innerHTML = `<div class="lf-wrap">
      <div class="lf-header">
        <h3 class="lf-title">Filter by Label</h3>
        ${activeCount > 0 ? `<span class="lf-badge">${activeCount}</span>` : ''}
      </div>
      <div class="lf-controls">
        <div class="lf-pills">
          ${_labels.map(lb => {
            const active = _activeFilters.has(lb.id);
            return `<button class="lf-pill${active ? ' lf-pill-active' : ''}" data-lid="${lb.id}" style="--pill-color:${lb.color}">${_esc(lb.name)}</button>`;
          }).join('')}
        </div>
        <div class="lf-actions">
          <div class="lf-toggle">
            <button class="lf-mode-btn${_matchMode === 'any' ? ' lf-mode-active' : ''}" data-mode="any">Match Any</button>
            <button class="lf-mode-btn${_matchMode === 'all' ? ' lf-mode-active' : ''}" data-mode="all">Match All</button>
          </div>
          <button class="lf-clear-btn" id="lf-clear">Clear Filters</button>
        </div>
      </div>
      <div class="lf-results">
        <p class="lf-results-count">${filtered.length} task${filtered.length !== 1 ? 's' : ''} found</p>
        <ul class="lf-task-list">
          ${filtered.map(t => `<li class="lf-task-item">
            <span class="lf-task-name">${_esc(t.name)}</span>
            <span class="lf-task-labels">${t.labelIds.map(lid => {
              const lb = _labels.find(l => l.id === lid);
              return lb ? `<span class="lf-mini-pill" style="background:${lb.color}">${_esc(lb.name)}</span>` : '';
            }).join('')}</span>
          </li>`).join('')}
          ${filtered.length === 0 ? '<li class="lf-empty">No tasks match the selected filters.</li>' : ''}
        </ul>
      </div>
    </div>`;
    _bindEvents();
  }

  function _bindEvents() {
    _container.querySelectorAll('.lf-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = +btn.dataset.lid;
        _activeFilters.has(id) ? _activeFilters.delete(id) : _activeFilters.add(id);
        render();
      });
    });
    _container.querySelectorAll('.lf-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => { _matchMode = btn.dataset.mode; render(); });
    });
    _container.querySelector('#lf-clear')?.addEventListener('click', () => { _activeFilters.clear(); render(); });
  }

  function exportState() {
    return { labels: _labels, tasks: _tasks, activeFilters: [..._activeFilters], matchMode: _matchMode };
  }

  function importState(state) {
    if (!state) return;
    _labels = state.labels || [];
    _tasks = state.tasks || [];
    _activeFilters = new Set(state.activeFilters || []);
    _matchMode = state.matchMode || 'any';
    render();
  }

  return { init, render, exportState, importState };
})();
