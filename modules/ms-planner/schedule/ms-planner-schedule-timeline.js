const MsPlannerScheduleTimeline = (() => {
  let container, tasks = [], zoomLevel = 'week';
  const BUCKETS = { dev: '#3498db', design: '#9b59b6', qa: '#e67e22', ops: '#1abc9c' };
  const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  const DAY_MS = 86400000;
  const toDate = s => new Date(s + 'T00:00:00');

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) return;
    const now = new Date();
    const d = (off, dur) => {
      const s = new Date(now.getTime() + off * DAY_MS);
      const e = new Date(s.getTime() + dur * DAY_MS);
      return { start: s.toISOString().slice(0,10), end: e.toISOString().slice(0,10) };
    };
    tasks = [
      { id: 1, title: 'API endpoints', assignee: 'Alice', bucket: 'dev', ...d(-5, 10) },
      { id: 2, title: 'UI mockups', assignee: 'Bob', bucket: 'design', ...d(-2, 7) },
      { id: 3, title: 'Integration tests', assignee: 'Alice', bucket: 'qa', ...d(3, 6) },
      { id: 4, title: 'Deploy pipeline', assignee: 'Carol', bucket: 'ops', ...d(1, 4) },
      { id: 5, title: 'Component lib', assignee: 'Bob', bucket: 'dev', ...d(6, 8) },
    ];
    render();
  }

  function getRange() {
    const pxPerUnit = { day: 40, week: 120, month: 200 }[zoomLevel];
    let allDates = tasks.flatMap(t => [toDate(t.start), toDate(t.end)]);
    allDates.push(new Date());
    const minD = new Date(Math.min(...allDates) - 5 * DAY_MS);
    const maxD = new Date(Math.max(...allDates) + 5 * DAY_MS);
    const totalDays = Math.ceil((maxD - minD) / DAY_MS);
    const unitDays = { day: 1, week: 7, month: 30 }[zoomLevel];
    return { minD, maxD, totalDays, pxPerUnit, unitDays, totalPx: (totalDays / unitDays) * pxPerUnit };
  }

  function render() {
    const { minD, totalDays, pxPerUnit, unitDays, totalPx } = getRange();
    const assignees = [...new Set(tasks.map(t => t.assignee))];
    const todayOff = Math.ceil((new Date() - minD) / DAY_MS);
    const todayPx = (todayOff / unitDays) * pxPerUnit;

    let headerCells = '';
    for (let i = 0; i < totalDays; i += unitDays) {
      const d = new Date(minD.getTime() + i * DAY_MS);
      const label = zoomLevel === 'month' ? d.toLocaleDateString('en',{month:'short',year:'numeric'})
        : d.toLocaleDateString('en',{month:'short',day:'numeric'});
      headerCells += `<div class="mps-tl-hcell" style="width:${pxPerUnit}px">${label}</div>`;
    }

    let rows = '';
    assignees.forEach(a => {
      const aTask = tasks.filter(t => t.assignee === a);
      let bars = '';
      aTask.forEach(t => {
        const sOff = Math.max(0, (toDate(t.start) - minD) / DAY_MS);
        const dur = Math.max(1, (toDate(t.end) - toDate(t.start)) / DAY_MS);
        const left = (sOff / unitDays) * pxPerUnit;
        const width = (dur / unitDays) * pxPerUnit;
        const color = BUCKETS[t.bucket] || '#888';
        bars += `<div class="mps-tl-bar" data-id="${t.id}" style="left:${left}px;width:${width}px;background:${color}">
          <span class="mps-tl-bar-label">${esc(t.title)}</span>
          <div class="mps-tl-tooltip"><strong>${esc(t.title)}</strong><br/>
            ${esc(a)} &middot; ${t.start} &rarr; ${t.end}<br/>Bucket: ${esc(t.bucket)}</div>
        </div>`;
      });
      rows += `<div class="mps-tl-row">
        <div class="mps-tl-label">${esc(a)}</div>
        <div class="mps-tl-track" style="width:${totalPx}px">
          <div class="mps-tl-today" style="left:${todayPx}px"></div>${bars}
        </div>
      </div>`;
    });

    container.innerHTML = `<div class="mps-tl-wrapper">
      <div class="mps-tl-controls">
        <span class="mps-tl-ctrl-label">Zoom:</span>
        ${['day','week','month'].map(z => `<button class="mps-tl-zoom-btn ${z===zoomLevel?'mps-tl-zoom-active':''}" data-z="${z}">${z}</button>`).join('')}
      </div>
      <div class="mps-tl-scroll">
        <div class="mps-tl-header" style="padding-left:100px">${headerCells}</div>
        ${rows}
      </div>
      <div class="mps-tl-edit-area"></div>
    </div>`;
    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll('.mps-tl-zoom-btn').forEach(b => {
      b.addEventListener('click', () => { zoomLevel = b.dataset.z; render(); });
    });
    container.querySelectorAll('.mps-tl-bar').forEach(bar => {
      bar.addEventListener('click', e => {
        e.stopPropagation();
        const task = tasks.find(t => t.id === parseInt(bar.dataset.id));
        if (task) showEditForm(task);
      });
    });
  }

  function showEditForm(task) {
    const area = container.querySelector('.mps-tl-edit-area');
    area.innerHTML = `<div class="mps-tl-form">
      <input class="mps-tl-input" name="title" value="${esc(task.title)}" placeholder="Title"/>
      <input class="mps-tl-input" type="date" name="start" value="${task.start}"/>
      <input class="mps-tl-input" type="date" name="end" value="${task.end}"/>
      <input class="mps-tl-input" name="assignee" value="${esc(task.assignee)}" placeholder="Assignee"/>
      <select class="mps-tl-input" name="bucket">
        ${Object.keys(BUCKETS).map(b => `<option value="${b}" ${b===task.bucket?'selected':''}>${b}</option>`).join('')}
      </select>
      <button class="mps-tl-btn mps-tl-btn-save">Save</button>
      <button class="mps-tl-btn mps-tl-btn-del">Delete</button>
      <button class="mps-tl-btn mps-tl-btn-cancel">Cancel</button>
    </div>`;
    area.querySelector('.mps-tl-btn-save').addEventListener('click', () => {
      task.title = area.querySelector('[name=title]').value.trim() || task.title;
      task.start = area.querySelector('[name=start]').value || task.start;
      task.end = area.querySelector('[name=end]').value || task.end;
      task.assignee = area.querySelector('[name=assignee]').value.trim() || task.assignee;
      task.bucket = area.querySelector('[name=bucket]').value;
      render();
    });
    area.querySelector('.mps-tl-btn-del').addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id); render();
    });
    area.querySelector('.mps-tl-btn-cancel').addEventListener('click', () => { area.innerHTML = ''; });
  }

  function exportState() { return { zoomLevel, tasks: JSON.parse(JSON.stringify(tasks)) }; }
  function importState(state) {
    if (!state) return;
    zoomLevel = state.zoomLevel || zoomLevel;
    tasks = state.tasks || tasks;
    render();
  }

  return { init, render, exportState, importState };
})();
