/* ═══════════════════════════════════════════════
   MS PLANNER: Change Analytics — JS Module
   Bar chart (changes/day), most active editors,
   most changed tasks, change type breakdown (donut),
   busiest hour heatmap, summary stats
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerChangeAnalytics = {
  container: null,
  changes: [],

  _types: ['created', 'edited', 'completed', 'deleted'],
  _typeColors: { created: '#22c55e', edited: '#ec4899', completed: '#3b82f6', deleted: '#ef4444' },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    if (!this.changes.length) this._seedChanges();
    this.render();
  },

  _seedChanges() {
    const now = Date.now();
    const h = 3600000;
    const day = 86400000;
    const members = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'];
    const tasks = ['T-001', 'T-002', 'T-003', 'T-004', 'T-005', 'T-006', 'T-007', 'T-008'];
    const types = this._types;
    const entries = [];
    for (let d = 0; d < 7; d++) {
      const count = 3 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        const hourOffset = Math.floor(Math.random() * 12) + 8;
        entries.push({
          member: members[Math.floor(Math.random() * members.length)],
          task: tasks[Math.floor(Math.random() * tasks.length)],
          type: types[Math.floor(Math.random() * types.length)],
          timestamp: now - d * day - (24 - hourOffset) * h + Math.floor(Math.random() * h)
        });
      }
    }
    this.changes = entries.sort((a, b) => b.timestamp - a.timestamp);
  },

  addChange(member, task, type) {
    this.changes.unshift({ member, task, type, timestamp: Date.now() });
    this.render();
  },

  render() {
    if (!this.container) return;
    const daily = this._dailyCounts();
    const editors = this._topEditors();
    const topTasks = this._topTasks();
    const breakdown = this._typeBreakdown();
    const heatmap = this._hourHeatmap();
    const stats = this._summaryStats();

    this.container.innerHTML = `
      <div class="mpca-wrapper">
        <div class="mpca-header">
          <div class="mpca-title">Change Analytics</div>
        </div>

        <div class="mpca-stats-row">
          <div class="mpca-stat"><div class="mpca-stat-value">${stats.total}</div><div class="mpca-stat-label">Total Changes</div></div>
          <div class="mpca-stat"><div class="mpca-stat-value">${stats.avgPerDay}</div><div class="mpca-stat-label">Avg / Day</div></div>
          <div class="mpca-stat"><div class="mpca-stat-value">${this._esc(stats.mostActive)}</div><div class="mpca-stat-label">Most Active</div></div>
        </div>

        <div class="mpca-grid">
          <div class="mpca-card">
            <div class="mpca-card-title">Changes Per Day (Last 7 Days)</div>
            <div class="mpca-bar-chart">
              ${daily.map(d => `
                <div class="mpca-bar-col">
                  <div class="mpca-bar" style="height: ${d.pct}%"></div>
                  <div class="mpca-bar-val">${d.count}</div>
                  <div class="mpca-bar-label">${this._esc(d.label)}</div>
                </div>`).join('')}
            </div>
          </div>

          <div class="mpca-card">
            <div class="mpca-card-title">Change Type Breakdown</div>
            <div class="mpca-donut-area">
              ${this._renderDonut(breakdown)}
              <div class="mpca-donut-legend">
                ${breakdown.map(b => `
                  <div class="mpca-legend-item">
                    <span class="mpca-legend-dot" style="background: ${b.color}"></span>
                    ${this._esc(b.type)} <span class="mpca-legend-count">${b.count}</span>
                  </div>`).join('')}
              </div>
            </div>
          </div>

          <div class="mpca-card">
            <div class="mpca-card-title">Most Active Editors</div>
            ${editors.map((e, i) => `
              <div class="mpca-rank-item">
                <span class="mpca-rank-num">${i + 1}</span>
                <span class="mpca-rank-name">${this._esc(e.member)}</span>
                <div class="mpca-rank-bar-bg"><div class="mpca-rank-bar" style="width: ${e.pct}%"></div></div>
                <span class="mpca-rank-count">${e.count}</span>
              </div>`).join('')}
          </div>

          <div class="mpca-card">
            <div class="mpca-card-title">Most Changed Tasks</div>
            ${topTasks.map((t, i) => `
              <div class="mpca-rank-item">
                <span class="mpca-rank-num">${i + 1}</span>
                <span class="mpca-rank-name">${this._esc(t.task)}</span>
                <div class="mpca-rank-bar-bg"><div class="mpca-rank-bar mpca-rank-bar--alt" style="width: ${t.pct}%"></div></div>
                <span class="mpca-rank-count">${t.count}</span>
              </div>`).join('')}
          </div>

          <div class="mpca-card mpca-card--wide">
            <div class="mpca-card-title">Busiest Hours (0-23h)</div>
            <div class="mpca-heatmap">
              ${heatmap.map(h => `
                <div class="mpca-heat-cell" title="${h.hour}:00 — ${h.count} changes"
                  style="opacity: ${0.15 + h.intensity * 0.85}">
                  <div class="mpca-heat-label">${h.hour}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
  },

  _dailyCounts() {
    const now = Date.now();
    const day = 86400000;
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const start = now - (i + 1) * day;
      const end = now - i * day;
      const count = this.changes.filter(c => c.timestamp >= start && c.timestamp < end).length;
      const d = new Date(end);
      days.push({ label: dayNames[d.getDay()], count });
    }
    const max = Math.max(...days.map(d => d.count), 1);
    days.forEach(d => d.pct = (d.count / max) * 100);
    return days;
  },

  _topEditors() {
    const map = {};
    this.changes.forEach(c => map[c.member] = (map[c.member] || 0) + 1);
    const arr = Object.entries(map).map(([member, count]) => ({ member, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    const max = arr[0]?.count || 1;
    arr.forEach(a => a.pct = (a.count / max) * 100);
    return arr;
  },

  _topTasks() {
    const map = {};
    this.changes.forEach(c => map[c.task] = (map[c.task] || 0) + 1);
    const arr = Object.entries(map).map(([task, count]) => ({ task, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    const max = arr[0]?.count || 1;
    arr.forEach(a => a.pct = (a.count / max) * 100);
    return arr;
  },

  _typeBreakdown() {
    const map = {};
    this._types.forEach(t => map[t] = 0);
    this.changes.forEach(c => map[c.type] = (map[c.type] || 0) + 1);
    return this._types.map(t => ({ type: t, count: map[t], color: this._typeColors[t] }));
  },

  _hourHeatmap() {
    const counts = new Array(24).fill(0);
    this.changes.forEach(c => { const h = new Date(c.timestamp).getHours(); counts[h]++; });
    const max = Math.max(...counts, 1);
    return counts.map((count, hour) => ({ hour, count, intensity: count / max }));
  },

  _summaryStats() {
    const total = this.changes.length;
    const avgPerDay = total > 0 ? (total / 7).toFixed(1) : '0';
    const map = {};
    this.changes.forEach(c => map[c.member] = (map[c.member] || 0) + 1);
    const mostActive = Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    return { total, avgPerDay, mostActive };
  },

  _renderDonut(data) {
    const total = data.reduce((s, d) => s + d.count, 0) || 1;
    let cum = 0;
    const size = 100;
    const cx = 50, cy = 50, r = 36, inner = 20;
    let paths = '';
    data.forEach(d => {
      if (d.count === 0) return;
      const start = cum / total;
      const end = (cum + d.count) / total;
      cum += d.count;
      const largeArc = (end - start) > 0.5 ? 1 : 0;
      const x1 = cx + r * Math.cos(2 * Math.PI * start - Math.PI / 2);
      const y1 = cy + r * Math.sin(2 * Math.PI * start - Math.PI / 2);
      const x2 = cx + r * Math.cos(2 * Math.PI * end - Math.PI / 2);
      const y2 = cy + r * Math.sin(2 * Math.PI * end - Math.PI / 2);
      const ix1 = cx + inner * Math.cos(2 * Math.PI * end - Math.PI / 2);
      const iy1 = cy + inner * Math.sin(2 * Math.PI * end - Math.PI / 2);
      const ix2 = cx + inner * Math.cos(2 * Math.PI * start - Math.PI / 2);
      const iy2 = cy + inner * Math.sin(2 * Math.PI * start - Math.PI / 2);
      paths += `<path d="M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${ix1},${iy1} A${inner},${inner} 0 ${largeArc} 0 ${ix2},${iy2} Z" fill="${d.color}" />`;
    });
    return `<svg class="mpca-donut" viewBox="0 0 ${size} ${size}">${paths}</svg>`;
  },

  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  _escAttr(str) { return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },

  exportState() { return { changes: JSON.parse(JSON.stringify(this.changes)) }; },

  importState(state) {
    if (!state) return;
    this.changes = state.changes || [];
    this.render();
  }
};
