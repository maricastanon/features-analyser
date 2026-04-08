const MsPlannerNotificationSettings = {
  _container: null,
  _types: [
    { key: 'assigned', label: 'Task Assigned' },
    { key: 'comments', label: 'Comments' },
    { key: 'dueDates', label: 'Due Dates' },
    { key: 'completions', label: 'Task Completions' },
    { key: 'mentions', label: 'Mentions' },
  ],
  _settings: {},
  _dnd: false,
  _quietStart: '22:00',
  _quietEnd: '07:00',
  _saved: false,

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    if (!this._container) return;
    this._settings = {};
    for (const t of this._types) {
      this._settings[t.key] = { enabled: true, inApp: true, email: false };
    }
    this._settings.mentions.email = true;
    this.render();
  },

  render() {
    const esc = this._escapeHtml.bind(this);
    let html = `<div class="mpns-panel">
      <h2 class="mpns-title">Notification Settings</h2>
      <div class="mpns-dnd-row">
        <label class="mpns-toggle-label">
          <span class="mpns-dnd-label">Do Not Disturb</span>
          <span class="mpns-switch${this._dnd ? ' mpns-switch-on' : ''}" data-action="dnd">
            <span class="mpns-switch-knob"></span>
          </span>
        </label>
      </div>
      <div class="mpns-quiet-row">
        <span class="mpns-quiet-label">Quiet Hours</span>
        <input type="time" class="mpns-time mpns-quiet-start" value="${esc(this._quietStart)}" />
        <span class="mpns-quiet-sep">to</span>
        <input type="time" class="mpns-time mpns-quiet-end" value="${esc(this._quietEnd)}" />
      </div>
      <table class="mpns-table">
        <thead>
          <tr>
            <th class="mpns-th">Notification Type</th>
            <th class="mpns-th">Enabled</th>
            <th class="mpns-th">In-App</th>
            <th class="mpns-th">Email</th>
          </tr>
        </thead>
        <tbody>`;

    for (const t of this._types) {
      const s = this._settings[t.key];
      html += `<tr class="mpns-row" data-key="${t.key}">
        <td class="mpns-type-cell">${esc(t.label)}</td>
        <td class="mpns-cell"><span class="mpns-switch${s.enabled ? ' mpns-switch-on' : ''}" data-field="enabled"><span class="mpns-switch-knob"></span></span></td>
        <td class="mpns-cell"><span class="mpns-switch${s.inApp ? ' mpns-switch-on' : ''}${!s.enabled ? ' mpns-switch-disabled' : ''}" data-field="inApp"><span class="mpns-switch-knob"></span></span></td>
        <td class="mpns-cell"><span class="mpns-switch${s.email ? ' mpns-switch-on' : ''}${!s.enabled ? ' mpns-switch-disabled' : ''}" data-field="email"><span class="mpns-switch-knob"></span></span></td>
      </tr>`;
    }

    html += `</tbody></table>
      <div class="mpns-actions">
        <button class="mpns-btn mpns-btn-save">Save Settings</button>
        ${this._saved ? '<span class="mpns-saved-msg">Settings saved!</span>' : ''}
      </div>
    </div>`;
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    const c = this._container;
    c.querySelector('[data-action="dnd"]').addEventListener('click', () => {
      this._dnd = !this._dnd;
      this._saved = false;
      this.render();
    });
    c.querySelector('.mpns-quiet-start').addEventListener('change', (e) => {
      this._quietStart = e.target.value;
      this._saved = false;
    });
    c.querySelector('.mpns-quiet-end').addEventListener('change', (e) => {
      this._quietEnd = e.target.value;
      this._saved = false;
    });
    c.querySelectorAll('.mpns-row').forEach(row => {
      const key = row.dataset.key;
      row.querySelectorAll('.mpns-switch').forEach(sw => {
        if (sw.classList.contains('mpns-switch-disabled')) return;
        sw.addEventListener('click', () => {
          const field = sw.dataset.field;
          this._settings[key][field] = !this._settings[key][field];
          this._saved = false;
          this.render();
        });
      });
    });
    c.querySelector('.mpns-btn-save').addEventListener('click', () => {
      this._saved = true;
      this.render();
    });
  },

  exportState() {
    return {
      settings: JSON.parse(JSON.stringify(this._settings)),
      dnd: this._dnd,
      quietStart: this._quietStart,
      quietEnd: this._quietEnd,
    };
  },

  importState(state) {
    if (!state) return;
    if (state.settings) this._settings = state.settings;
    if (typeof state.dnd === 'boolean') this._dnd = state.dnd;
    if (state.quietStart) this._quietStart = state.quietStart;
    if (state.quietEnd) this._quietEnd = state.quietEnd;
    this.render();
  }
};
