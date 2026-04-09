/* ═══════════════════════════════════════════════
   MS PLANNER: Quick Access — JS Module
   Pinned tasks, recent items, bookmarks with labels,
   quick-jump input, keyboard shortcut hint, tabbed UI
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerQuickAccess = {
  container: null,
  activeTab: 'pinned',
  pinned: [],
  recent: [],
  bookmarks: [],
  jumpQuery: '',
  jumpResults: [],
  maxRecent: 10,

  _sampleTasks: [
    { id: 'T-001', title: 'Design homepage mockup', plan: 'Website Redesign', status: 'In Progress' },
    { id: 'T-002', title: 'Fix login redirect bug', plan: 'Website Redesign', status: 'Not Started' },
    { id: 'T-003', title: 'Write API documentation', plan: 'Backend Sprint', status: 'Completed' },
    { id: 'T-004', title: 'Database migration script', plan: 'Backend Sprint', status: 'In Progress' },
    { id: 'T-005', title: 'Design system components', plan: 'Design Ops', status: 'In Progress' },
    { id: 'T-006', title: 'Onboarding flow redesign', plan: 'Design Ops', status: 'Not Started' },
    { id: 'T-007', title: 'Fix notification delivery', plan: 'Backend Sprint', status: 'Completed' },
    { id: 'T-008', title: 'Homepage performance audit', plan: 'Website Redesign', status: 'Not Started' }
  ],

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    if (!this.pinned.length) this.pinned = [this._sampleTasks[0].id, this._sampleTasks[3].id];
    if (!this.recent.length) this.recent = [this._sampleTasks[0].id, this._sampleTasks[1].id, this._sampleTasks[4].id];
    if (!this.bookmarks.length) this.bookmarks = [{ id: this._sampleTasks[2].id, label: 'API Docs Reference' }];
    this.render();
  },

  render() {
    if (!this.container) return;
    const tabs = ['pinned', 'recent', 'bookmarks'];

    this.container.innerHTML = `
      <div class="mpqa-wrapper">
        <div class="mpqa-header">
          <div class="mpqa-title">Quick Access</div>
          <div class="mpqa-shortcut-hint">Ctrl+K to jump</div>
        </div>

        <div class="mpqa-jump-bar">
          <input class="mpqa-jump-input" type="text" placeholder="Jump to task (ID or name)..."
            value="${this._escAttr(this.jumpQuery)}"
            oninput="MsPlannerQuickAccess._onJump(this.value)" />
        </div>

        ${this.jumpQuery && this.jumpResults.length ? `
          <div class="mpqa-jump-results">
            ${this.jumpResults.map(t => `
              <div class="mpqa-jump-item" onclick="MsPlannerQuickAccess._viewTask('${this._escAttr(t.id)}')">
                <span class="mpqa-jump-id">${this._esc(t.id)}</span> ${this._esc(t.title)}
              </div>`).join('')}
          </div>` : ''}
        ${this.jumpQuery && !this.jumpResults.length ? '<div class="mpqa-jump-empty">No matching tasks.</div>' : ''}

        <div class="mpqa-tabs">
          ${tabs.map(tab => `
            <button class="mpqa-tab ${this.activeTab === tab ? 'mpqa-tab--active' : ''}"
              onclick="MsPlannerQuickAccess._setTab('${tab}')">${tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span class="mpqa-tab-count">${this._countForTab(tab)}</span>
            </button>`).join('')}
        </div>

        <div class="mpqa-content">
          ${this.activeTab === 'pinned' ? this._renderPinned() : ''}
          ${this.activeTab === 'recent' ? this._renderRecent() : ''}
          ${this.activeTab === 'bookmarks' ? this._renderBookmarks() : ''}
        </div>
      </div>`;
  },

  _renderPinned() {
    const items = this.pinned.map(id => this._sampleTasks.find(t => t.id === id)).filter(Boolean);
    if (!items.length) return '<div class="mpqa-empty">No pinned tasks. Star a task to pin it here.</div>';
    return items.map(t => `
      <div class="mpqa-item">
        <button class="mpqa-star mpqa-star--active" onclick="MsPlannerQuickAccess._unpin('${this._escAttr(t.id)}')">&#9733;</button>
        <div class="mpqa-item-body" onclick="MsPlannerQuickAccess._viewTask('${this._escAttr(t.id)}')">
          <div class="mpqa-item-title">${this._esc(t.title)}</div>
          <div class="mpqa-item-meta">${this._esc(t.plan)} &middot; ${this._esc(t.status)}</div>
        </div>
      </div>`).join('');
  },

  _renderRecent() {
    const items = this.recent.map(id => this._sampleTasks.find(t => t.id === id)).filter(Boolean);
    if (!items.length) return '<div class="mpqa-empty">No recently viewed tasks.</div>';
    return items.map(t => `
      <div class="mpqa-item">
        <button class="mpqa-star ${this.pinned.includes(t.id) ? 'mpqa-star--active' : ''}"
          onclick="MsPlannerQuickAccess._togglePin('${this._escAttr(t.id)}')">
          ${this.pinned.includes(t.id) ? '&#9733;' : '&#9734;'}
        </button>
        <div class="mpqa-item-body" onclick="MsPlannerQuickAccess._viewTask('${this._escAttr(t.id)}')">
          <div class="mpqa-item-title">${this._esc(t.title)}</div>
          <div class="mpqa-item-meta">${this._esc(t.plan)} &middot; ${this._esc(t.status)}</div>
        </div>
      </div>`).join('');
  },

  _renderBookmarks() {
    const html = this.bookmarks.map((bm, i) => {
      const t = this._sampleTasks.find(x => x.id === bm.id);
      if (!t) return '';
      return `
        <div class="mpqa-item">
          <div class="mpqa-bookmark-icon">&#128278;</div>
          <div class="mpqa-item-body" onclick="MsPlannerQuickAccess._viewTask('${this._escAttr(t.id)}')">
            <div class="mpqa-item-title">${this._esc(bm.label || t.title)}</div>
            <div class="mpqa-item-meta">${this._esc(t.title)} &middot; ${this._esc(t.plan)}</div>
          </div>
          <button class="mpqa-remove" onclick="MsPlannerQuickAccess._removeBookmark(${i})">&#10005;</button>
        </div>`;
    }).join('');

    return html + `
      <div class="mpqa-add-bookmark">
        <select class="mpqa-bm-select" id="mpqa-bm-task">
          <option value="">Select task...</option>
          ${this._sampleTasks.filter(t => !this.bookmarks.find(b => b.id === t.id)).map(t =>
            `<option value="${this._escAttr(t.id)}">${this._esc(t.title)}</option>`).join('')}
        </select>
        <input class="mpqa-bm-label" id="mpqa-bm-label" placeholder="Custom label..." />
        <button class="mpqa-btn" onclick="MsPlannerQuickAccess._addBookmark()">Add</button>
      </div>`;
  },

  _setTab(tab) { this.activeTab = tab; this.render(); },

  _countForTab(tab) {
    if (tab === 'pinned') return this.pinned.length;
    if (tab === 'recent') return this.recent.length;
    return this.bookmarks.length;
  },

  _togglePin(id) {
    const idx = this.pinned.indexOf(id);
    idx === -1 ? this.pinned.push(id) : this.pinned.splice(idx, 1);
    this.render();
  },

  _unpin(id) { this.pinned = this.pinned.filter(p => p !== id); this.render(); },

  _viewTask(id) {
    this.recent = [id, ...this.recent.filter(r => r !== id)].slice(0, this.maxRecent);
    this.render();
  },

  _removeBookmark(i) { this.bookmarks.splice(i, 1); this.render(); },

  _addBookmark() {
    const taskEl = document.getElementById('mpqa-bm-task');
    const labelEl = document.getElementById('mpqa-bm-label');
    if (!taskEl || !taskEl.value) return;
    const t = this._sampleTasks.find(x => x.id === taskEl.value);
    if (!t) return;
    this.bookmarks.push({ id: t.id, label: (labelEl?.value || '').trim() || t.title });
    this.render();
  },

  _onJump(val) {
    this.jumpQuery = val;
    const lower = val.toLowerCase().trim();
    this.jumpResults = lower ? this._sampleTasks.filter(t =>
      t.id.toLowerCase().includes(lower) || t.title.toLowerCase().includes(lower)
    ).slice(0, 5) : [];
    this.render();
    this.container.querySelector('.mpqa-jump-input')?.focus();
  },

  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  _escAttr(str) { return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },

  exportState() {
    return {
      activeTab: this.activeTab,
      pinned: [...this.pinned],
      recent: [...this.recent],
      bookmarks: JSON.parse(JSON.stringify(this.bookmarks))
    };
  },

  importState(state) {
    if (!state) return;
    this.activeTab = state.activeTab || 'pinned';
    this.pinned = state.pinned || [];
    this.recent = state.recent || [];
    this.bookmarks = state.bookmarks || [];
    this.render();
  }
};
