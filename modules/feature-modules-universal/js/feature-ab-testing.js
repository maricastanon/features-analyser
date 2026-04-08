/* ═══════════════════════════════════════════════
   FEATURE: A/B Test Comparator — Universal Module
   Compare two variants side-by-side with metrics.
   Works for ANY app's feature decisions.
   ═══════════════════════════════════════════════ */
const FeatABTesting = {
  tests: [],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.tests = [
      {
        id: 1, name: 'Onboarding Flow', status: 'running',
        variantA: { name: 'Classic Wizard', conversion: 34, engagement: 72, users: 1240, color: '#3b82f6' },
        variantB: { name: 'Interactive Tour', conversion: 47, engagement: 89, users: 1180, color: '#22c55e' },
        startDate: '2026-03-15', winner: null
      },
      {
        id: 2, name: 'CTA Button Style', status: 'completed',
        variantA: { name: 'Rounded Green', conversion: 22, engagement: 55, users: 3400, color: '#22c55e' },
        variantB: { name: 'Sharp Pink', conversion: 31, engagement: 61, users: 3350, color: '#e91e90' },
        startDate: '2026-02-01', winner: 'B'
      },
      {
        id: 3, name: 'Navigation Layout', status: 'draft',
        variantA: { name: 'Sidebar', conversion: 0, engagement: 0, users: 0, color: '#f97316' },
        variantB: { name: 'Top Bar', conversion: 0, engagement: 0, users: 0, color: '#a855f7' },
        startDate: null, winner: null
      }
    ];
  },

  render() {
    const running = this.tests.filter(t => t.status === 'running').length;
    const completed = this.tests.filter(t => t.status === 'completed').length;

    this.container.innerHTML = `
    <div class="feat-ab-wrap">
      <div class="ab-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">🔬 A/B Test Comparator</h3>
        <div class="ab-stats">
          <span class="ab-badge ab-badge-green">${running} Running</span>
          <span class="ab-badge ab-badge-blue">${completed} Completed</span>
        </div>
        <button class="ab-btn ab-btn-pink" onclick="FeatABTesting.addTest()">+ New Test</button>
      </div>
      <div class="ab-tests">
        ${this.tests.map(t => this._renderTest(t)).join('')}
      </div>
    </div>`;
  },

  _renderTest(test) {
    const statusColors = { running: '#22c55e', completed: '#3b82f6', draft: '#5a8a60' };
    const a = test.variantA, b = test.variantB;
    const aWin = a.conversion > b.conversion;
    const diff = Math.abs(a.conversion - b.conversion);

    return `
    <div class="ab-test-card">
      <div class="ab-test-header">
        <span class="ab-test-name">${this._esc(test.name)}</span>
        <span class="ab-status" style="color:${statusColors[test.status]}">${test.status.toUpperCase()}</span>
      </div>
      <div class="ab-variants">
        <div class="ab-variant ${test.winner === 'A' ? 'ab-winner' : ''}" style="border-color:${a.color}">
          <div class="ab-var-label" style="background:${a.color}">A</div>
          <div class="ab-var-name">${this._esc(a.name)}</div>
          <div class="ab-var-metrics">
            <div class="ab-metric">
              <div class="ab-metric-val" style="color:${a.color}">${a.conversion}%</div>
              <div class="ab-metric-label">Conversion</div>
            </div>
            <div class="ab-metric">
              <div class="ab-metric-val">${a.engagement}%</div>
              <div class="ab-metric-label">Engagement</div>
            </div>
            <div class="ab-metric">
              <div class="ab-metric-val">${a.users.toLocaleString()}</div>
              <div class="ab-metric-label">Users</div>
            </div>
          </div>
          <div class="ab-bar-wrap"><div class="ab-bar" style="width:${a.conversion}%;background:${a.color}"></div></div>
        </div>
        <div class="ab-vs">VS</div>
        <div class="ab-variant ${test.winner === 'B' ? 'ab-winner' : ''}" style="border-color:${b.color}">
          <div class="ab-var-label" style="background:${b.color}">B</div>
          <div class="ab-var-name">${this._esc(b.name)}</div>
          <div class="ab-var-metrics">
            <div class="ab-metric">
              <div class="ab-metric-val" style="color:${b.color}">${b.conversion}%</div>
              <div class="ab-metric-label">Conversion</div>
            </div>
            <div class="ab-metric">
              <div class="ab-metric-val">${b.engagement}%</div>
              <div class="ab-metric-label">Engagement</div>
            </div>
            <div class="ab-metric">
              <div class="ab-metric-val">${b.users.toLocaleString()}</div>
              <div class="ab-metric-label">Users</div>
            </div>
          </div>
          <div class="ab-bar-wrap"><div class="ab-bar" style="width:${b.conversion}%;background:${b.color}"></div></div>
        </div>
      </div>
      ${test.status !== 'draft' ? `<div class="ab-result">
        ${test.winner ? `🏆 Winner: <b>Variant ${test.winner}</b> (+${diff}% conversion)` :
          `📊 Variant ${aWin ? 'A' : 'B'} leading by <b>${diff}%</b>`}
      </div>` : `<div class="ab-result" style="color:#5a8a60">📝 Draft — configure and launch</div>`}
      <div class="ab-actions">
        ${test.status === 'running' ? `<button class="ab-btn ab-btn-sm ab-btn-green" onclick="FeatABTesting.declareWinner(${test.id})">Declare Winner</button>` : ''}
        ${test.status === 'draft' ? `<button class="ab-btn ab-btn-sm ab-btn-green" onclick="FeatABTesting.startTest(${test.id})">▶ Launch</button>` : ''}
        <button class="ab-btn ab-btn-sm ab-btn-outline" onclick="FeatABTesting.removeTest(${test.id})">🗑️</button>
      </div>
    </div>`;
  },

  addTest() {
    const name = prompt('Test name:');
    if (!name?.trim()) return;
    this.tests.push({
      id: Date.now(), name: name.trim(), status: 'draft',
      variantA: { name: 'Variant A', conversion: 0, engagement: 0, users: 0, color: '#3b82f6' },
      variantB: { name: 'Variant B', conversion: 0, engagement: 0, users: 0, color: '#22c55e' },
      startDate: null, winner: null
    });
    this.render();
  },

  startTest(id) {
    const test = this.tests.find(t => t.id === id);
    if (test) { test.status = 'running'; test.startDate = new Date().toISOString().split('T')[0]; this.render(); }
  },

  declareWinner(id) {
    const test = this.tests.find(t => t.id === id);
    if (!test) return;
    test.winner = test.variantA.conversion >= test.variantB.conversion ? 'A' : 'B';
    test.status = 'completed';
    this.render();
  },

  removeTest(id) { this.tests = this.tests.filter(t => t.id !== id); this.render(); },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { tests: this.tests }; },
  importState(s) { if (s.tests) this.tests = s.tests; this.render(); }
};
