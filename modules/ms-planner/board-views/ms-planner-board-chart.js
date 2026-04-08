const MsPlannerBoardChart = (() => {
  let container = null;
  let tasks = [];
  let activeFilter = null;

  const STATUS_COLORS = { 'Not Started': '#95a5a6', 'In Progress': 'var(--accent-pink)', 'Completed': 'var(--accent-green)' };

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) return;
    container.classList.add('ch-root');
    _seedData();
    render();
  }

  function _seedData() {
    tasks = [
      { id: 1, title: 'Design login page', bucket: 'Design', assignee: 'Alice', status: 'In Progress', due: '2026-04-15' },
      { id: 2, title: 'Build REST API', bucket: 'Backend', assignee: 'Bob', status: 'In Progress', due: '2026-04-10' },
      { id: 3, title: 'Write unit tests', bucket: 'QA', assignee: 'Carol', status: 'Not Started', due: '2026-04-20' },
      { id: 4, title: 'Deploy to staging', bucket: 'DevOps', assignee: 'Dan', status: 'Not Started', due: '2026-04-18' },
      { id: 5, title: 'Setup CI pipeline', bucket: 'DevOps', assignee: 'Dan', status: 'Completed', due: '2026-04-05' },
      { id: 6, title: 'Create wireframes', bucket: 'Design', assignee: 'Alice', status: 'Completed', due: '2026-04-08' },
      { id: 7, title: 'Database schema', bucket: 'Backend', assignee: 'Bob', status: 'Completed', due: '2026-04-03' },
      { id: 8, title: 'Code review', bucket: 'QA', assignee: 'Carol', status: 'Not Started', due: '2026-04-22' },
      { id: 9, title: 'Security audit', bucket: 'QA', assignee: 'Eve', status: 'Not Started', due: '2026-04-06' },
      { id: 10, title: 'User testing', bucket: 'Design', assignee: 'Alice', status: 'Not Started', due: '2026-04-25' }
    ];
  }

  function _filtered() {
    if (!activeFilter) return tasks;
    return tasks.filter(t => t[activeFilter.key] === activeFilter.value);
  }

  function render() {
    if (!container) return;
    container.innerHTML = '';
    const filtered = _filtered();

    if (activeFilter) {
      const bar = document.createElement('div');
      bar.className = 'ch-filter-bar';
      bar.innerHTML = `<span>Filtered by: <strong>${esc(activeFilter.key)}</strong> = <strong>${esc(activeFilter.value)}</strong></span>`;
      const btn = document.createElement('button');
      btn.className = 'ch-btn-clear';
      btn.textContent = 'Clear filter';
      btn.addEventListener('click', () => { activeFilter = null; render(); });
      bar.appendChild(btn);
      container.appendChild(bar);
    }

    container.appendChild(_renderStats(filtered));
    const charts = document.createElement('div');
    charts.className = 'ch-charts';
    charts.appendChild(_renderDonut(filtered));
    charts.appendChild(_renderBucketBars(filtered));
    charts.appendChild(_renderMemberBars(filtered));
    container.appendChild(charts);
    container.appendChild(_renderTaskList(filtered));
  }

  function _renderStats(list) {
    const total = list.length;
    const completed = list.filter(t => t.status === 'Completed').length;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    const overdue = list.filter(t => t.status !== 'Completed' && new Date(t.due) < new Date()).length;
    const el = document.createElement('div');
    el.className = 'ch-stats';
    el.innerHTML = `
      <div class="ch-stat-card"><div class="ch-stat-value">${total}</div><div class="ch-stat-label">Total Tasks</div></div>
      <div class="ch-stat-card"><div class="ch-stat-value ch-stat--green">${pct}%</div><div class="ch-stat-label">Completion</div></div>
      <div class="ch-stat-card"><div class="ch-stat-value ch-stat--pink">${overdue}</div><div class="ch-stat-label">Overdue</div></div>
      <div class="ch-stat-card"><div class="ch-stat-value">${completed}/${total}</div><div class="ch-stat-label">Done</div></div>`;
    return el;
  }

  function _renderDonut(list) {
    const counts = {};
    Object.keys(STATUS_COLORS).forEach(s => counts[s] = 0);
    list.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);
    const total = list.length || 1;
    let cumulative = 0;
    const segments = Object.entries(counts).map(([status, count]) => {
      const pct = (count / total) * 100;
      const start = cumulative;
      cumulative += pct;
      return { status, count, pct, start };
    });

    const gradientStops = segments.map(s => {
      const color = STATUS_COLORS[s.status];
      return `${color} ${s.start}% ${s.start + s.pct}%`;
    }).join(', ');

    const wrap = document.createElement('div');
    wrap.className = 'ch-chart-card';
    wrap.innerHTML = `<div class="ch-chart-title">Tasks by Status</div>`;
    const donut = document.createElement('div');
    donut.className = 'ch-donut';
    donut.style.setProperty('--donut-gradient', gradientStops);
    donut.innerHTML = `<div class="ch-donut-ring"></div><div class="ch-donut-center">${list.length}</div>`;
    wrap.appendChild(donut);

    const legend = document.createElement('div');
    legend.className = 'ch-legend';
    segments.forEach(s => {
      const item = document.createElement('div');
      item.className = 'ch-legend-item';
      item.innerHTML = `<span class="ch-legend-dot" style="background:${STATUS_COLORS[s.status]}"></span><span>${esc(s.status)}</span><strong>${s.count}</strong>`;
      item.addEventListener('click', () => { activeFilter = { key: 'status', value: s.status }; render(); });
      legend.appendChild(item);
    });
    wrap.appendChild(legend);
    return wrap;
  }

  function _renderBucketBars(list) {
    const buckets = {};
    list.forEach(t => buckets[t.bucket] = (buckets[t.bucket] || 0) + 1);
    const max = Math.max(1, ...Object.values(buckets));
    const wrap = document.createElement('div');
    wrap.className = 'ch-chart-card';
    wrap.innerHTML = `<div class="ch-chart-title">Tasks per Bucket</div>`;
    const bars = document.createElement('div');
    bars.className = 'ch-hbars';
    Object.entries(buckets).forEach(([name, count]) => {
      const row = document.createElement('div');
      row.className = 'ch-hbar-row';
      row.innerHTML = `<span class="ch-hbar-label">${esc(name)}</span><div class="ch-hbar-track"><div class="ch-hbar-fill ch-hbar-fill--pink" style="width:${(count / max) * 100}%"></div></div><span class="ch-hbar-val">${count}</span>`;
      row.addEventListener('click', () => { activeFilter = { key: 'bucket', value: name }; render(); });
      bars.appendChild(row);
    });
    wrap.appendChild(bars);
    return wrap;
  }

  function _renderMemberBars(list) {
    const members = {};
    list.forEach(t => members[t.assignee] = (members[t.assignee] || 0) + 1);
    const max = Math.max(1, ...Object.values(members));
    const wrap = document.createElement('div');
    wrap.className = 'ch-chart-card';
    wrap.innerHTML = `<div class="ch-chart-title">Tasks per Member</div>`;
    const bars = document.createElement('div');
    bars.className = 'ch-hbars';
    Object.entries(members).forEach(([name, count]) => {
      const row = document.createElement('div');
      row.className = 'ch-hbar-row';
      row.innerHTML = `<span class="ch-hbar-label">${esc(name)}</span><div class="ch-hbar-track"><div class="ch-hbar-fill ch-hbar-fill--green" style="width:${(count / max) * 100}%"></div></div><span class="ch-hbar-val">${count}</span>`;
      row.addEventListener('click', () => { activeFilter = { key: 'assignee', value: name }; render(); });
      bars.appendChild(row);
    });
    wrap.appendChild(bars);
    return wrap;
  }

  function _renderTaskList(list) {
    const wrap = document.createElement('div');
    wrap.className = 'ch-tasklist';
    wrap.innerHTML = `<div class="ch-chart-title">Task List (${list.length})</div>`;
    const ul = document.createElement('ul');
    ul.className = 'ch-task-ul';
    list.forEach(t => {
      const li = document.createElement('li');
      li.className = 'ch-task-li';
      const overdue = t.status !== 'Completed' && new Date(t.due) < new Date();
      li.innerHTML = `<span class="ch-task-status" style="color:${STATUS_COLORS[t.status]}">\u25CF</span>
        <span class="ch-task-name">${esc(t.title)}</span>
        <span class="ch-task-meta">${esc(t.assignee)} &middot; ${esc(t.bucket)}</span>
        <span class="ch-task-due${overdue ? ' ch-task-due--overdue' : ''}">${esc(t.due)}</span>`;
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    return wrap;
  }

  function exportState() {
    return JSON.parse(JSON.stringify({ tasks, activeFilter }));
  }

  function importState(state) {
    if (!state || !state.tasks) return;
    tasks = state.tasks;
    activeFilter = state.activeFilter || null;
    render();
  }

  return { init, render, exportState, importState };
})();
