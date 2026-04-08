const MsPlannerScheduleGantt = (() => {
  let container, tasks = [], nextId = 10;
  const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  const DAY_MS = 86400000, PX_PER_DAY = 28;
  const toDate = s => new Date(s + 'T00:00:00');
  const fmtD = d => d.toISOString().slice(0, 10);

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) return;
    const now = new Date();
    const off = (n, dur, deps, prog, ms) => {
      const s = new Date(now.getTime() + n * DAY_MS);
      return { start: fmtD(s), end: fmtD(new Date(s.getTime() + dur * DAY_MS)), deps, progress: prog, milestone: !!ms };
    };
    tasks = [
      { id: 1, title: 'Requirements', ...off(-8, 5, [], 100, false) },
      { id: 2, title: 'Design phase', ...off(-3, 6, [1], 70, false) },
      { id: 3, title: 'Design approval', ...off(3, 0, [2], 0, true) },
      { id: 4, title: 'Backend dev', ...off(4, 10, [3], 30, false) },
      { id: 5, title: 'Frontend dev', ...off(4, 12, [3], 20, false) },
      { id: 6, title: 'Integration', ...off(16, 5, [4, 5], 0, false) },
      { id: 7, title: 'QA testing', ...off(21, 6, [6], 0, false) },
      { id: 8, title: 'Go-live', ...off(27, 0, [7], 0, true) },
    ];
    render();
  }

  function computeCritical() {
    const byId = {};
    tasks.forEach(t => byId[t.id] = t);
    const endDays = {};
    const calcEnd = id => {
      if (endDays[id] !== undefined) return endDays[id];
      const t = byId[id]; if (!t) return 0;
      const dur = Math.max(1, Math.ceil((toDate(t.end) - toDate(t.start)) / DAY_MS));
      const depMax = t.deps.length ? Math.max(...t.deps.map(calcEnd)) : 0;
      endDays[id] = depMax + dur;
      return endDays[id];
    };
    tasks.forEach(t => calcEnd(t.id));
    const maxEnd = Math.max(...Object.values(endDays));
    const critical = new Set();
    const markCrit = id => {
      critical.add(id);
      const t = byId[id]; if (!t) return;
      t.deps.forEach(d => { if (endDays[d] + Math.max(1, Math.ceil((toDate(t.end) - toDate(t.start)) / DAY_MS)) >= endDays[id]) markCrit(d); });
    };
    tasks.forEach(t => { if (endDays[t.id] === maxEnd) markCrit(t.id); });
    return critical;
  }

  function render() {
    if (!tasks.length) { container.innerHTML = '<div class="mps-gt-wrapper"><p class="mps-gt-empty">No tasks. Add one below.</p><div class="mps-gt-add-area"></div></div>'; bindAdd(); return; }
    const allDates = tasks.flatMap(t => [toDate(t.start), toDate(t.end)]);
    allDates.push(new Date());
    const minD = new Date(Math.min(...allDates) - 3 * DAY_MS);
    const maxD = new Date(Math.max(...allDates) + 5 * DAY_MS);
    const totalDays = Math.ceil((maxD - minD) / DAY_MS);
    const critical = computeCritical();
    const todayPx = Math.ceil((new Date() - minD) / DAY_MS) * PX_PER_DAY;

    let headerCells = '';
    for (let i = 0; i < totalDays; i += 7) {
      const d = new Date(minD.getTime() + i * DAY_MS);
      headerCells += `<div class="mps-gt-hcell" style="width:${7 * PX_PER_DAY}px">${d.toLocaleDateString('en',{month:'short',day:'numeric'})}</div>`;
    }

    const taskPosById = {};
    tasks.forEach(t => {
      taskPosById[t.id] = {
        left: Math.ceil((toDate(t.start) - minD) / DAY_MS) * PX_PER_DAY,
        width: Math.max(1, Math.ceil((toDate(t.end) - toDate(t.start)) / DAY_MS)) * PX_PER_DAY
      };
    });

    let rows = '';
    tasks.forEach((t, idx) => {
      const p = taskPosById[t.id];
      const isCrit = critical.has(t.id);
      const barCls = t.milestone ? 'mps-gt-milestone' : ('mps-gt-bar' + (isCrit ? ' mps-gt-critical' : ''));
      const barContent = t.milestone
        ? `<div class="${barCls}" style="left:${p.left - 8}px"></div>`
        : `<div class="${barCls}" style="left:${p.left}px;width:${p.width}px"><div class="mps-gt-progress" style="width:${t.progress}%"></div><span class="mps-gt-bar-text">${t.progress}%</span></div>`;

      let arrows = '';
      t.deps.forEach(depId => {
        const dp = taskPosById[depId];
        if (!dp) return;
        const depIdx = tasks.findIndex(x => x.id === depId);
        const fromX = dp.left + dp.width;
        const fromY = depIdx * 44 + 22;
        const toX = p.left;
        const toY = idx * 44 + 22;
        const midX = fromX + 12;
        arrows += `<path d="M${fromX},${fromY} L${midX},${fromY} L${midX},${toY} L${toX},${toY}" class="mps-gt-arrow" marker-end="url(#arrowhead)"/>`;
      });

      rows += `<div class="mps-gt-row">
        <div class="mps-gt-task-cell">
          <span class="mps-gt-task-name" data-id="${t.id}">${esc(t.title)}</span>
          <button class="mps-gt-del-btn" data-id="${t.id}">&times;</button>
        </div>
        <div class="mps-gt-chart-cell" style="width:${totalDays * PX_PER_DAY}px">${barContent}</div>
      </div>`;
    });

    const svgH = tasks.length * 44;
    container.innerHTML = `<div class="mps-gt-wrapper">
      <div class="mps-gt-scroll">
        <div class="mps-gt-header"><div class="mps-gt-task-hdr">Task</div><div class="mps-gt-chart-hdr" style="width:${totalDays * PX_PER_DAY}px">${headerCells}</div></div>
        <div class="mps-gt-body" style="position:relative">
          <svg class="mps-gt-svg" style="width:${totalDays * PX_PER_DAY + 120}px;height:${svgH}px;position:absolute;left:120px;top:0;pointer-events:none">
            <defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="var(--text-muted)"/></marker></defs>
            ${tasks.map((t, i) => { let a = ''; t.deps.forEach(depId => { const dp = taskPosById[depId]; if (!dp) return; const di = tasks.findIndex(x=>x.id===depId); const fx=dp.left+dp.width,fy=di*44+22,tx=taskPosById[t.id].left,ty=i*44+22,mx=fx+12; a+=`<path d="M${fx},${fy} L${mx},${fy} L${mx},${ty} L${tx},${ty}" class="mps-gt-arrow" marker-end="url(#arrowhead)"/>`; }); return a; }).join('')}
            <line x1="${todayPx}" y1="0" x2="${todayPx}" y2="${svgH}" class="mps-gt-today-line"/>
          </svg>
          ${rows}
        </div>
      </div>
      <div class="mps-gt-add-area"></div>
      <div class="mps-gt-edit-area"></div>
    </div>`;
    bindEvents();
    bindAdd();
  }

  function bindAdd() {
    const area = container.querySelector('.mps-gt-add-area');
    area.innerHTML = `<div class="mps-gt-form">
      <input class="mps-gt-input" name="title" placeholder="New task title"/>
      <input class="mps-gt-input" type="date" name="start"/>
      <input class="mps-gt-input" type="date" name="end"/>
      <input class="mps-gt-input" type="number" name="progress" placeholder="%" min="0" max="100" value="0"/>
      <label class="mps-gt-chk"><input type="checkbox" name="milestone"/> Milestone</label>
      <input class="mps-gt-input" name="deps" placeholder="Dep IDs (comma)"/>
      <button class="mps-gt-btn mps-gt-btn-add">Add</button>
    </div>`;
    area.querySelector('.mps-gt-btn-add').addEventListener('click', () => {
      const title = area.querySelector('[name=title]').value.trim();
      const start = area.querySelector('[name=start]').value;
      const end = area.querySelector('[name=end]').value || start;
      const progress = parseInt(area.querySelector('[name=progress]').value) || 0;
      const milestone = area.querySelector('[name=milestone]').checked;
      const deps = area.querySelector('[name=deps]').value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (!title || !start) return;
      tasks.push({ id: nextId++, title, start, end: milestone ? start : end, progress, milestone, deps });
      render();
    });
  }

  function bindEvents() {
    container.querySelectorAll('.mps-gt-task-name').forEach(el => {
      el.addEventListener('click', () => {
        const task = tasks.find(t => t.id === parseInt(el.dataset.id));
        if (task) showEdit(task);
      });
    });
    container.querySelectorAll('.mps-gt-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        tasks = tasks.filter(t => t.id !== id);
        tasks.forEach(t => { t.deps = t.deps.filter(d => d !== id); });
        render();
      });
    });
  }

  function showEdit(task) {
    const area = container.querySelector('.mps-gt-edit-area');
    area.innerHTML = `<div class="mps-gt-form">
      <strong style="color:var(--text-muted);font-size:12px">Edit #${task.id}</strong>
      <input class="mps-gt-input" name="title" value="${esc(task.title)}"/>
      <input class="mps-gt-input" type="date" name="start" value="${task.start}"/>
      <input class="mps-gt-input" type="date" name="end" value="${task.end}"/>
      <input class="mps-gt-input" type="number" name="progress" value="${task.progress}" min="0" max="100"/>
      <label class="mps-gt-chk"><input type="checkbox" name="milestone" ${task.milestone?'checked':''}/> Milestone</label>
      <input class="mps-gt-input" name="deps" value="${task.deps.join(',')}" placeholder="Dep IDs"/>
      <button class="mps-gt-btn mps-gt-btn-save">Save</button>
      <button class="mps-gt-btn mps-gt-btn-cancel">Cancel</button>
    </div>`;
    area.querySelector('.mps-gt-btn-save').addEventListener('click', () => {
      task.title = area.querySelector('[name=title]').value.trim() || task.title;
      task.start = area.querySelector('[name=start]').value || task.start;
      task.end = area.querySelector('[name=end]').value || task.end;
      task.progress = parseInt(area.querySelector('[name=progress]').value) || 0;
      task.milestone = area.querySelector('[name=milestone]').checked;
      task.deps = area.querySelector('[name=deps]').value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      render();
    });
    area.querySelector('.mps-gt-btn-cancel').addEventListener('click', () => { area.innerHTML = ''; });
  }

  function exportState() { return { tasks: JSON.parse(JSON.stringify(tasks)), nextId }; }
  function importState(state) {
    if (!state) return;
    tasks = state.tasks || tasks;
    nextId = state.nextId || nextId;
    render();
  }

  return { init, render, exportState, importState };
})();
