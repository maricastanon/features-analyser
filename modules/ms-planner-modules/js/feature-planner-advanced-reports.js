/* ═══════════════════════════════════════════════
   FEATURE: Planner Advanced Reports — Custom dashboard
   Widgets: completion rate, avg task age, blocked,
   velocity, SLA compliance. Configurable layout.
   ═══════════════════════════════════════════════ */
const FeatPlannerAdvancedReports = {
  widgets: [],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.widgets = [
      { id:1, type:'completion-trend', title:'Completion Rate Trend', visible:true,
        data:{ weeks:['W1','W2','W3','W4','W5','W6'], rates:[62,68,71,75,82,78] } },
      { id:2, type:'task-age', title:'Average Task Age', visible:true,
        data:{ avgDays:4.2, distribution:{ '0-1 day':8, '2-3 days':12, '4-7 days':6, '7+ days':3 } } },
      { id:3, type:'blocked', title:'Blocked Tasks', visible:true,
        data:{ count:4, tasks:[
          { name:'SSO integration', blocker:'Waiting on vendor API key', days:5 },
          { name:'Payment gateway', blocker:'Legal approval pending', days:3 },
          { name:'Data migration', blocker:'Schema not finalized', days:2 },
          { name:'Load testing', blocker:'Staging env down', days:1 }
        ]}},
      { id:4, type:'velocity', title:'Team Velocity', visible:true,
        data:{ sprints:['S8','S9','S10','S11','S12'], points:[22,25,28,26,30], target:27 } },
      { id:5, type:'sla', title:'SLA Compliance', visible:true,
        data:{ overall:87, categories:[
          { name:'Critical bugs', sla:'4h response', compliance:92, color:'#ef4444' },
          { name:'Feature requests', sla:'48h triage', compliance:85, color:'#3b82f6' },
          { name:'Customer tasks', sla:'24h update', compliance:78, color:'#f97316' },
          { name:'Internal tasks', sla:'1 week', compliance:94, color:'#22c55e' }
        ]}},
      { id:6, type:'cycle-time', title:'Cycle Time', visible:true,
        data:{ avgHours:38, stages:[
          { name:'To Do', hours:12 },
          { name:'In Progress', hours:16 },
          { name:'Review', hours:6 },
          { name:'Done', hours:4 }
        ]}}
    ];
  },

  render() {
    const visible = this.widgets.filter(w => w.visible);

    this.container.innerHTML = `
    <div class="par-wrap">
      <div class="par-header">
        <h3 class="par-title">Advanced Reports</h3>
        <span class="par-missing-badge">MISSING FROM PLANNER</span>
        <button class="par-btn par-btn-outline" onclick="FeatPlannerAdvancedReports.configWidgets()">Configure Widgets</button>
      </div>
      <div class="par-grid">
        ${visible.map(w => `<div class="par-widget">${this._renderWidget(w)}</div>`).join('')}
      </div>
    </div>`;
  },

  _renderWidget(w) {
    switch (w.type) {
      case 'completion-trend': {
        const d = w.data;
        const max = Math.max(...d.rates);
        return `
          <div class="par-w-head"><span class="par-w-title">${w.title}</span><button class="par-w-hide" onclick="FeatPlannerAdvancedReports.toggleWidget(${w.id})">x</button></div>
          <div class="par-trend-chart">
            ${d.weeks.map((wk, i) => `
              <div class="par-trend-col">
                <div class="par-trend-bar" style="height:${(d.rates[i]/100)*100}%">
                  <span class="par-trend-val">${d.rates[i]}%</span>
                </div>
                <span class="par-trend-label">${wk}</span>
              </div>`).join('')}
          </div>`;
      }
      case 'task-age': {
        const d = w.data;
        const maxDist = Math.max(...Object.values(d.distribution));
        return `
          <div class="par-w-head"><span class="par-w-title">${w.title}</span><button class="par-w-hide" onclick="FeatPlannerAdvancedReports.toggleWidget(${w.id})">x</button></div>
          <div class="par-age-big">${d.avgDays} days</div>
          <div class="par-age-dist">
            ${Object.entries(d.distribution).map(([k,v]) => `
              <div class="par-age-row">
                <span class="par-age-label">${k}</span>
                <div class="par-age-bar"><div class="par-age-fill" style="width:${(v/maxDist)*100}%"></div></div>
                <span class="par-age-num">${v}</span>
              </div>`).join('')}
          </div>`;
      }
      case 'blocked': {
        const d = w.data;
        return `
          <div class="par-w-head"><span class="par-w-title">${w.title}</span><span class="par-blocked-count">${d.count}</span><button class="par-w-hide" onclick="FeatPlannerAdvancedReports.toggleWidget(${w.id})">x</button></div>
          <div class="par-blocked-list">
            ${d.tasks.map(t => `
              <div class="par-blocked-item">
                <div class="par-blocked-name">${this._esc(t.name)}</div>
                <div class="par-blocked-reason">${this._esc(t.blocker)}</div>
                <span class="par-blocked-days">${t.days}d blocked</span>
              </div>`).join('')}
          </div>`;
      }
      case 'velocity': {
        const d = w.data;
        const max = Math.max(...d.points, d.target);
        return `
          <div class="par-w-head"><span class="par-w-title">${w.title}</span><button class="par-w-hide" onclick="FeatPlannerAdvancedReports.toggleWidget(${w.id})">x</button></div>
          <div class="par-vel-chart">
            ${d.sprints.map((s,i) => `
              <div class="par-vel-col">
                <div class="par-vel-bar" style="height:${(d.points[i]/max)*100}%;background:${d.points[i]>=d.target?'#22c55e':'#f97316'}">
                  <span class="par-vel-val">${d.points[i]}</span>
                </div>
                <span class="par-vel-label">${s}</span>
              </div>`).join('')}
          </div>
          <div class="par-vel-target">Target: ${d.target} pts/sprint</div>`;
      }
      case 'sla': {
        const d = w.data;
        return `
          <div class="par-w-head"><span class="par-w-title">${w.title}</span><button class="par-w-hide" onclick="FeatPlannerAdvancedReports.toggleWidget(${w.id})">x</button></div>
          <div class="par-sla-big">${d.overall}%<span class="par-sla-sub">overall</span></div>
          <div class="par-sla-list">
            ${d.categories.map(c => `
              <div class="par-sla-row">
                <span class="par-sla-name">${c.name}</span>
                <div class="par-sla-bar"><div class="par-sla-fill" style="width:${c.compliance}%;background:${c.color}"></div></div>
                <span class="par-sla-pct" style="color:${c.compliance<80?'#ef4444':'#22c55e'}">${c.compliance}%</span>
              </div>`).join('')}
          </div>`;
      }
      case 'cycle-time': {
        const d = w.data;
        const maxH = Math.max(...d.stages.map(s => s.hours));
        return `
          <div class="par-w-head"><span class="par-w-title">${w.title}</span><button class="par-w-hide" onclick="FeatPlannerAdvancedReports.toggleWidget(${w.id})">x</button></div>
          <div class="par-ct-big">${d.avgHours}h<span class="par-ct-sub">average</span></div>
          <div class="par-ct-stages">
            ${d.stages.map(s => `
              <div class="par-ct-stage">
                <span class="par-ct-name">${s.name}</span>
                <div class="par-ct-bar"><div class="par-ct-fill" style="width:${(s.hours/maxH)*100}%"></div></div>
                <span class="par-ct-hrs">${s.hours}h</span>
              </div>`).join('')}
          </div>`;
      }
      default: return `<div class="par-w-head"><span class="par-w-title">${w.title}</span></div><div>Unknown widget</div>`;
    }
  },

  toggleWidget(id) {
    const w = this.widgets.find(x => x.id === id);
    if (w) w.visible = !w.visible;
    this.render();
  },

  configWidgets() {
    const list = this.widgets.map(w => `${w.visible?'[x]':'[ ]'} ${w.title}`).join('\n');
    const toggle = prompt('Toggle widget (enter title):\n' + list);
    if (!toggle) return;
    const w = this.widgets.find(x => x.title.toLowerCase().includes(toggle.toLowerCase()));
    if (w) { w.visible = !w.visible; this.render(); }
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { widgets: this.widgets }; },
  importState(s) { if (s.widgets) this.widgets = s.widgets; this.render(); }
};
