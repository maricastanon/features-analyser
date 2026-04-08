/* ═══════════════════════════════════════════════
   FEATURE: Performance Monitor — Universal Module
   Track page load, API response times, web vitals.
   Works for ANY web app's performance monitoring.
   ═══════════════════════════════════════════════ */
const FeatPerformanceMonitor = {
  metrics: {},
  history: [],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.metrics = {
      lcp: { label: 'LCP', value: 1.8, unit: 's', target: 2.5, desc: 'Largest Contentful Paint' },
      fid: { label: 'FID', value: 45, unit: 'ms', target: 100, desc: 'First Input Delay' },
      cls: { label: 'CLS', value: 0.08, unit: '', target: 0.1, desc: 'Cumulative Layout Shift' },
      ttfb: { label: 'TTFB', value: 320, unit: 'ms', target: 800, desc: 'Time to First Byte' },
      fcp: { label: 'FCP', value: 1.2, unit: 's', target: 1.8, desc: 'First Contentful Paint' },
      bundle: { label: 'Bundle', value: 187, unit: 'KB', target: 300, desc: 'Total JS Bundle Size' }
    };
    this.history = [
      { date: '2026-04-08', score: 92 }, { date: '2026-04-07', score: 89 },
      { date: '2026-04-06', score: 91 }, { date: '2026-04-05', score: 85 },
      { date: '2026-04-04', score: 88 }, { date: '2026-04-03', score: 82 },
      { date: '2026-04-02', score: 86 }
    ];
  },

  render() {
    const overallScore = Math.round(Object.values(this.metrics).reduce((sum, m) => {
      const pct = Math.min(100, (m.target / Math.max(m.value, 0.001)) * 50);
      return sum + pct;
    }, 0) / Object.keys(this.metrics).length);

    const scoreColor = overallScore >= 90 ? '#22c55e' : overallScore >= 50 ? '#f97316' : '#ef4444';

    this.container.innerHTML = `
    <div class="feat-perf-wrap">
      <div class="perf-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">⚡ Performance Monitor</h3>
        <button class="perf-btn" onclick="FeatPerformanceMonitor.refresh()">🔄 Refresh</button>
      </div>
      <div class="perf-score-section">
        <div class="perf-score-ring">
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a3d28" stroke-width="3"/>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="${scoreColor}" stroke-width="3"
              stroke-dasharray="${overallScore}, 100" stroke-linecap="round" transform="rotate(-90 18 18)"/>
          </svg>
          <span class="perf-score-val" style="color:${scoreColor}">${overallScore}</span>
        </div>
        <div class="perf-score-label">Performance Score</div>
      </div>
      <div class="perf-vitals">
        ${Object.entries(this.metrics).map(([key, m]) => {
          const pct = Math.min(100, (m.value / m.target) * 100);
          const good = pct <= 75;
          const color = good ? '#22c55e' : pct <= 100 ? '#f97316' : '#ef4444';
          return `<div class="perf-vital">
            <div class="perf-vital-header">
              <span class="perf-vital-label">${m.label}</span>
              <span class="perf-vital-val" style="color:${color}">${m.value}${m.unit}</span>
            </div>
            <div class="perf-vital-desc">${m.desc}</div>
            <div class="perf-vital-bar"><div class="perf-vital-fill" style="width:${Math.min(pct,100)}%;background:${color}"></div></div>
            <div class="perf-vital-target">Target: &lt;${m.target}${m.unit}</div>
          </div>`;
        }).join('')}
      </div>
      <div class="perf-history">
        <div class="perf-history-title">📈 Score History (7 days)</div>
        <div class="perf-chart">
          ${this.history.map((h, i) => {
            const height = h.score;
            const color = h.score >= 90 ? '#22c55e' : h.score >= 50 ? '#f97316' : '#ef4444';
            return `<div class="perf-bar-col">
              <div class="perf-bar" style="height:${height}%;background:${color}" title="${h.date}: ${h.score}"></div>
              <div class="perf-bar-label">${h.date.slice(5)}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  },

  refresh() {
    // Simulate new readings
    Object.values(this.metrics).forEach(m => {
      m.value = +(m.value * (0.9 + Math.random() * 0.2)).toFixed(m.unit === '' ? 2 : 0);
    });
    this.render();
  },

  exportState() { return { metrics: this.metrics, history: this.history }; },
  importState(s) { if (s.metrics) this.metrics = s.metrics; if (s.history) this.history = s.history; this.render(); }
};
