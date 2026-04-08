const MsPlannerNotificationBadges = {
  _container: null,
  _badges: {},
  _nextId: 1,
  _newDots: {},
  _showAddForm: false,

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    if (!this._container) return;
    this._badges = {
      tasks: { label: 'Tasks', count: 3 },
      comments: { label: 'Comments', count: 5 },
      mentions: { label: 'Mentions', count: 2 },
    };
    this._newDots = { tasks: true, comments: false, mentions: true };
    this.render();
  },

  render() {
    const esc = this._escapeHtml.bind(this);
    const keys = Object.keys(this._badges);
    const total = keys.reduce((s, k) => s + this._badges[k].count, 0);

    let html = `<div class="mpnb-panel">
      <h2 class="mpnb-title">Badge Manager</h2>

      <div class="mpnb-section">
        <h3 class="mpnb-subtitle">Tabs with Badges</h3>
        <div class="mpnb-tabs">`;
    for (const key of keys) {
      const b = this._badges[key];
      html += `<button class="mpnb-tab" data-key="${esc(key)}">
        ${esc(b.label)}
        ${b.count > 0 ? `<span class="mpnb-count-badge">${b.count}</span>` : ''}
        ${this._newDots[key] ? '<span class="mpnb-pulse-dot"></span>' : ''}
      </button>`;
    }
    html += `</div></div>

      <div class="mpnb-section">
        <h3 class="mpnb-subtitle">Buttons with Badges</h3>
        <div class="mpnb-buttons">`;
    for (const key of keys) {
      const b = this._badges[key];
      html += `<button class="mpnb-demo-btn" data-key="${esc(key)}">
        ${esc(b.label)}
        ${b.count > 0 ? `<span class="mpnb-count-badge">${b.count}</span>` : ''}
      </button>`;
    }
    html += `</div></div>

      <div class="mpnb-section">
        <h3 class="mpnb-subtitle">Avatar with Badge</h3>
        <div class="mpnb-avatar-area">
          <div class="mpnb-avatar">U
            ${total > 0 ? `<span class="mpnb-count-badge mpnb-avatar-badge">${total}</span>` : ''}
            ${Object.values(this._newDots).some(v => v) ? '<span class="mpnb-pulse-dot mpnb-avatar-dot"></span>' : ''}
          </div>
        </div>
      </div>

      <div class="mpnb-section">
        <h3 class="mpnb-subtitle">Manage Badges</h3>
        <table class="mpnb-manage-table">
          <thead><tr>
            <th class="mpnb-th">Badge</th><th class="mpnb-th">Count</th><th class="mpnb-th">New Dot</th><th class="mpnb-th">Actions</th>
          </tr></thead><tbody>`;
    for (const key of keys) {
      const b = this._badges[key];
      html += `<tr class="mpnb-manage-row" data-key="${esc(key)}">
        <td class="mpnb-cell">${esc(b.label)}</td>
        <td class="mpnb-cell">
          <input type="number" class="mpnb-count-input" min="0" value="${b.count}" />
        </td>
        <td class="mpnb-cell">
          <span class="mpnb-toggle${this._newDots[key] ? ' mpnb-toggle-on' : ''}" data-key="${esc(key)}">
            <span class="mpnb-toggle-knob"></span>
          </span>
        </td>
        <td class="mpnb-cell">
          <button class="mpnb-btn mpnb-btn-clear" data-key="${esc(key)}">Clear</button>
        </td>
      </tr>`;
    }
    html += `</tbody></table>`;

    if (this._showAddForm) {
      html += `<div class="mpnb-add-form">
        <input type="text" class="mpnb-input mpnb-new-key" placeholder="Key (e.g. alerts)" />
        <input type="text" class="mpnb-input mpnb-new-label" placeholder="Label" />
        <input type="number" class="mpnb-input mpnb-new-count" placeholder="Count" min="0" value="1" />
        <button class="mpnb-btn mpnb-btn-confirm-add">Add</button>
        <button class="mpnb-btn mpnb-btn-cancel-add">Cancel</button>
      </div>`;
    } else {
      html += `<div class="mpnb-add-row">
        <button class="mpnb-btn mpnb-btn-add-badge">+ Add Badge</button>
        <button class="mpnb-btn mpnb-btn-clear-all">Clear All</button>
      </div>`;
    }

    html += `</div></div>`;
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    const c = this._container;
    c.querySelectorAll('.mpnb-count-input').forEach(input => {
      input.addEventListener('change', () => {
        const key = input.closest('.mpnb-manage-row').dataset.key;
        this._badges[key].count = Math.max(0, parseInt(input.value, 10) || 0);
        this.render();
      });
    });
    c.querySelectorAll('.mpnb-toggle').forEach(tog => {
      tog.addEventListener('click', () => {
        const key = tog.dataset.key;
        this._newDots[key] = !this._newDots[key];
        this.render();
      });
    });
    c.querySelectorAll('.mpnb-btn-clear').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        this._badges[key].count = 0;
        this._newDots[key] = false;
        this.render();
      });
    });
    const clearAll = c.querySelector('.mpnb-btn-clear-all');
    if (clearAll) {
      clearAll.addEventListener('click', () => {
        for (const key of Object.keys(this._badges)) {
          this._badges[key].count = 0;
          this._newDots[key] = false;
        }
        this.render();
      });
    }
    const addBtn = c.querySelector('.mpnb-btn-add-badge');
    if (addBtn) {
      addBtn.addEventListener('click', () => { this._showAddForm = true; this.render(); });
    }
    const confirmAdd = c.querySelector('.mpnb-btn-confirm-add');
    if (confirmAdd) {
      confirmAdd.addEventListener('click', () => {
        const key = c.querySelector('.mpnb-new-key').value.trim().toLowerCase().replace(/\s+/g, '_');
        const label = c.querySelector('.mpnb-new-label').value.trim();
        const count = parseInt(c.querySelector('.mpnb-new-count').value, 10) || 0;
        if (key && label && !this._badges[key]) {
          this._badges[key] = { label, count };
          this._newDots[key] = count > 0;
        }
        this._showAddForm = false;
        this.render();
      });
    }
    const cancelAdd = c.querySelector('.mpnb-btn-cancel-add');
    if (cancelAdd) {
      cancelAdd.addEventListener('click', () => { this._showAddForm = false; this.render(); });
    }
  },

  exportState() {
    return {
      badges: JSON.parse(JSON.stringify(this._badges)),
      newDots: { ...this._newDots },
    };
  },

  importState(state) {
    if (!state) return;
    if (state.badges) this._badges = state.badges;
    if (state.newDots) this._newDots = state.newDots;
    this.render();
  }
};
