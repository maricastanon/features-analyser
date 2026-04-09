/* ═══════════════════════════════════════════════
   FEATURE: Planner Budget — Budget tracker
   Total budget, spent, remaining, burn rate,
   category breakdown, over-budget warnings.
   ═══════════════════════════════════════════════ */
const FeatPlannerBudget = {
  budget: null,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.budget = {
      total: 150000,
      categories: [
        { id:1, name:'People', icon:'👤', allocated:80000, spent:62000, color:'#3b82f6' },
        { id:2, name:'Tools & Licenses', icon:'🔧', allocated:25000, spent:23500, color:'#a855f7' },
        { id:3, name:'Infrastructure', icon:'☁️', allocated:30000, spent:18000, color:'#f97316' },
        { id:4, name:'Training', icon:'📚', allocated:8000, spent:3200, color:'#22c55e' },
        { id:5, name:'Other', icon:'📦', allocated:7000, spent:8500, color:'#eab308' }
      ],
      monthlySpend: [
        { month:'Jan', amount:12000 },
        { month:'Feb', amount:14500 },
        { month:'Mar', amount:18200 },
        { month:'Apr', amount:16800 }
      ]
    };
  },

  render() {
    const b = this.budget;
    const totalSpent = b.categories.reduce((s,c) => s + c.spent, 0);
    const remaining = b.total - totalSpent;
    const pctUsed = Math.round((totalSpent / b.total) * 100);
    const isOver = remaining < 0;
    const burnRate = b.monthlySpend.length ? Math.round(b.monthlySpend.reduce((s,m)=>s+m.amount,0)/b.monthlySpend.length) : 0;
    const monthsLeft = remaining > 0 ? (remaining / burnRate).toFixed(1) : 0;
    const maxCatSpent = Math.max(...b.categories.map(c => c.allocated));

    this.container.innerHTML = `
    <div class="pbu-wrap">
      <div class="pbu-header">
        <h3 class="pbu-title">Budget Tracker</h3>
        <span class="pbu-missing-badge">MISSING FROM PLANNER</span>
        <button class="pbu-btn pbu-btn-pink" onclick="FeatPlannerBudget.editBudget()">Edit Budget</button>
      </div>

      <!-- Main budget bar -->
      <div class="pbu-main-card">
        <div class="pbu-main-top">
          <div>
            <span class="pbu-label">Total Budget</span>
            <span class="pbu-big-num">$${b.total.toLocaleString()}</span>
          </div>
          <div style="text-align:center">
            <span class="pbu-label">Spent</span>
            <span class="pbu-big-num" style="color:${isOver?'#ef4444':'#e91e90'}">$${totalSpent.toLocaleString()}</span>
          </div>
          <div style="text-align:right">
            <span class="pbu-label">Remaining</span>
            <span class="pbu-big-num" style="color:${isOver?'#ef4444':'#22c55e'}">$${remaining.toLocaleString()}</span>
          </div>
        </div>
        <div class="pbu-bar-main">
          <div class="pbu-bar-fill" style="width:${Math.min(pctUsed,100)}%;background:${pctUsed>90?'#ef4444':pctUsed>75?'#f97316':'#22c55e'}"></div>
        </div>
        <div class="pbu-bar-meta">
          <span>${pctUsed}% used</span>
          ${isOver ? `<span class="pbu-over-warn">OVER BUDGET</span>` : `<span>~${monthsLeft} months at current burn rate</span>`}
        </div>
      </div>

      <div class="pbu-grid">
        <!-- Burn rate -->
        <div class="pbu-card">
          <div class="pbu-card-title">Monthly Burn Rate</div>
          <div class="pbu-burn-val">$${burnRate.toLocaleString()}/mo</div>
          <div class="pbu-burn-bars">
            ${b.monthlySpend.map(m => `
              <div class="pbu-burn-col">
                <div class="pbu-burn-bar" style="height:${(m.amount/20000)*100}%"></div>
                <span class="pbu-burn-label">${m.month}</span>
              </div>`).join('')}
          </div>
        </div>

        <!-- Categories -->
        <div class="pbu-card">
          <div class="pbu-card-title">By Category</div>
          <div class="pbu-cats">
            ${b.categories.map(c => {
              const catPct = Math.round((c.spent / c.allocated) * 100);
              const overCat = c.spent > c.allocated;
              return `
              <div class="pbu-cat">
                <div class="pbu-cat-head">
                  <span>${c.icon} ${this._esc(c.name)}</span>
                  <span class="pbu-cat-vals ${overCat?'pbu-cat-over':''}">$${c.spent.toLocaleString()} / $${c.allocated.toLocaleString()}</span>
                </div>
                <div class="pbu-cat-bar">
                  <div class="pbu-cat-fill" style="width:${Math.min(catPct,100)}%;background:${overCat?'#ef4444':c.color}"></div>
                </div>
                <div class="pbu-cat-pct">${catPct}%${overCat?' — Over budget!':''}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>`;
  },

  editBudget() {
    const val = prompt('Total budget ($):', this.budget.total);
    if (val !== null && !isNaN(val)) { this.budget.total = parseInt(val); this.render(); }
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { budget: this.budget }; },
  importState(s) { if (s.budget) this.budget = s.budget; this.render(); }
};
