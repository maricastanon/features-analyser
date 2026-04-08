const MsPlannerChecklistProgress = (() => {
  const _esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  let _container = null;
  let _tasks = [];
  let _sortDir = 'desc';
  let _expandedId = null;

  function init(containerId) {
    _container = document.getElementById(containerId);
    if (!_container) return;
    _tasks = [
      { id: 1, name: 'User Authentication', items: [
        { text: 'Design login form', done: true }, { text: 'Implement OAuth', done: true },
        { text: 'Add 2FA support', done: true }, { text: 'Write auth tests', done: true }, { text: 'Security audit', done: true }
      ]},
      { id: 2, name: 'Dashboard Redesign', items: [
        { text: 'Create mockups', done: true }, { text: 'Build components', done: true },
        { text: 'Integrate API', done: false }, { text: 'Responsive layout', done: false }, { text: 'A/B testing', done: false }
      ]},
      { id: 3, name: 'API v2 Migration', items: [
        { text: 'Document endpoints', done: true }, { text: 'Update schemas', done: false },
        { text: 'Migrate clients', done: false }, { text: 'Deprecation notices', done: false },
        { text: 'Load testing', done: false }, { text: 'Rollout plan', done: false }
      ]},
      { id: 4, name: 'Performance Optimization', items: [
        { text: 'Profile bottlenecks', done: true }, { text: 'Optimize queries', done: true },
        { text: 'Add caching layer', done: true }, { text: 'CDN setup', done: false }
      ]},
      { id: 5, name: 'Mobile App Release', items: [
        { text: 'Final QA pass', done: true }, { text: 'App store assets', done: true },
        { text: 'Submit for review', done: true }, { text: 'Marketing prep', done: true },
        { text: 'Release notes', done: true }, { text: 'Monitor crash reports', done: true }
      ]}
    ];
    render();
  }

  function _calcProgress(task) {
    const total = task.items.length;
    const done = task.items.filter(i => i.done).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { done, total, pct };
  }

  function _colorClass(pct) {
    if (pct >= 100) return 'cp-green';
    if (pct >= 50) return 'cp-yellow';
    return 'cp-red';
  }

  function _getSorted() {
    return [..._tasks].sort((a, b) => {
      const pa = _calcProgress(a).pct, pb = _calcProgress(b).pct;
      return _sortDir === 'asc' ? pa - pb : pb - pa;
    });
  }

  function _summary() {
    let totalItems = 0, totalDone = 0;
    _tasks.forEach(t => { totalItems += t.items.length; totalDone += t.items.filter(i => i.done).length; });
    const pct = totalItems === 0 ? 0 : Math.round((totalDone / totalItems) * 100);
    return { totalItems, totalDone, pct };
  }

  function render() {
    if (!_container) return;
    const sorted = _getSorted();
    const s = _summary();
    _container.innerHTML = `<div class="cp-wrap">
      <h3 class="cp-title">Checklist Progress Dashboard</h3>
      <div class="cp-summary">
        <div class="cp-stat"><span class="cp-stat-val">${s.totalItems}</span><span class="cp-stat-lbl">Total Items</span></div>
        <div class="cp-stat"><span class="cp-stat-val">${s.totalDone}</span><span class="cp-stat-lbl">Completed</span></div>
        <div class="cp-stat"><span class="cp-stat-val ${_colorClass(s.pct)}-text">${s.pct}%</span><span class="cp-stat-lbl">Overall</span></div>
      </div>
      <div class="cp-sort-row">
        <button class="cp-sort-btn" id="cp-sort">Sort by completion: ${_sortDir === 'desc' ? 'High \u2192 Low' : 'Low \u2192 High'}</button>
      </div>
      <div class="cp-table">
        ${sorted.map(t => {
          const p = _calcProgress(t);
          const cc = _colorClass(p.pct);
          const expanded = _expandedId === t.id;
          return `<div class="cp-row ${cc}" data-rid="${t.id}">
            <div class="cp-row-main" data-toggle="${t.id}">
              <span class="cp-task-name">${_esc(t.name)}</span>
              <div class="cp-bar-wrap"><div class="cp-bar ${cc}-bg" style="width:${p.pct}%"></div></div>
              <span class="cp-fraction">${p.done}/${p.total}</span>
              <span class="cp-pct ${cc}-text">${p.pct}%</span>
              <span class="cp-expand-icon">${expanded ? '\u25B2' : '\u25BC'}</span>
            </div>
            ${expanded ? `<ul class="cp-sub-items">
              ${t.items.map(i => `<li class="cp-sub-item${i.done ? ' cp-sub-done' : ''}">
                <span class="cp-sub-check">${i.done ? '\u2714' : '\u25CB'}</span>
                <span>${_esc(i.text)}</span>
              </li>`).join('')}
            </ul>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
    _bindEvents();
  }

  function _bindEvents() {
    _container.querySelector('#cp-sort')?.addEventListener('click', () => {
      _sortDir = _sortDir === 'desc' ? 'asc' : 'desc';
      render();
    });
    _container.querySelectorAll('[data-toggle]').forEach(row => {
      row.addEventListener('click', () => {
        const id = +row.dataset.toggle;
        _expandedId = _expandedId === id ? null : id;
        render();
      });
    });
  }

  function exportState() {
    return { tasks: JSON.parse(JSON.stringify(_tasks)), sortDir: _sortDir, expandedId: _expandedId };
  }

  function importState(state) {
    if (!state) return;
    _tasks = state.tasks || [];
    _sortDir = state.sortDir || 'desc';
    _expandedId = state.expandedId || null;
    render();
  }

  return { init, render, exportState, importState };
})();
