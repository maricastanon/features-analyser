/* ═══════════════════════════════════════════════
   FEATURE: Planner Board — Kanban bucket system
   Drag-drop tasks across buckets with priority
   colors, progress badges, labels, and avatars.
   ═══════════════════════════════════════════════ */
const FeatPlannerBoard = {
  buckets: [],
  dragData: null,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    const people = ['Alex M.','Sara K.','Chen W.','Eva J.','Bob L.','Kim P.'];
    const labels = ['Design','Backend','Frontend','Docs','Testing','DevOps'];
    const labelColors = {'Design':'#a855f7','Backend':'#3b82f6','Frontend':'#f97316','Docs':'#22c55e','Testing':'#ef4444','DevOps':'#eab308'};
    this.labelColors = labelColors;
    this.buckets = [
      { id:'todo', name:'To Do', tasks:[
        { id:1, title:'Design new dashboard layout', priority:'urgent', progress:'not-started', assignees:['Alex M.','Sara K.'], labels:['Design','Frontend'], dueDate:'2026-04-12' },
        { id:2, title:'Set up CI/CD pipeline', priority:'important', progress:'not-started', assignees:['Chen W.'], labels:['DevOps'], dueDate:'2026-04-15' },
        { id:3, title:'Write API documentation', priority:'medium', progress:'not-started', assignees:['Eva J.'], labels:['Docs'], dueDate:'2026-04-18' }
      ]},
      { id:'doing', name:'In Progress', tasks:[
        { id:4, title:'Implement authentication flow', priority:'urgent', progress:'in-progress', assignees:['Bob L.','Chen W.'], labels:['Backend','Frontend'], dueDate:'2026-04-10' },
        { id:5, title:'Create unit tests for API', priority:'important', progress:'in-progress', assignees:['Kim P.'], labels:['Testing','Backend'], dueDate:'2026-04-11' }
      ]},
      { id:'review', name:'In Review', tasks:[
        { id:6, title:'Update onboarding screens', priority:'medium', progress:'in-progress', assignees:['Alex M.'], labels:['Design'], dueDate:'2026-04-09' },
        { id:7, title:'Fix navigation bug on mobile', priority:'important', progress:'in-progress', assignees:['Sara K.'], labels:['Frontend','Testing'], dueDate:'2026-04-08' }
      ]},
      { id:'done', name:'Completed', tasks:[
        { id:8, title:'Database schema migration', priority:'urgent', progress:'completed', assignees:['Chen W.'], labels:['Backend','DevOps'], dueDate:'2026-04-05' },
        { id:9, title:'Logo redesign v2', priority:'low', progress:'completed', assignees:['Alex M.'], labels:['Design'], dueDate:'2026-04-03' }
      ]}
    ];
  },

  render() {
    const priColors = { urgent:'#ef4444', important:'#f97316', medium:'#eab308', low:'#22c55e' };
    const progBadge = { 'not-started':['Not Started','#5a8a60'], 'in-progress':['In Progress','#3b82f6'], 'completed':['Completed','#22c55e'] };

    this.container.innerHTML = `
    <div class="pb-wrap">
      <div class="pb-header">
        <h3 class="pb-title">Planner Board</h3>
        <span class="pb-subtitle">${this.buckets.reduce((s,b)=>s+b.tasks.length,0)} tasks across ${this.buckets.length} buckets</span>
        <button class="pb-btn pb-btn-pink" onclick="FeatPlannerBoard.addBucket()">+ Add Bucket</button>
      </div>
      <div class="pb-board">
        ${this.buckets.map(bucket => `
          <div class="pb-bucket" data-bucket="${bucket.id}"
            ondragover="event.preventDefault();this.classList.add('pb-drag-over')"
            ondragleave="this.classList.remove('pb-drag-over')"
            ondrop="FeatPlannerBoard._drop(event,'${bucket.id}');this.classList.remove('pb-drag-over')">
            <div class="pb-bucket-head">
              <span class="pb-bucket-name">${this._esc(bucket.name)}</span>
              <span class="pb-bucket-count">${bucket.tasks.length}</span>
              <button class="pb-add-task" onclick="FeatPlannerBoard.addTask('${bucket.id}')">+</button>
            </div>
            <div class="pb-task-list">
              ${bucket.tasks.map(t => {
                const [progLabel, progColor] = progBadge[t.progress];
                const priColor = priColors[t.priority];
                return `
                <div class="pb-card" draggable="true"
                  ondragstart="FeatPlannerBoard._dragStart(event,${t.id},'${bucket.id}')"
                  onclick="FeatPlannerBoard.cycleProgress(${t.id},'${bucket.id}')">
                  <div class="pb-card-pri" style="background:${priColor}"></div>
                  <div class="pb-card-labels">
                    ${t.labels.map(l => `<span class="pb-label" style="background:${this.labelColors[l]}22;color:${this.labelColors[l]}">${l}</span>`).join('')}
                  </div>
                  <div class="pb-card-title">${this._esc(t.title)}</div>
                  <div class="pb-card-meta">
                    <span class="pb-badge" style="color:${progColor}">${progLabel}</span>
                    <span class="pb-pri-tag" style="color:${priColor}">${t.priority}</span>
                  </div>
                  <div class="pb-card-footer">
                    <div class="pb-avatars">${t.assignees.map(a => `<span class="pb-avatar" title="${this._esc(a)}">${a.charAt(0)}</span>`).join('')}</div>
                    <span class="pb-due">${t.dueDate}</span>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
  },

  _dragStart(e, taskId, bucketId) {
    this.dragData = { taskId, bucketId };
    e.dataTransfer.effectAllowed = 'move';
  },

  _drop(e, targetBucketId) {
    e.preventDefault();
    if (!this.dragData) return;
    const { taskId, bucketId } = this.dragData;
    if (bucketId === targetBucketId) return;
    const srcBucket = this.buckets.find(b => b.id === bucketId);
    const tgtBucket = this.buckets.find(b => b.id === targetBucketId);
    const idx = srcBucket.tasks.findIndex(t => t.id === taskId);
    if (idx < 0) return;
    const [task] = srcBucket.tasks.splice(idx, 1);
    tgtBucket.tasks.push(task);
    this.dragData = null;
    this.render();
  },

  cycleProgress(taskId, bucketId) {
    const bucket = this.buckets.find(b => b.id === bucketId);
    const task = bucket.tasks.find(t => t.id === taskId);
    const cycle = ['not-started','in-progress','completed'];
    task.progress = cycle[(cycle.indexOf(task.progress) + 1) % 3];
    this.render();
  },

  addTask(bucketId) {
    const title = prompt('Task title:');
    if (!title?.trim()) return;
    const bucket = this.buckets.find(b => b.id === bucketId);
    bucket.tasks.push({ id: Date.now(), title: title.trim(), priority:'medium', progress:'not-started', assignees:['You'], labels:['Frontend'], dueDate:'2026-04-20' });
    this.render();
  },

  addBucket() {
    const name = prompt('Bucket name:');
    if (!name?.trim()) return;
    this.buckets.push({ id: 'b' + Date.now(), name: name.trim(), tasks: [] });
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { buckets: this.buckets }; },
  importState(s) { if (s.buckets) this.buckets = s.buckets; this.render(); }
};
