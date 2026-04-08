const MsPlannerTemplateLibrary = {
  container: null,
  searchQuery: '',
  activeCategory: 'All',
  selectedId: null,
  categories: ['All', 'Development', 'Marketing', 'HR', 'General'],
  templates: [
    { id: 1, name: 'Sprint Planning', icon: '\u{1F3C3}', desc: 'Organize sprints with backlog, in-progress, review, and done buckets.', buckets: 4, tasks: 12, category: 'Development' },
    { id: 2, name: 'Marketing Campaign', icon: '\u{1F4E3}', desc: 'Plan campaigns from ideation through execution and analysis.', buckets: 5, tasks: 15, category: 'Marketing' },
    { id: 3, name: 'Product Launch', icon: '\u{1F680}', desc: 'Coordinate cross-team launch activities and milestones.', buckets: 6, tasks: 20, category: 'General' },
    { id: 4, name: 'Event Planning', icon: '\u{1F389}', desc: 'Manage venues, vendors, logistics, and day-of coordination.', buckets: 5, tasks: 18, category: 'General' },
    { id: 5, name: 'Hiring Pipeline', icon: '\u{1F465}', desc: 'Track candidates from sourcing through onboarding.', buckets: 5, tasks: 10, category: 'HR' },
    { id: 6, name: 'Bug Bash', icon: '\u{1F41B}', desc: 'Triage, assign, and track bugs through resolution.', buckets: 4, tasks: 8, category: 'Development' }
  ],

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.searchQuery = '';
    this.activeCategory = 'All';
    this.selectedId = null;
    this.render();
  },

  getFiltered() {
    return this.templates.filter(t => {
      const matchCat = this.activeCategory === 'All' || t.category === this.activeCategory;
      const matchSearch = !this.searchQuery || t.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  },

  render() {
    if (!this.container) return;
    const filtered = this.getFiltered();

    let html = `<div class="ptl-panel">
      <div class="ptl-header"><h3>Template Library</h3></div>
      <div class="ptl-search">
        <input type="text" class="ptl-search-input" placeholder="Search templates..." value="${this._esc(this.searchQuery)}" data-ref="search" />
      </div>
      <div class="ptl-categories">
        ${this.categories.map(c => `<button class="ptl-cat-tab ${c === this.activeCategory ? 'ptl-cat-active' : ''}" data-action="category" data-cat="${this._esc(c)}">${this._esc(c)}</button>`).join('')}
      </div>
      <div class="ptl-grid">`;

    if (filtered.length === 0) {
      html += `<div class="ptl-empty">No templates match your search.</div>`;
    }

    filtered.forEach(t => {
      const selected = t.id === this.selectedId ? ' ptl-card-selected' : '';
      html += `<div class="ptl-card${selected}" data-action="select" data-id="${t.id}">
        <div class="ptl-card-icon">${t.icon}</div>
        <div class="ptl-card-body">
          <div class="ptl-card-name">${this._esc(t.name)}</div>
          <div class="ptl-card-desc">${this._esc(t.desc)}</div>
          <div class="ptl-card-meta">
            <span>${t.buckets} buckets</span>
            <span>${t.tasks} tasks</span>
          </div>
        </div>
        ${t.id === this.selectedId ? `<button class="ptl-apply-btn" data-action="apply" data-id="${t.id}">Apply Template</button>` : ''}
      </div>`;
    });

    html += `</div></div>`;
    this.container.innerHTML = html;

    this.container.oninput = (e) => {
      if (e.target.dataset.ref === 'search') {
        this.searchQuery = e.target.value;
        this.render();
        const input = this.container.querySelector('[data-ref="search"]');
        if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
      }
    };

    this.container.onclick = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;
      if (action === 'category') { this.activeCategory = el.dataset.cat; this.render(); }
      else if (action === 'select') { this.selectedId = Number(el.dataset.id); this.render(); }
      else if (action === 'apply') { /* apply placeholder */ }
    };
  },

  exportState() {
    return { searchQuery: this.searchQuery, activeCategory: this.activeCategory, selectedId: this.selectedId };
  },

  importState(state) {
    if (!state) return;
    this.searchQuery = state.searchQuery || '';
    this.activeCategory = state.activeCategory || 'All';
    this.selectedId = state.selectedId ?? null;
    this.render();
  }
};
