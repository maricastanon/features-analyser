/* ═══════════════════════════════════════════════
   FEATURE: Planner Charts — Analytics Dashboard
   SVG/CSS charts for task status, priority,
   bucket distribution, assignee workload, overdue.
   ═══════════════════════════════════════════════ */
const FeatPlannerCharts = {
  data: null,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.data = {
      byStatus: { 'Not Started': 12, 'In Progress': 8, 'Completed': 15 },
      byPriority: { Urgent: 5, Important: 10, Medium: 12, Low: 8 },
      byBucket: { Design: 6, Backend: 9, Frontend: 7, Testing: 5, DevOps: 4, Docs: 4 },
      byAssignee: { 'Alex M.': 7, 'Chen W.': 8, 'Sara K.': 6, 'Bob L.': 5, 'Eva J.': 4, 'Kim P.': 5 },
      overdue: 4,
      totalTasks: 35
    };
  },

  render() {
    const d = this.data;
    const statusColors = { 'Not Started':'#5a8a60', 'In Progress':'#3b82f6', 'Completed':'#22c55e' };
    const priColors = { Urgent:'#ef4444', Important:'#f97316', Medium:'#eab308', Low:'#22c55e' };
    const total = Object.values(d.byStatus).reduce((a,b)=>a+b,0);

    // Donut chart segments
    let cumPct = 0;
    const donutSegs = Object.entries(d.byStatus).map(([k,v]) => {
      const pct = (v / total) * 100;
      const seg = { label: k, value: v, pct, offset: cumPct, color: statusColors[k] };
      cumPct += pct;
      return seg;
    });

    const maxBucket = Math.max(...Object.values(d.byBucket));
    const maxAssignee = Math.max(...Object.values(d.byAssignee));

    this.container.innerHTML = `
    <div class="pc-wrap">
      <div class="pc-header">
        <h3 class="pc-title">Charts Dashboard</h3>
        <span class="pc-subtitle">${d.totalTasks} total tasks</span>
        ${d.overdue > 0 ? `<span class="pc-overdue-alert">${d.overdue} overdue</span>` : ''}
      </div>
      <div class="pc-grid">
        <!-- Donut: Tasks by Status -->
        <div class="pc-card">
          <div class="pc-card-title">Tasks by Status</div>
          <div class="pc-donut-wrap">
            <svg class="pc-donut" viewBox="0 0 36 36">
              ${donutSegs.map(s => `<circle class="pc-donut-seg" cx="18" cy="18" r="15.9" fill="none"
                stroke="${s.color}" stroke-width="4"
                stroke-dasharray="${s.pct} ${100-s.pct}"
                stroke-dashoffset="${-s.offset}"
                transform="rotate(-90 18 18)"/>`).join('')}
              <text x="18" y="18.5" text-anchor="middle" fill="#e8f5e9" font-size="5" font-weight="700">${total}</text>
              <text x="18" y="22" text-anchor="middle" fill="#5a8a60" font-size="2.5">tasks</text>
            </svg>
            <div class="pc-legend">
              ${donutSegs.map(s => `<div class="pc-legend-item"><span class="pc-legend-dot" style="background:${s.color}"></span>${s.label}: ${s.value}</div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Bar: Tasks by Priority -->
        <div class="pc-card">
          <div class="pc-card-title">Tasks by Priority</div>
          <div class="pc-bars">
            ${Object.entries(d.byPriority).map(([k,v]) => `
              <div class="pc-bar-row">
                <span class="pc-bar-label">${k}</span>
                <div class="pc-bar-track"><div class="pc-bar-fill" style="width:${(v/Math.max(...Object.values(d.byPriority)))*100}%;background:${priColors[k]}"></div></div>
                <span class="pc-bar-val">${v}</span>
              </div>`).join('')}
          </div>
        </div>

        <!-- Bar: Tasks by Bucket -->
        <div class="pc-card">
          <div class="pc-card-title">Tasks by Bucket</div>
          <div class="pc-bars">
            ${Object.entries(d.byBucket).map(([k,v]) => `
              <div class="pc-bar-row">
                <span class="pc-bar-label">${k}</span>
                <div class="pc-bar-track"><div class="pc-bar-fill" style="width:${(v/maxBucket)*100}%;background:#e91e90"></div></div>
                <span class="pc-bar-val">${v}</span>
              </div>`).join('')}
          </div>
        </div>

        <!-- Horizontal Bar: Tasks by Assignee -->
        <div class="pc-card">
          <div class="pc-card-title">Tasks by Assignee</div>
          <div class="pc-bars">
            ${Object.entries(d.byAssignee).map(([k,v]) => `
              <div class="pc-bar-row">
                <span class="pc-bar-label">${this._esc(k)}</span>
                <div class="pc-bar-track"><div class="pc-bar-fill" style="width:${(v/maxAssignee)*100}%;background:#22c55e"></div></div>
                <span class="pc-bar-val">${v}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { data: this.data }; },
  importState(s) { if (s.data) this.data = s.data; this.render(); }
};
