/* ═══════════════════════════════════════════════════════════════
   FEATURE: ACE Mock — Shared Renderer For Individual ACE Tabs
   Each bundled entry injects window.__ACE_MOCK_CONFIG__ before this file.
   ═══════════════════════════════════════════════════════════════ */
window.FeatAceMock = {
  container: null,
  cfg: null,
  state: null,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this.cfg = JSON.parse(JSON.stringify(window.__ACE_MOCK_CONFIG__ || this._fallback()));
    this._seedState();
    this.render();
  },

  _fallback() {
    return {
      id: 'ace-fallback',
      title: 'ACE Mock',
      kind: 'Extension',
      familyLabel: 'Universal',
      preview: 'checklist',
      short: 'Fallback mock card.',
      benchmarkTie: 'Fallback benchmark tie.',
      painPoint: 'Fallback pain point.',
      value: 'Fallback build value.',
      sample: { items: ['Item one', 'Item two', 'Item three'] }
    };
  },

  _seedState() {
    const cfg = this.cfg;
    const sample = cfg.sample || {};
    this.state = {
      search: '',
      accent: 0,
      focus: 0,
      items: (sample.items || []).map(text => ({ text, done: false })),
      lanes: sample.lanes || ['Idea', 'Doing', 'Done'],
      cards: (sample.cards || []).map((title, index) => ({ title, lane: index % Math.max(1, (sample.lanes || []).length) })),
      metrics: sample.metrics || ['Signal A', 'Signal B', 'Signal C'],
      values: sample.values || (sample.metrics || []).map((_, index) => [68, 44, 21, 9][index % 4]),
      columns: sample.columns || ['Column A', 'Column B'],
      rows: sample.rows || [['Sample', 'Value']],
      fields: sample.fields || ['Field A', 'Field B', 'Field C'],
      fieldValues: (sample.fields || []).map(() => ''),
      tasks: (sample.tasks || ['Step 1', 'Step 2', 'Step 3']).map((title, index) => ({
        title,
        start: index + 1,
        span: 2 + (index % 2)
      })),
      people: sample.people || ['Ana', 'Bo', 'Chen'],
      load: sample.load || [42, 65, 28],
      axes: sample.axes || ['Urgency', 'Impact', 'Fit'],
      scores: (sample.axes || ['Urgency', 'Impact', 'Fit']).map((_, index) => (index % 5) + 1)
    };
  },

  render() {
    if (!this.container) return;
    const cfg = this.cfg;
    this.container.innerHTML = `
    <div class="ace-mini-wrap">
      <div class="ace-mini-head">
        <div>
          <div class="ace-mini-overline">${this._esc(cfg.familyLabel)} • ${this._esc(cfg.kind)}</div>
          <h3>${this._esc(cfg.title)}</h3>
          <p>${this._esc(cfg.short)}</p>
        </div>
        <div class="ace-mini-pills">
          <span class="ace-mini-pill ${cfg.kind === 'Gap Build' ? 'yellow' : 'pink'}">${this._esc(cfg.kind)}</span>
          <span class="ace-mini-pill green">${this._esc(cfg.preview)}</span>
        </div>
      </div>

      <div class="ace-mini-grid">
        <div class="ace-mini-card">
          <strong>Benchmark tie</strong>
          <div class="ace-mini-copy">${this._esc(cfg.benchmarkTie)}</div>
        </div>
        <div class="ace-mini-card">
          <strong>Pain point</strong>
          <div class="ace-mini-copy">${this._esc(cfg.painPoint)}</div>
        </div>
        <div class="ace-mini-card">
          <strong>Build value</strong>
          <div class="ace-mini-copy">${this._esc(cfg.value)}</div>
        </div>
      </div>

      <div class="ace-mini-preview">
        ${this._renderPreview()}
      </div>
    </div>`;
  },

  _renderPreview() {
    const cfg = this.cfg;
    if (cfg.preview === 'checklist') return this._renderChecklist();
    if (cfg.preview === 'board') return this._renderBoard();
    if (cfg.preview === 'dashboard') return this._renderDashboard();
    if (cfg.preview === 'table') return this._renderTable();
    if (cfg.preview === 'form') return this._renderForm();
    if (cfg.preview === 'timeline') return this._renderTimeline();
    if (cfg.preview === 'workload') return this._renderWorkload();
    if (cfg.preview === 'matrix') return this._renderMatrix();
    return `<div class="ace-mini-card">No preview renderer configured.</div>`;
  },

  _renderChecklist() {
    return `
    <div class="ace-mini-card">
      <div class="ace-mini-actions">
        <button class="ace-mini-btn" onclick="FeatAceMock.addItem()">+ Add</button>
        <button class="ace-mini-btn" onclick="FeatAceMock.clearDone()">Clear done</button>
      </div>
      <div class="ace-mini-list">
        ${this.state.items.map((item, index) => `
          <label class="ace-mini-check ${item.done ? 'done' : ''}">
            <input type="checkbox" ${item.done ? 'checked' : ''} onchange="FeatAceMock.toggleCheck(${index})">
            <span>${this._esc(item.text)}</span>
          </label>`).join('')}
      </div>
    </div>`;
  },

  _renderBoard() {
    return `
    <div class="ace-mini-board">
      ${this.state.lanes.map((lane, laneIndex) => `
        <div class="ace-mini-lane">
          <div class="ace-mini-lane-title">${this._esc(lane)}</div>
          ${this.state.cards.filter(card => card.lane === laneIndex).map((card, cardIndex) => `
            <button class="ace-mini-card-btn" onclick="FeatAceMock.shiftCard(${this._cardIndex(card, cardIndex)})">
              ${this._esc(card.title)}
            </button>`).join('')}
        </div>`).join('')}
    </div>`;
  },

  _renderDashboard() {
    return `
    <div class="ace-mini-kpis">
      ${this.state.metrics.map((metric, index) => `
        <button class="ace-mini-kpi ${this.state.accent === index ? 'active' : ''}" onclick="FeatAceMock.setAccent(${index})">
          <span>${this._esc(metric)}</span>
          <strong>${this.state.values[index]}</strong>
        </button>`).join('')}
    </div>`;
  },

  _renderTable() {
    const filtered = this.state.rows.filter(row => row.join(' ').toLowerCase().includes(this.state.search.toLowerCase()));
    return `
    <div class="ace-mini-card">
      <div class="ace-mini-actions">
        <input class="ace-mini-input" type="text" value="${this._esc(this.state.search)}" placeholder="Filter rows" oninput="FeatAceMock.setSearch(this.value)">
      </div>
      <div class="ace-mini-table-wrap">
        <table class="ace-mini-table">
          <thead>
            <tr>${this.state.columns.map(column => `<th>${this._esc(column)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${filtered.map(row => `<tr>${row.map(cell => `<td>${this._esc(cell)}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  _renderForm() {
    return `
    <div class="ace-mini-card">
      <div class="ace-mini-form">
        ${this.state.fields.map((field, index) => `
          <label class="ace-mini-field">
            <span>${this._esc(field)}</span>
            <input class="ace-mini-input" type="text" value="${this._esc(this.state.fieldValues[index])}" oninput="FeatAceMock.setField(${index}, this.value)">
          </label>`).join('')}
      </div>
      <div class="ace-mini-save">Live draft values update as you type.</div>
    </div>`;
  },

  _renderTimeline() {
    return `
    <div class="ace-mini-card">
      <div class="ace-mini-timeline">
        ${this.state.tasks.map((task, index) => `
          <button class="ace-mini-time-row ${this.state.focus === index ? 'active' : ''}" onclick="FeatAceMock.setFocus(${index})">
            <span>${this._esc(task.title)}</span>
            <span>Week ${task.start} • ${task.span}w</span>
          </button>`).join('')}
      </div>
    </div>`;
  },

  _renderWorkload() {
    return `
    <div class="ace-mini-card">
      <div class="ace-mini-workload">
        ${this.state.people.map((person, index) => `
          <div class="ace-mini-load-row">
            <span>${this._esc(person)}</span>
            <div class="ace-mini-load-bar"><span style="width:${this.state.load[index]}%"></span></div>
            <button class="ace-mini-btn" onclick="FeatAceMock.bumpLoad(${index})">${this.state.load[index]}%</button>
          </div>`).join('')}
      </div>
    </div>`;
  },

  _renderMatrix() {
    return `
    <div class="ace-mini-card">
      <div class="ace-mini-matrix">
        ${this.state.axes.map((axis, index) => `
          <label class="ace-mini-field">
            <span>${this._esc(axis)}: ${this.state.scores[index]}</span>
            <input type="range" min="1" max="5" value="${this.state.scores[index]}" oninput="FeatAceMock.setScore(${index}, this.value)">
          </label>`).join('')}
      </div>
    </div>`;
  },

  toggleCheck(index) {
    const item = this.state.items[index];
    if (!item) return;
    item.done = !item.done;
    this.render();
  },

  addItem() {
    const text = prompt('New checklist item:');
    if (!text || !text.trim()) return;
    this.state.items.push({ text: text.trim(), done: false });
    this.render();
  },

  clearDone() {
    this.state.items = this.state.items.filter(item => !item.done);
    this.render();
  },

  shiftCard(index) {
    const card = this.state.cards[index];
    if (!card) return;
    card.lane = (card.lane + 1) % this.state.lanes.length;
    this.render();
  },

  setAccent(index) {
    this.state.accent = index;
    this.render();
  },

  setSearch(value) {
    this.state.search = value;
    this.render();
  },

  setField(index, value) {
    this.state.fieldValues[index] = value;
  },

  setFocus(index) {
    this.state.focus = index;
    this.render();
  },

  bumpLoad(index) {
    this.state.load[index] = (this.state.load[index] + 11) % 110;
    this.render();
  },

  setScore(index, value) {
    this.state.scores[index] = Number(value);
    this.render();
  },

  _cardIndex(card) {
    return this.state.cards.indexOf(card);
  },

  _esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};
