/* ═══════════════════════════════════════════════
   FEATURE: Planner Custom Statuses — Workflow states
   Custom columns beyond the default three, custom
   colors, emoji, task count, drag to reorder.
   ═══════════════════════════════════════════════ */
const FeatPlannerCustomStatuses = {
  statuses: [],
  tasks: [],
  dragData: null,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.statuses = [
      { id:1, name:'Backlog', emoji:'📋', color:'#5a8a60' },
      { id:2, name:'Ready for Dev', emoji:'🚀', color:'#3b82f6' },
      { id:3, name:'In Development', emoji:'💻', color:'#f97316' },
      { id:4, name:'Code Review', emoji:'🔍', color:'#a855f7' },
      { id:5, name:'QA Testing', emoji:'🧪', color:'#eab308' },
      { id:6, name:'Staging', emoji:'🎭', color:'#e91e90' },
      { id:7, name:'Deployed', emoji:'✅', color:'#22c55e' },
      { id:8, name:'Blocked', emoji:'🚫', color:'#ef4444' }
    ];
    this.tasks = [
      { id:1, title:'Implement OAuth2 login', statusId:3 },
      { id:2, title:'Design settings page', statusId:1 },
      { id:3, title:'API rate limiting', statusId:2 },
      { id:4, title:'Fix memory leak in worker', statusId:4 },
      { id:5, title:'Add export CSV feature', statusId:1 },
      { id:6, title:'Upgrade Node.js to v20', statusId:5 },
      { id:7, title:'Refactor user service', statusId:3 },
      { id:8, title:'E2E tests for checkout', statusId:5 },
      { id:9, title:'Deploy monitoring stack', statusId:6 },
      { id:10, title:'Update privacy policy page', statusId:7 },
      { id:11, title:'SSO integration', statusId:8 },
      { id:12, title:'Cache invalidation fix', statusId:4 },
      { id:13, title:'Dark mode toggle', statusId:7 },
      { id:14, title:'Webhook retry logic', statusId:2 },
      { id:15, title:'Search indexing optimization', statusId:3 }
    ];
  },

  render() {
    this.container.innerHTML = `
    <div class="pcs-wrap">
      <div class="pcs-header">
        <h3 class="pcs-title">Custom Statuses</h3>
        <span class="pcs-missing-badge">MISSING FROM PLANNER</span>
        <span class="pcs-subtitle">${this.statuses.length} statuses &middot; ${this.tasks.length} tasks</span>
        <button class="pcs-btn pcs-btn-pink" onclick="FeatPlannerCustomStatuses.addStatus()">+ Add Status</button>
      </div>
      <div class="pcs-board">
        ${this.statuses.map(st => {
          const stTasks = this.tasks.filter(t => t.statusId === st.id);
          return `
          <div class="pcs-column" data-status="${st.id}"
            ondragover="event.preventDefault();this.classList.add('pcs-col-hover')"
            ondragleave="this.classList.remove('pcs-col-hover')"
            ondrop="FeatPlannerCustomStatuses._drop(event,${st.id});this.classList.remove('pcs-col-hover')">
            <div class="pcs-col-head" style="border-bottom:2px solid ${st.color}">
              <span class="pcs-col-emoji">${st.emoji}</span>
              <span class="pcs-col-name">${this._esc(st.name)}</span>
              <span class="pcs-col-count" style="background:${st.color}22;color:${st.color}">${stTasks.length}</span>
              <button class="pcs-col-edit" onclick="FeatPlannerCustomStatuses.editStatus(${st.id})">&#9998;</button>
            </div>
            <div class="pcs-task-list">
              ${stTasks.map(t => `
                <div class="pcs-task" draggable="true"
                  ondragstart="FeatPlannerCustomStatuses._dragStart(event,${t.id})"
                  style="border-left:3px solid ${st.color}">
                  <span class="pcs-task-title">${this._esc(t.title)}</span>
                </div>`).join('')}
            </div>
            <button class="pcs-add-task" onclick="FeatPlannerCustomStatuses.addTask(${st.id})">+ Add task</button>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  _dragStart(e, taskId) {
    this.dragData = taskId;
    e.dataTransfer.effectAllowed = 'move';
  },

  _drop(e, statusId) {
    e.preventDefault();
    if (!this.dragData) return;
    const task = this.tasks.find(t => t.id === this.dragData);
    if (task) task.statusId = statusId;
    this.dragData = null;
    this.render();
  },

  addStatus() {
    const name = prompt('Status name:');
    if (!name?.trim()) return;
    const emoji = prompt('Emoji:', '📌') || '📌';
    this.statuses.push({ id: Date.now(), name: name.trim(), emoji, color: '#e91e90' });
    this.render();
  },

  editStatus(id) {
    const st = this.statuses.find(s => s.id === id);
    const name = prompt('Edit status name:', st.name);
    if (name !== null && name.trim()) st.name = name.trim();
    const emoji = prompt('Edit emoji:', st.emoji);
    if (emoji !== null) st.emoji = emoji || st.emoji;
    this.render();
  },

  addTask(statusId) {
    const title = prompt('Task title:');
    if (!title?.trim()) return;
    this.tasks.push({ id: Date.now(), title: title.trim(), statusId });
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { statuses: this.statuses, tasks: this.tasks }; },
  importState(s) { if (s.statuses) this.statuses = s.statuses; if (s.tasks) this.tasks = s.tasks; this.render(); }
};
