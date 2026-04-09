/* ═══════════════════════════════════════════════
   FEATURE: Planner Grid — Spreadsheet task view
   Sortable columns, inline editing, bulk select.
   ═══════════════════════════════════════════════ */
const FeatPlannerGrid = {
  tasks: [],
  sortCol: 'task',
  sortDir: 'asc',
  selected: new Set(),
  editingCell: null,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.tasks = [
      { id:1, task:'Design dashboard wireframes', assignee:'Alex M.', priority:'urgent', dueDate:'2026-04-12', progress:'in-progress', bucket:'Design' },
      { id:2, task:'Implement REST API endpoints', assignee:'Chen W.', priority:'important', dueDate:'2026-04-14', progress:'not-started', bucket:'Backend' },
      { id:3, task:'Write integration tests', assignee:'Kim P.', priority:'medium', dueDate:'2026-04-16', progress:'not-started', bucket:'Testing' },
      { id:4, task:'Set up monitoring alerts', assignee:'Bob L.', priority:'low', dueDate:'2026-04-18', progress:'completed', bucket:'DevOps' },
      { id:5, task:'Create user onboarding flow', assignee:'Sara K.', priority:'urgent', dueDate:'2026-04-10', progress:'in-progress', bucket:'Frontend' },
      { id:6, task:'Database query optimization', assignee:'Chen W.', priority:'important', dueDate:'2026-04-11', progress:'in-progress', bucket:'Backend' },
      { id:7, task:'Accessibility audit', assignee:'Eva J.', priority:'medium', dueDate:'2026-04-20', progress:'not-started', bucket:'Testing' },
      { id:8, task:'Deploy staging environment', assignee:'Bob L.', priority:'important', dueDate:'2026-04-09', progress:'completed', bucket:'DevOps' },
      { id:9, task:'Design icon set v2', assignee:'Alex M.', priority:'low', dueDate:'2026-04-22', progress:'not-started', bucket:'Design' },
      { id:10, task:'Fix login redirect loop', assignee:'Sara K.', priority:'urgent', dueDate:'2026-04-08', progress:'completed', bucket:'Frontend' }
    ];
  },

  render() {
    const priColors = { urgent:'#ef4444', important:'#f97316', medium:'#eab308', low:'#22c55e' };
    const progColors = { 'not-started':'#5a8a60', 'in-progress':'#3b82f6', completed:'#22c55e' };
    const cols = ['task','assignee','priority','dueDate','progress','bucket'];
    const colLabels = { task:'Task', assignee:'Assignee', priority:'Priority', dueDate:'Due Date', progress:'Progress', bucket:'Bucket' };

    let sorted = [...this.tasks];
    sorted.sort((a,b) => {
      let va = a[this.sortCol], vb = b[this.sortCol];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return this.sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

    const allSel = this.selected.size === this.tasks.length;
    this.container.innerHTML = `
    <div class="pg-wrap">
      <div class="pg-header">
        <h3 class="pg-title">Grid View</h3>
        <span class="pg-subtitle">${this.tasks.length} tasks${this.selected.size ? ` • ${this.selected.size} selected` : ''}</span>
        ${this.selected.size ? `<button class="pg-btn pg-btn-red" onclick="FeatPlannerGrid.bulkDelete()">Delete Selected</button>` : ''}
        <button class="pg-btn pg-btn-pink" onclick="FeatPlannerGrid.addTask()">+ Add Task</button>
      </div>
      <div class="pg-table-wrap">
        <table class="pg-table">
          <thead>
            <tr>
              <th class="pg-th-check"><input type="checkbox" ${allSel?'checked':''} onchange="FeatPlannerGrid.toggleAll(this.checked)"></th>
              ${cols.map(c => `
                <th class="pg-th" onclick="FeatPlannerGrid.sort('${c}')">
                  ${colLabels[c]}
                  ${this.sortCol===c ? (this.sortDir==='asc'?'&#9650;':'&#9660;') : ''}
                </th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${sorted.map(t => `
              <tr class="pg-row ${this.selected.has(t.id)?'pg-row-sel':''}">
                <td class="pg-td-check"><input type="checkbox" ${this.selected.has(t.id)?'checked':''} onchange="FeatPlannerGrid.toggleSel(${t.id},this.checked)"></td>
                <td class="pg-td pg-td-task" onclick="FeatPlannerGrid.editCell(${t.id},'task')">${this._esc(t.task)}</td>
                <td class="pg-td" onclick="FeatPlannerGrid.editCell(${t.id},'assignee')">${this._esc(t.assignee)}</td>
                <td class="pg-td"><span class="pg-pri" style="color:${priColors[t.priority]}" onclick="FeatPlannerGrid.cyclePri(${t.id})">${t.priority}</span></td>
                <td class="pg-td">${t.dueDate}</td>
                <td class="pg-td"><span class="pg-prog" style="color:${progColors[t.progress]}" onclick="FeatPlannerGrid.cycleProg(${t.id})">${t.progress.replace('-',' ')}</span></td>
                <td class="pg-td">${this._esc(t.bucket)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  sort(col) {
    if (this.sortCol === col) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else { this.sortCol = col; this.sortDir = 'asc'; }
    this.render();
  },

  toggleSel(id, checked) { checked ? this.selected.add(id) : this.selected.delete(id); this.render(); },
  toggleAll(checked) { this.tasks.forEach(t => checked ? this.selected.add(t.id) : this.selected.delete(t.id)); this.render(); },

  bulkDelete() {
    if (!confirm(`Delete ${this.selected.size} tasks?`)) return;
    this.tasks = this.tasks.filter(t => !this.selected.has(t.id));
    this.selected.clear();
    this.render();
  },

  cyclePri(id) {
    const t = this.tasks.find(x => x.id === id);
    const cycle = ['low','medium','important','urgent'];
    t.priority = cycle[(cycle.indexOf(t.priority) + 1) % 4];
    this.render();
  },

  cycleProg(id) {
    const t = this.tasks.find(x => x.id === id);
    const cycle = ['not-started','in-progress','completed'];
    t.progress = cycle[(cycle.indexOf(t.progress) + 1) % 3];
    this.render();
  },

  editCell(id, field) {
    const t = this.tasks.find(x => x.id === id);
    const val = prompt(`Edit ${field}:`, t[field]);
    if (val !== null && val.trim()) { t[field] = val.trim(); this.render(); }
  },

  addTask() {
    const task = prompt('Task name:');
    if (!task?.trim()) return;
    this.tasks.push({ id:Date.now(), task:task.trim(), assignee:'Unassigned', priority:'medium', dueDate:'2026-04-20', progress:'not-started', bucket:'Backlog' });
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { tasks: this.tasks, sortCol: this.sortCol, sortDir: this.sortDir }; },
  importState(s) { if (s.tasks) this.tasks = s.tasks; if (s.sortCol) this.sortCol = s.sortCol; if (s.sortDir) this.sortDir = s.sortDir; this.render(); }
};
