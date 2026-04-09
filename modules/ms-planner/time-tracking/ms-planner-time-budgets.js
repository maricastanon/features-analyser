const MsPlannerTimeBudgets = {
  container: null,
  budgets: [
    { id: 1, name: 'Design mockups', budgetHours: 20, spentHours: 9.5 },
    { id: 2, name: 'Write specs', budgetHours: 15, spentHours: 8.5 },
    { id: 3, name: 'Build API', budgetHours: 40, spentHours: 21.5 },
    { id: 4, name: 'Auth module', budgetHours: 10, spentHours: 4.5 },
    { id: 5, name: 'Setup CI', budgetHours: 5, spentHours: 6.0 },
    { id: 6, name: 'QA review', budgetHours: 12, spentHours: 11.0 }
  ],
  timeEntries: [],
  _nextBudgetId: 7,
  _nextEntryId: 1,
  _sortMode: 'mostSpent',
  _showBudgetForm: false,
  _showEntryForm: false,

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },

  _pctClass(spent, budget) {
    if (budget <= 0) return 'tbd-bar-red';
    const pct = (spent / budget) * 100;
    if (pct > 100) return 'tbd-bar-red';
    if (pct >= 80) return 'tbd-bar-gold';
    return 'tbd-bar-green';
  },

  _pctWidth(spent, budget) {
    if (budget <= 0) return 100;
    return Math.min((spent / budget) * 100, 100);
  },

  _sorted() {
    const list = this.budgets.slice();
    if (this._sortMode === 'mostSpent') list.sort((a, b) => b.spentHours - a.spentHours);
    else if (this._sortMode === 'mostRemaining') list.sort((a, b) => (b.budgetHours - b.spentHours) - (a.budgetHours - a.spentHours));
    else if (this._sortMode === 'overbudget') list.sort((a, b) => {
      const ao = a.spentHours > a.budgetHours ? 1 : 0;
      const bo = b.spentHours > b.budgetHours ? 1 : 0;
      if (ao !== bo) return bo - ao;
      return (b.spentHours / (b.budgetHours || 1)) - (a.spentHours / (a.budgetHours || 1));
    });
    return list;
  },

  _summary() {
    let totalBudget = 0, totalSpent = 0;
    this.budgets.forEach(b => { totalBudget += b.budgetHours; totalSpent += b.spentHours; });
    return { totalBudget: totalBudget.toFixed(1), totalSpent: totalSpent.toFixed(1), remaining: (totalBudget - totalSpent).toFixed(1) };
  },

  _addBudget() {
    const name = this.container.querySelector('.tbd-inp-name');
    const hours = this.container.querySelector('.tbd-inp-hours');
    if (!name || !name.value.trim() || !hours || !Number(hours.value)) return;
    this.budgets.push({ id: this._nextBudgetId++, name: name.value.trim(), budgetHours: Number(hours.value), spentHours: 0 });
    this._showBudgetForm = false;
    this.render();
  },

  _addEntry() {
    const sel = this.container.querySelector('.tbd-inp-task');
    const hours = this.container.querySelector('.tbd-inp-ehours');
    const date = this.container.querySelector('.tbd-inp-date');
    if (!sel || !hours || !Number(hours.value)) return;
    const budgetId = Number(sel.value);
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return;
    budget.spentHours += Number(hours.value);
    this.timeEntries.push({
      id: this._nextEntryId++,
      budgetId,
      taskName: budget.name,
      hours: Number(hours.value),
      date: date ? date.value : new Date().toISOString().split('T')[0]
    });
    this._showEntryForm = false;
    this.render();
  },

  _deleteBudget(id) {
    this.budgets = this.budgets.filter(b => b.id !== id);
    this.render();
  },

  render() {
    if (!this.container) return;
    const sorted = this._sorted();
    const summary = this._summary();
    const sortOpts = [['mostSpent', 'Most Spent'], ['mostRemaining', 'Most Remaining'], ['overbudget', 'Overbudget First']];
    const overCount = this.budgets.filter(b => b.spentHours > b.budgetHours).length;

    const budgetForm = this._showBudgetForm ? `<div class="tbd-form">
      <input class="tbd-input tbd-inp-name" placeholder="Task / project name" />
      <input class="tbd-input tbd-inp-hours" type="number" min="0" step="0.5" placeholder="Budget hours" />
      <div class="tbd-form-actions">
        <button class="tbd-btn tbd-btn-save" data-action="saveBudget">Save</button>
        <button class="tbd-btn tbd-btn-cancel" data-action="cancelBudget">Cancel</button>
      </div>
    </div>` : '';

    const entryForm = this._showEntryForm ? `<div class="tbd-form">
      <select class="tbd-input tbd-inp-task">
        ${this.budgets.map(b => `<option value="${b.id}">${this._esc(b.name)}</option>`).join('')}
      </select>
      <input class="tbd-input tbd-inp-ehours" type="number" min="0" step="0.25" placeholder="Hours" />
      <input class="tbd-input tbd-inp-date" type="date" value="${new Date().toISOString().split('T')[0]}" />
      <div class="tbd-form-actions">
        <button class="tbd-btn tbd-btn-save" data-action="saveEntry">Save</button>
        <button class="tbd-btn tbd-btn-cancel" data-action="cancelEntry">Cancel</button>
      </div>
    </div>` : '';

    let html = `<div class="tbd-panel">
      <div class="tbd-header">
        <h3>Time Budgets</h3>
        <div class="tbd-header-actions">
          <button class="tbd-btn tbd-btn-add" data-action="showEntryForm">+ Log Time</button>
          <button class="tbd-btn tbd-btn-add-alt" data-action="showBudgetForm">+ Budget</button>
        </div>
      </div>
      ${budgetForm}${entryForm}
      <div class="tbd-summary-bar">
        <div class="tbd-summary-item">
          <span class="tbd-sum-val">${summary.totalBudget}h</span>
          <span class="tbd-sum-lbl">Budget</span>
        </div>
        <div class="tbd-summary-item">
          <span class="tbd-sum-val">${summary.totalSpent}h</span>
          <span class="tbd-sum-lbl">Spent</span>
        </div>
        <div class="tbd-summary-item">
          <span class="tbd-sum-val ${Number(summary.remaining) < 0 ? 'tbd-val-neg' : ''}">${summary.remaining}h</span>
          <span class="tbd-sum-lbl">Remaining</span>
        </div>
        ${overCount > 0 ? `<div class="tbd-overbudget-badge">${overCount} overbudget</div>` : ''}
      </div>
      <div class="tbd-sort-bar">
        <span class="tbd-sort-label">Sort:</span>
        ${sortOpts.map(([v, l]) => `<button class="tbd-sort-btn${this._sortMode === v ? ' tbd-sort-active' : ''}" data-action="sort" data-value="${v}">${l}</button>`).join('')}
      </div>
      <div class="tbd-list">
        ${sorted.map(b => {
          const pct = b.budgetHours > 0 ? ((b.spentHours / b.budgetHours) * 100).toFixed(0) : 100;
          const cls = this._pctClass(b.spentHours, b.budgetHours);
          const w = this._pctWidth(b.spentHours, b.budgetHours);
          const remaining = (b.budgetHours - b.spentHours).toFixed(1);
          const isOver = b.spentHours > b.budgetHours;
          return `<div class="tbd-item">
            <div class="tbd-item-head">
              <span class="tbd-item-name">${this._esc(b.name)}</span>
              ${isOver ? '<span class="tbd-badge-over">OVER</span>' : ''}
              <span class="tbd-item-stat">${b.spentHours.toFixed(1)} / ${b.budgetHours.toFixed(1)}h</span>
              <button class="tbd-btn-del" data-action="delete" data-id="${b.id}">&times;</button>
            </div>
            <div class="tbd-progress-track">
              <div class="tbd-progress-fill ${cls}" style="width:${w}%"></div>
            </div>
            <div class="tbd-item-footer">
              <span class="tbd-item-pct">${pct}%</span>
              <span class="tbd-item-rem">${isOver ? 'Over by ' + Math.abs(Number(remaining)).toFixed(1) + 'h' : remaining + 'h remaining'}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;

    this.container.innerHTML = html;

    this.container.onclick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'showBudgetForm') { this._showBudgetForm = true; this._showEntryForm = false; this.render(); }
      else if (action === 'showEntryForm') { this._showEntryForm = true; this._showBudgetForm = false; this.render(); }
      else if (action === 'cancelBudget') { this._showBudgetForm = false; this.render(); }
      else if (action === 'cancelEntry') { this._showEntryForm = false; this.render(); }
      else if (action === 'saveBudget') { this._addBudget(); }
      else if (action === 'saveEntry') { this._addEntry(); }
      else if (action === 'delete') { this._deleteBudget(Number(btn.dataset.id)); }
      else if (action === 'sort') { this._sortMode = btn.dataset.value; this.render(); }
    };
  },

  exportState() {
    return {
      budgets: JSON.parse(JSON.stringify(this.budgets)),
      timeEntries: JSON.parse(JSON.stringify(this.timeEntries)),
      _nextBudgetId: this._nextBudgetId,
      _nextEntryId: this._nextEntryId,
      _sortMode: this._sortMode
    };
  },

  importState(state) {
    if (!state) return;
    this.budgets = state.budgets || [];
    this.timeEntries = state.timeEntries || [];
    this._nextBudgetId = state._nextBudgetId || this.budgets.length + 1;
    this._nextEntryId = state._nextEntryId || this.timeEntries.length + 1;
    this._sortMode = state._sortMode || 'mostSpent';
    this.render();
  }
};
