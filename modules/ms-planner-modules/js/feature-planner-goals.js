/* ═══════════════════════════════════════════════
   FEATURE: Planner Goals — OKR tracking
   Goal cards with progress, linked tasks, status,
   key results with measurable targets.
   ═══════════════════════════════════════════════ */
const FeatPlannerGoals = {
  goals: [],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.goals = [
      { id:1, title:'Launch v2.0 Platform', owner:'Alex M.', status:'on-track', progress:72, linkedTasks:18,
        keyResults:[
          { id:1, text:'Complete all critical features', target:12, current:9, unit:'features' },
          { id:2, text:'Pass security audit', target:100, current:85, unit:'%' },
          { id:3, text:'Achieve < 200ms p95 latency', target:200, current:180, unit:'ms' }
        ]},
      { id:2, title:'Improve Customer Retention', owner:'Sara K.', status:'at-risk', progress:45, linkedTasks:12,
        keyResults:[
          { id:4, text:'Reduce churn rate to < 5%', target:5, current:7.2, unit:'%' },
          { id:5, text:'Increase NPS score', target:50, current:38, unit:'pts' },
          { id:6, text:'Launch loyalty program', target:1, current:0, unit:'shipped' }
        ]},
      { id:3, title:'Scale Engineering Team', owner:'Chen W.', status:'on-track', progress:60, linkedTasks:8,
        keyResults:[
          { id:7, text:'Hire 5 senior engineers', target:5, current:3, unit:'hires' },
          { id:8, text:'Establish code review SLA', target:24, current:24, unit:'hrs' },
          { id:9, text:'Reduce onboarding time', target:2, current:3, unit:'weeks' }
        ]},
      { id:4, title:'Zero Downtime Operations', owner:'Bob L.', status:'behind', progress:28, linkedTasks:15,
        keyResults:[
          { id:10, text:'Achieve 99.99% uptime', target:99.99, current:99.2, unit:'%' },
          { id:11, text:'Automate all deployments', target:100, current:40, unit:'%' },
          { id:12, text:'Mean time to recovery < 5min', target:5, current:18, unit:'min' }
        ]}
    ];
  },

  render() {
    const statusConfig = { 'on-track':['On Track','#22c55e'], 'at-risk':['At Risk','#f97316'], 'behind':['Behind','#ef4444'] };

    this.container.innerHTML = `
    <div class="pgl-wrap">
      <div class="pgl-header">
        <h3 class="pgl-title">Goals & OKRs</h3>
        <span class="pgl-subtitle">${this.goals.length} goals tracked</span>
        <button class="pgl-btn pgl-btn-pink" onclick="FeatPlannerGoals.addGoal()">+ New Goal</button>
      </div>
      <div class="pgl-grid">
        ${this.goals.map(g => {
          const [statusLabel, statusColor] = statusConfig[g.status];
          return `
          <div class="pgl-card">
            <div class="pgl-card-top">
              <div>
                <div class="pgl-card-title">${this._esc(g.title)}</div>
                <span class="pgl-card-owner">${this._esc(g.owner)}</span>
              </div>
              <span class="pgl-status" style="background:${statusColor}22;color:${statusColor}" onclick="FeatPlannerGoals.cycleStatus(${g.id})">${statusLabel}</span>
            </div>
            <div class="pgl-progress-bar">
              <div class="pgl-progress-fill" style="width:${g.progress}%;background:${statusColor}"></div>
            </div>
            <div class="pgl-progress-meta">
              <span>${g.progress}% complete</span>
              <span>${g.linkedTasks} linked tasks</span>
            </div>
            <div class="pgl-kr-list">
              <div class="pgl-kr-title">Key Results</div>
              ${g.keyResults.map(kr => {
                const krPct = Math.min(100, Math.round((kr.current / kr.target) * 100));
                return `
                <div class="pgl-kr">
                  <div class="pgl-kr-text">${this._esc(kr.text)}</div>
                  <div class="pgl-kr-bar-row">
                    <div class="pgl-kr-bar"><div class="pgl-kr-fill" style="width:${krPct}%"></div></div>
                    <span class="pgl-kr-val">${kr.current}/${kr.target} ${kr.unit}</span>
                  </div>
                </div>`;
              }).join('')}
            </div>
            <button class="pgl-update-btn" onclick="FeatPlannerGoals.updateProgress(${g.id})">Update Progress</button>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  cycleStatus(id) {
    const g = this.goals.find(x => x.id === id);
    const cycle = ['on-track','at-risk','behind'];
    g.status = cycle[(cycle.indexOf(g.status) + 1) % 3];
    this.render();
  },

  updateProgress(id) {
    const g = this.goals.find(x => x.id === id);
    const val = prompt('Update progress (0-100):', g.progress);
    if (val !== null && !isNaN(val)) { g.progress = Math.max(0, Math.min(100, parseInt(val))); this.render(); }
  },

  addGoal() {
    const title = prompt('Goal title:');
    if (!title?.trim()) return;
    this.goals.push({ id: Date.now(), title: title.trim(), owner: 'You', status: 'on-track', progress: 0, linkedTasks: 0,
      keyResults: [{ id: Date.now(), text: 'Define key result', target: 100, current: 0, unit: '%' }]
    });
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { goals: this.goals }; },
  importState(s) { if (s.goals) this.goals = s.goals; this.render(); }
};
