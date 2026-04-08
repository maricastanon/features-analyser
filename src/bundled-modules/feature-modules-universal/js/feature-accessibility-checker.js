/* ═══════════════════════════════════════════════
   FEATURE: Accessibility Checker — Universal Module
   Audit UI for WCAG compliance, contrast,
   screen reader, keyboard nav issues.
   ═══════════════════════════════════════════════ */
const FeatAccessibilityChecker = {
  checks: [],
  score: 0,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.checks = [
      { id: 1, rule: 'Color Contrast', level: 'AA', status: 'pass', desc: 'All text meets 4.5:1 contrast ratio', impact: 'critical', count: 24 },
      { id: 2, rule: 'Alt Text on Images', level: 'A', status: 'fail', desc: '3 images missing alt attributes', impact: 'serious', count: 3 },
      { id: 3, rule: 'Keyboard Navigation', level: 'A', status: 'pass', desc: 'All interactive elements are keyboard accessible', impact: 'critical', count: 18 },
      { id: 4, rule: 'ARIA Labels', level: 'AA', status: 'warning', desc: '2 buttons have generic labels', impact: 'moderate', count: 2 },
      { id: 5, rule: 'Focus Indicators', level: 'AA', status: 'pass', desc: 'Visible focus ring on all focusable elements', impact: 'serious', count: 32 },
      { id: 6, rule: 'Heading Hierarchy', level: 'A', status: 'pass', desc: 'Headings follow logical order (h1→h6)', impact: 'moderate', count: 8 },
      { id: 7, rule: 'Form Labels', level: 'A', status: 'fail', desc: '1 input field missing associated label', impact: 'serious', count: 1 },
      { id: 8, rule: 'Touch Target Size', level: 'AAA', status: 'warning', desc: '4 buttons below 44x44px minimum', impact: 'minor', count: 4 },
      { id: 9, rule: 'Motion Preferences', level: 'AAA', status: 'pass', desc: 'Animations respect prefers-reduced-motion', impact: 'moderate', count: 6 },
      { id: 10, rule: 'Language Attribute', level: 'A', status: 'pass', desc: 'HTML lang attribute is set correctly', impact: 'serious', count: 1 }
    ];
    this.score = Math.round(this.checks.filter(c => c.status === 'pass').length / this.checks.length * 100);
  },

  render() {
    const statusConfig = { pass: { color:'#22c55e', icon:'✅', label:'Pass' }, fail: { color:'#ef4444', icon:'❌', label:'Fail' }, warning: { color:'#eab308', icon:'⚠️', label:'Warning' } };
    const impactColors = { critical:'#ef4444', serious:'#f97316', moderate:'#eab308', minor:'#3b82f6' };
    const passes = this.checks.filter(c => c.status === 'pass').length;
    const fails = this.checks.filter(c => c.status === 'fail').length;
    const warns = this.checks.filter(c => c.status === 'warning').length;
    const scoreColor = this.score >= 90 ? '#22c55e' : this.score >= 70 ? '#eab308' : '#ef4444';

    this.container.innerHTML = `
    <div class="feat-a11y-wrap">
      <div class="a11y-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">♿ Accessibility Checker</h3>
        <button class="a11y-btn" onclick="FeatAccessibilityChecker.rerun()">🔄 Re-run Audit</button>
      </div>
      <div class="a11y-summary">
        <div class="a11y-score">
          <div class="a11y-score-circle" style="border-color:${scoreColor}">
            <span class="a11y-score-val" style="color:${scoreColor}">${this.score}%</span>
          </div>
          <div class="a11y-score-label">WCAG Score</div>
        </div>
        <div class="a11y-counts">
          <div class="a11y-count-item"><span style="color:#22c55e;font-weight:900;font-size:1.2rem">${passes}</span><div>Passed</div></div>
          <div class="a11y-count-item"><span style="color:#ef4444;font-weight:900;font-size:1.2rem">${fails}</span><div>Failed</div></div>
          <div class="a11y-count-item"><span style="color:#eab308;font-weight:900;font-size:1.2rem">${warns}</span><div>Warnings</div></div>
        </div>
      </div>
      <div class="a11y-checks">
        ${this.checks.map(c => {
          const s = statusConfig[c.status];
          return `<div class="a11y-check" style="border-left:3px solid ${s.color}">
            <div class="a11y-check-status">${s.icon}</div>
            <div class="a11y-check-body">
              <div class="a11y-check-rule">
                ${this._esc(c.rule)}
                <span class="a11y-level">WCAG ${c.level}</span>
                <span class="a11y-impact" style="color:${impactColors[c.impact]}">${c.impact}</span>
              </div>
              <div class="a11y-check-desc">${this._esc(c.desc)}</div>
            </div>
            <div class="a11y-check-count">${c.count} elements</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  rerun() {
    // Simulate re-audit
    this.checks.forEach(c => {
      if (c.status === 'fail' && Math.random() > 0.5) c.status = 'pass';
    });
    this.score = Math.round(this.checks.filter(c => c.status === 'pass').length / this.checks.length * 100);
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { checks: this.checks, score: this.score }; },
  importState(s) { if (s.checks) this.checks = s.checks; if (s.score) this.score = s.score; this.render(); }
};
