/* ═══════════════════════════════════════════════
   MS PLANNER: Task Checklist — JS Module
   Nested checklist with groups, sub-items, reorder,
   templates, and show/hide completed toggle
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerTaskChecklist = {
  // ── State ──
  groups: [],
  showCompleted: true,
  container: null,

  TEMPLATES: {
    'Code Review': [
      { text: 'Code compiles without errors', done: false, subs: [] },
      { text: 'Unit tests pass', done: false, subs: [] },
      { text: 'No linting warnings', done: false, subs: [] },
      { text: 'PR description is clear', done: false, subs: [] },
      { text: 'Reviewer approved', done: false, subs: [] }
    ],
    'Bug Fix': [
      { text: 'Reproduce the bug', done: false, subs: [] },
      { text: 'Identify root cause', done: false, subs: [] },
      { text: 'Write failing test', done: false, subs: [] },
      { text: 'Implement fix', done: false, subs: [] },
      { text: 'Verify fix resolves issue', done: false, subs: [] },
      { text: 'Regression testing', done: false, subs: [] }
    ],
    'Feature': [
      { text: 'Requirements defined', done: false, subs: [] },
      { text: 'Design review', done: false, subs: [] },
      { text: 'Implementation', done: false, subs: [
        { text: 'Frontend', done: false },
        { text: 'Backend', done: false },
        { text: 'Database changes', done: false }
      ]},
      { text: 'Testing', done: false, subs: [
        { text: 'Unit tests', done: false },
        { text: 'Integration tests', done: false }
      ]},
      { text: 'Documentation updated', done: false, subs: [] },
      { text: 'Deployed to staging', done: false, subs: [] }
    ]
  },

  // ── Initialize ──
  init(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    if (options.groups) this.groups = options.groups;
    this.render();
  },

  // ── Render ──
  render() {
    if (!this.container) return;
    const tplBtns = Object.keys(this.TEMPLATES).map(k =>
      `<button class="mpcl-tpl-btn" onclick="MsPlannerTaskChecklist.applyTemplate('${this._escAttr(k)}')">${this._esc(k)}</button>`
    ).join('');

    this.container.innerHTML = `
      <div class="mpcl-wrap">
        <div class="mpcl-toolbar">
          <h3 class="mpcl-heading">Checklists</h3>
          <label class="mpcl-toggle">
            <input type="checkbox" ${this.showCompleted ? 'checked' : ''} onchange="MsPlannerTaskChecklist.toggleShowCompleted()" />
            <span>Show completed</span>
          </label>
        </div>
        <div class="mpcl-templates">
          <span class="mpcl-tpl-label">Templates:</span>${tplBtns}
        </div>
        <div class="mpcl-groups">${this.groups.map((g, gi) => this._renderGroup(g, gi)).join('')}</div>
        <div class="mpcl-add-group">
          <input class="mpcl-input" id="mpcl-new-group" placeholder="New checklist group..." onkeydown="if(event.key==='Enter')MsPlannerTaskChecklist.addGroup()" />
          <button class="mpcl-btn-add" onclick="MsPlannerTaskChecklist.addGroup()">+ Add Group</button>
        </div>
      </div>`;
  },

  _renderGroup(g, gi) {
    const items = this.showCompleted ? g.items : g.items.filter(it => !it.done);
    const total = g.items.length;
    const done = g.items.reduce((n, it) => {
      let c = it.done ? 1 : 0;
      if (it.subs) c += it.subs.filter(s => s.done).length;
      return n + c;
    }, 0);
    const subTotal = g.items.reduce((n, it) => n + 1 + (it.subs ? it.subs.length : 0), 0);
    const pct = subTotal ? Math.round((done / subTotal) * 100) : 0;

    return `
      <div class="mpcl-group">
        <div class="mpcl-group-header">
          <span class="mpcl-group-title">${this._esc(g.name)}</span>
          <span class="mpcl-group-pct">${pct}%</span>
          <button class="mpcl-btn-xs mpcl-btn-del" onclick="MsPlannerTaskChecklist.removeGroup(${gi})">✕</button>
        </div>
        <div class="mpcl-progress"><div class="mpcl-progress-bar" style="width:${pct}%"></div></div>
        <div class="mpcl-items">${items.map((it, ii) => {
          const realIdx = g.items.indexOf(it);
          return this._renderItem(it, gi, realIdx, g.items.length);
        }).join('')}
          <div class="mpcl-item-add">
            <input class="mpcl-input-sm" id="mpcl-add-${gi}" placeholder="Add item..." onkeydown="if(event.key==='Enter')MsPlannerTaskChecklist.addItem(${gi})" />
            <button class="mpcl-btn-xs mpcl-btn-go" onclick="MsPlannerTaskChecklist.addItem(${gi})">+</button>
          </div>
        </div>
      </div>`;
  },

  _renderItem(it, gi, ii, total) {
    const subs = it.subs || [];
    const filteredSubs = this.showCompleted ? subs : subs.filter(s => !s.done);
    return `
      <div class="mpcl-item">
        <div class="mpcl-item-row">
          <input type="checkbox" ${it.done ? 'checked' : ''} onchange="MsPlannerTaskChecklist.toggleItem(${gi},${ii})" />
          <span class="mpcl-item-text ${it.done ? 'done' : ''}">${this._esc(it.text)}</span>
          <div class="mpcl-item-actions">
            <button class="mpcl-btn-xs" onclick="MsPlannerTaskChecklist.moveItem(${gi},${ii},-1)" ${ii === 0 ? 'disabled' : ''} title="Move up">▲</button>
            <button class="mpcl-btn-xs" onclick="MsPlannerTaskChecklist.moveItem(${gi},${ii},1)" ${ii === total - 1 ? 'disabled' : ''} title="Move down">▼</button>
            <button class="mpcl-btn-xs mpcl-btn-del" onclick="MsPlannerTaskChecklist.removeItem(${gi},${ii})" title="Delete">✕</button>
          </div>
        </div>
        ${filteredSubs.length ? `<div class="mpcl-subs">${filteredSubs.map(s => {
          const si = subs.indexOf(s);
          return `<div class="mpcl-sub-row">
            <input type="checkbox" ${s.done ? 'checked' : ''} onchange="MsPlannerTaskChecklist.toggleSub(${gi},${ii},${si})" />
            <span class="mpcl-item-text ${s.done ? 'done' : ''}">${this._esc(s.text)}</span>
            <button class="mpcl-btn-xs mpcl-btn-del" onclick="MsPlannerTaskChecklist.removeSub(${gi},${ii},${si})">✕</button>
          </div>`;
        }).join('')}</div>` : ''}
        <div class="mpcl-sub-add">
          <input class="mpcl-input-xs" id="mpcl-sub-${gi}-${ii}" placeholder="Add sub-item..." onkeydown="if(event.key==='Enter')MsPlannerTaskChecklist.addSub(${gi},${ii})" />
          <button class="mpcl-btn-xs mpcl-btn-go" onclick="MsPlannerTaskChecklist.addSub(${gi},${ii})">+</button>
        </div>
      </div>`;
  },

  // ── Actions ──
  toggleShowCompleted() { this.showCompleted = !this.showCompleted; this.render(); },

  addGroup() {
    const el = document.getElementById('mpcl-new-group');
    if (!el?.value.trim()) return;
    this.groups.push({ name: el.value.trim(), items: [] });
    this.render();
  },

  removeGroup(gi) { this.groups.splice(gi, 1); this.render(); },

  addItem(gi) {
    const el = document.getElementById('mpcl-add-' + gi);
    if (!el?.value.trim()) return;
    this.groups[gi].items.push({ text: el.value.trim(), done: false, subs: [] });
    this.render();
  },

  removeItem(gi, ii) { this.groups[gi].items.splice(ii, 1); this.render(); },

  toggleItem(gi, ii) {
    const it = this.groups[gi].items[ii];
    it.done = !it.done;
    if (it.subs) it.subs.forEach(s => s.done = it.done);
    this.render();
  },

  moveItem(gi, ii, dir) {
    const items = this.groups[gi].items;
    const target = ii + dir;
    if (target < 0 || target >= items.length) return;
    [items[ii], items[target]] = [items[target], items[ii]];
    this.render();
  },

  addSub(gi, ii) {
    const el = document.getElementById(`mpcl-sub-${gi}-${ii}`);
    if (!el?.value.trim()) return;
    if (!this.groups[gi].items[ii].subs) this.groups[gi].items[ii].subs = [];
    this.groups[gi].items[ii].subs.push({ text: el.value.trim(), done: false });
    this.render();
  },

  removeSub(gi, ii, si) { this.groups[gi].items[ii].subs.splice(si, 1); this.render(); },

  toggleSub(gi, ii, si) {
    this.groups[gi].items[ii].subs[si].done = !this.groups[gi].items[ii].subs[si].done;
    // If all subs done, mark parent done
    const it = this.groups[gi].items[ii];
    if (it.subs.length && it.subs.every(s => s.done)) it.done = true;
    this.render();
  },

  applyTemplate(name) {
    const tpl = this.TEMPLATES[name];
    if (!tpl) return;
    this.groups.push({ name, items: JSON.parse(JSON.stringify(tpl)) });
    this.render();
  },

  // ── Helpers ──
  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  _escAttr(str) { return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;'); },

  // ── Data Export / Import ──
  exportState() { return { groups: JSON.parse(JSON.stringify(this.groups)), showCompleted: this.showCompleted }; },
  importState(state) {
    if (state.groups) this.groups = state.groups;
    if (typeof state.showCompleted === 'boolean') this.showCompleted = state.showCompleted;
    this.render();
  }
};
