const MsPlannerScheduleCalendar = (() => {
  let container, currentDate, viewYear, viewMonth, tasks = [];
  const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  const fmtKey = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const PRIORITIES = { high: 'var(--accent-pink)', medium: '#e8a735', low: 'var(--accent-green)' };

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) return;
    currentDate = new Date();
    viewYear = currentDate.getFullYear();
    viewMonth = currentDate.getMonth();
    tasks = [
      { id: 1, title: 'Design review', date: fmtKey(viewYear, viewMonth, 10), priority: 'high' },
      { id: 2, title: 'Sprint planning', date: fmtKey(viewYear, viewMonth, 15), priority: 'medium' },
      { id: 3, title: 'Deploy v2.1', date: fmtKey(viewYear, viewMonth, 22), priority: 'low' },
    ];
    render();
  }

  function render() {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayKey = fmtKey(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const tasksByDate = {};
    tasks.forEach(t => { (tasksByDate[t.date] = tasksByDate[t.date] || []).push(t); });

    let html = `<div class="mps-cal-wrapper">
      <div class="mps-cal-header">
        <button class="mps-cal-nav" data-dir="-1">&larr;</button>
        <span class="mps-cal-title">${monthNames[viewMonth]} ${viewYear}</span>
        <button class="mps-cal-nav" data-dir="1">&rarr;</button>
      </div>
      <div class="mps-cal-grid">`;
    dayNames.forEach(d => { html += `<div class="mps-cal-dayname">${d}</div>`; });

    let cellCount = 0;
    for (let i = 0; i < firstDay; i++) { html += `<div class="mps-cal-cell mps-cal-empty"></div>`; cellCount++; }
    for (let d = 1; d <= daysInMonth; d++) {
      const key = fmtKey(viewYear, viewMonth, d);
      const isToday = key === todayKey;
      const isOverdue = key < todayKey;
      const cls = ['mps-cal-cell', isToday ? 'mps-cal-today' : '', isOverdue ? 'mps-cal-overdue' : ''].filter(Boolean).join(' ');
      html += `<div class="${cls}" data-date="${key}"><span class="mps-cal-daynum">${d}</span>`;
      (tasksByDate[key] || []).forEach(t => {
        html += `<span class="mps-cal-pill" data-id="${t.id}" style="background:${PRIORITIES[t.priority] || PRIORITIES.low}">${esc(t.title)}</span>`;
      });
      html += `</div>`;
      cellCount++;
    }
    while (cellCount % 7 !== 0) { html += `<div class="mps-cal-cell mps-cal-empty"></div>`; cellCount++; }
    html += `</div><div class="mps-cal-form-area"></div></div>`;
    container.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    container.querySelectorAll('.mps-cal-nav').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = parseInt(btn.dataset.dir);
        viewMonth += dir;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        render();
      });
    });
    container.querySelectorAll('.mps-cal-cell:not(.mps-cal-empty)').forEach(cell => {
      cell.addEventListener('click', e => {
        if (e.target.classList.contains('mps-cal-pill')) return;
        showForm(null, cell.dataset.date);
      });
    });
    container.querySelectorAll('.mps-cal-pill').forEach(pill => {
      pill.addEventListener('click', e => {
        e.stopPropagation();
        const task = tasks.find(t => t.id === parseInt(pill.dataset.id));
        if (task) showForm(task);
      });
    });
  }

  function showForm(task, date) {
    const area = container.querySelector('.mps-cal-form-area');
    const isEdit = !!task;
    const t = task || { title: '', date: date || '', priority: 'medium' };
    area.innerHTML = `<div class="mps-cal-form">
      <input class="mps-cal-input" name="title" placeholder="Task title" value="${esc(t.title)}"/>
      <input class="mps-cal-input" type="date" name="date" value="${t.date}"/>
      <select class="mps-cal-input" name="priority">
        <option value="high" ${t.priority==='high'?'selected':''}>High</option>
        <option value="medium" ${t.priority==='medium'?'selected':''}>Medium</option>
        <option value="low" ${t.priority==='low'?'selected':''}>Low</option>
      </select>
      <div class="mps-cal-form-actions">
        <button class="mps-cal-btn mps-cal-btn-save">Save</button>
        ${isEdit ? '<button class="mps-cal-btn mps-cal-btn-del">Delete</button>' : ''}
        <button class="mps-cal-btn mps-cal-btn-cancel">Cancel</button>
      </div>
    </div>`;
    area.querySelector('.mps-cal-btn-save').addEventListener('click', () => {
      const title = area.querySelector('[name=title]').value.trim();
      const dt = area.querySelector('[name=date]').value;
      const pri = area.querySelector('[name=priority]').value;
      if (!title || !dt) return;
      if (isEdit) { task.title = title; task.date = dt; task.priority = pri; }
      else { tasks.push({ id: Date.now(), title, date: dt, priority: pri }); }
      render();
    });
    if (isEdit) {
      area.querySelector('.mps-cal-btn-del').addEventListener('click', () => {
        tasks = tasks.filter(x => x.id !== task.id);
        render();
      });
    }
    area.querySelector('.mps-cal-btn-cancel').addEventListener('click', () => { area.innerHTML = ''; });
  }

  function exportState() { return { viewYear, viewMonth, tasks: JSON.parse(JSON.stringify(tasks)) }; }
  function importState(state) {
    if (!state) return;
    viewYear = state.viewYear ?? viewYear;
    viewMonth = state.viewMonth ?? viewMonth;
    tasks = state.tasks || tasks;
    render();
  }

  return { init, render, exportState, importState };
})();
