const MsPlannerBoardGrid = (() => {
  let container = null;
  let tasks = [];
  let nextId = 1;
  let sortCol = 'title';
  let sortAsc = true;
  let selectedIds = new Set();
  let editingCell = null;

  const COLUMNS = [
    { key: 'select', label: '', sortable: false },
    { key: 'title', label: 'Task Name', sortable: true },
    { key: 'bucket', label: 'Bucket', sortable: true },
    { key: 'assignee', label: 'Assignee', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'due', label: 'Due Date', sortable: true },
    { key: 'progress', label: 'Progress', sortable: true },
    { key: 'labels', label: 'Labels', sortable: true }
  ];

  const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
  const PROGRESS_OPTS = ['Not Started', 'In Progress', 'Completed'];

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) return;
    container.classList.add('gv-root');
    _seedData();
    render();
  }

  function _seedData() {
    const seed = [
      { title: 'Design login page', bucket: 'Design', assignee: 'Alice', priority: 'High', due: '2026-04-15', progress: 'In Progress', labels: 'UI' },
      { title: 'Build REST API', bucket: 'Backend', assignee: 'Bob', priority: 'Urgent', due: '2026-04-10', progress: 'In Progress', labels: 'API' },
      { title: 'Write unit tests', bucket: 'QA', assignee: 'Carol', priority: 'Medium', due: '2026-04-20', progress: 'Not Started', labels: 'Testing' },
      { title: 'Deploy to staging', bucket: 'DevOps', assignee: 'Dan', priority: 'High', due: '2026-04-18', progress: 'Not Started', labels: 'Infra' },
      { title: 'Setup CI pipeline', bucket: 'DevOps', assignee: 'Dan', priority: 'Low', due: '2026-04-05', progress: 'Completed', labels: 'Infra' },
      { title: 'Create wireframes', bucket: 'Design', assignee: 'Alice', priority: 'Medium', due: '2026-04-08', progress: 'Completed', labels: 'UI' }
    ];
    tasks = seed.map(t => ({ id: nextId++, ...t }));
  }

  function render() {
    if (!container) return;
    container.innerHTML = '';
    if (selectedIds.size > 0) container.appendChild(_renderBulkBar());
    container.appendChild(_renderTable());
    container.appendChild(_renderAddRow());
  }

  function _sorted() {
    const copy = [...tasks];
    copy.sort((a, b) => {
      const va = (a[sortCol] || '').toString().toLowerCase();
      const vb = (b[sortCol] || '').toString().toLowerCase();
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return copy;
  }

  function _renderTable() {
    const table = document.createElement('table');
    table.className = 'gv-table';
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    COLUMNS.forEach(col => {
      const th = document.createElement('th');
      th.className = 'gv-th';
      if (col.key === 'select') {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = selectedIds.size === tasks.length && tasks.length > 0;
        cb.addEventListener('change', () => {
          selectedIds = cb.checked ? new Set(tasks.map(t => t.id)) : new Set();
          render();
        });
        th.appendChild(cb);
      } else {
        th.textContent = col.label;
        if (col.sortable) {
          th.classList.add('gv-th--sortable');
          if (sortCol === col.key) th.classList.add(sortAsc ? 'gv-th--asc' : 'gv-th--desc');
          th.addEventListener('click', () => {
            if (sortCol === col.key) { sortAsc = !sortAsc; } else { sortCol = col.key; sortAsc = true; }
            render();
          });
        }
      }
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    _sorted().forEach(task => tbody.appendChild(_renderRow(task)));
    table.appendChild(tbody);
    return table;
  }

  function _renderRow(task) {
    const tr = document.createElement('tr');
    tr.className = 'gv-row' + (selectedIds.has(task.id) ? ' gv-row--selected' : '');
    COLUMNS.forEach(col => {
      const td = document.createElement('td');
      td.className = 'gv-td';
      if (col.key === 'select') {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = selectedIds.has(task.id);
        cb.addEventListener('change', () => {
          cb.checked ? selectedIds.add(task.id) : selectedIds.delete(task.id);
          render();
        });
        td.appendChild(cb);
      } else if (col.key === 'priority') {
        const span = document.createElement('span');
        span.className = 'gv-priority gv-priority--' + task.priority.toLowerCase();
        span.textContent = task.priority;
        td.appendChild(span);
        td.addEventListener('click', () => _inlineEdit(task, col.key, td));
      } else if (col.key === 'progress') {
        const span = document.createElement('span');
        span.className = 'gv-progress gv-progress--' + task.progress.replace(/\s+/g, '-').toLowerCase();
        span.textContent = task.progress;
        td.appendChild(span);
        td.addEventListener('click', () => _inlineEdit(task, col.key, td));
      } else {
        td.textContent = task[col.key];
        td.addEventListener('click', () => _inlineEdit(task, col.key, td));
      }
      tr.appendChild(td);
    });
    return tr;
  }

  function _inlineEdit(task, key, td) {
    if (editingCell) return;
    editingCell = true;
    td.innerHTML = '';
    let input;
    if (key === 'priority') {
      input = document.createElement('select');
      input.className = 'gv-edit-input';
      PRIORITIES.forEach(p => { const o = document.createElement('option'); o.value = p; o.textContent = p; if (task[key] === p) o.selected = true; input.appendChild(o); });
    } else if (key === 'progress') {
      input = document.createElement('select');
      input.className = 'gv-edit-input';
      PROGRESS_OPTS.forEach(p => { const o = document.createElement('option'); o.value = p; o.textContent = p; if (task[key] === p) o.selected = true; input.appendChild(o); });
    } else if (key === 'due') {
      input = document.createElement('input');
      input.type = 'date';
      input.className = 'gv-edit-input';
      input.value = task[key];
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.className = 'gv-edit-input';
      input.value = task[key];
    }
    td.appendChild(input);
    input.focus();
    const commit = () => { task[key] = input.value.trim() || task[key]; editingCell = null; render(); };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { editingCell = null; render(); } });
  }

  function _renderAddRow() {
    const form = document.createElement('div');
    form.className = 'gv-add-form';
    form.innerHTML = `
      <input class="gv-edit-input" placeholder="Task name" data-f="title" />
      <input class="gv-edit-input gv-edit-input--sm" placeholder="Bucket" data-f="bucket" />
      <input class="gv-edit-input gv-edit-input--sm" placeholder="Assignee" data-f="assignee" />
      <select class="gv-edit-input gv-edit-input--sm" data-f="priority">${PRIORITIES.map(p => `<option>${p}</option>`).join('')}</select>
      <input class="gv-edit-input gv-edit-input--sm" type="date" data-f="due" />
      <select class="gv-edit-input gv-edit-input--sm" data-f="progress">${PROGRESS_OPTS.map(p => `<option>${p}</option>`).join('')}</select>
      <input class="gv-edit-input gv-edit-input--sm" placeholder="Labels" data-f="labels" />
      <button class="gv-btn gv-btn-add">+ Add</button>`;
    form.querySelector('.gv-btn-add').addEventListener('click', () => {
      const title = form.querySelector('[data-f="title"]').value.trim();
      if (!title) return;
      const t = { id: nextId++, title };
      ['bucket', 'assignee', 'priority', 'due', 'progress', 'labels'].forEach(k => {
        t[k] = form.querySelector(`[data-f="${k}"]`).value || (k === 'priority' ? 'Low' : k === 'progress' ? 'Not Started' : '');
      });
      tasks.push(t);
      render();
    });
    return form;
  }

  function _renderBulkBar() {
    const bar = document.createElement('div');
    bar.className = 'gv-bulk-bar';
    bar.innerHTML = `<span class="gv-bulk-count">${selectedIds.size} selected</span>`;
    const delBtn = document.createElement('button');
    delBtn.className = 'gv-btn gv-btn-danger';
    delBtn.textContent = 'Delete Selected';
    delBtn.addEventListener('click', () => { tasks = tasks.filter(t => !selectedIds.has(t.id)); selectedIds.clear(); render(); });
    const markBtn = document.createElement('button');
    markBtn.className = 'gv-btn gv-btn-complete';
    markBtn.textContent = 'Mark Completed';
    markBtn.addEventListener('click', () => { tasks.forEach(t => { if (selectedIds.has(t.id)) t.progress = 'Completed'; }); selectedIds.clear(); render(); });
    bar.appendChild(markBtn);
    bar.appendChild(delBtn);
    return bar;
  }

  function exportState() {
    return JSON.parse(JSON.stringify({ tasks, nextId, sortCol, sortAsc }));
  }

  function importState(state) {
    if (!state || !state.tasks) return;
    tasks = state.tasks;
    nextId = state.nextId || tasks.reduce((m, t) => Math.max(m, t.id), 0) + 1;
    sortCol = state.sortCol || 'title';
    sortAsc = state.sortAsc !== undefined ? state.sortAsc : true;
    selectedIds.clear();
    render();
  }

  return { init, render, exportState, importState };
})();
