/* ═══════════════════════════════════════════════════════════════
   Categories — User-defined feature categories
   Reads from active project config. Renders sub-tab filter bar.
   ═══════════════════════════════════════════════════════════════ */
const Categories = {
  _current: 'all',

  getAll() {
    if (!App.currentProject) return [];
    return App.currentProject.categories || [];
  },

  getById(id) {
    return this.getAll().find(c => c.id === id) || null;
  },

  getCurrent() { return this._current; },

  setCurrent(catId) {
    this._current = catId;
    this.renderTabs();
    EventBus.emit('category:changed', catId);
  },

  renderTabs() {
    const container = DOM.el('featureSubTabs');
    if (!container) return;

    const cats = this.getAll();
    const allCount = ''; // Could add count if needed

    let html = `<button class="sub-tab ${this._current === 'all' ? 'active' : ''}"
                  onclick="Categories.setCurrent('all')">🌟 All</button>`;

    cats.forEach(c => {
      html += `<button class="sub-tab ${this._current === c.id ? 'active' : ''}"
                 onclick="Categories.setCurrent('${c.id}')"
                 style="${this._current === c.id ? 'background:' + c.color + ';border-color:' + c.color : ''}"
                 >${c.emoji} ${DOM.esc(c.name)}</button>`;
    });

    container.innerHTML = html;
  }
};
