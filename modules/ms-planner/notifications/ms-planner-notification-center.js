const MsPlannerNotificationCenter = {
  _container: null,
  _notifications: [],
  _nextId: 1,

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  _icons: {
    assigned: '\u{1F4CB}',
    comment: '\u{1F4AC}',
    due: '\u23F0',
    completed: '\u2705',
    mention: '\u{1F4E2}',
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    if (!this._container) return;
    const now = Date.now();
    const hour = 3600000;
    const day = 86400000;
    this._notifications = [
      { id: this._nextId++, type: 'assigned', message: 'Alice assigned "Design mockups" to you', timestamp: now - hour, read: false },
      { id: this._nextId++, type: 'comment', message: 'Bob commented on "API integration"', timestamp: now - 2 * hour, read: false },
      { id: this._nextId++, type: 'due', message: '"Homepage redesign" is due tomorrow', timestamp: now - 4 * hour, read: true },
      { id: this._nextId++, type: 'completed', message: 'Carol completed "Write unit tests"', timestamp: now - day - hour, read: false },
      { id: this._nextId++, type: 'mention', message: 'Dan mentioned you in "Sprint planning"', timestamp: now - day - 3 * hour, read: true },
      { id: this._nextId++, type: 'assigned', message: 'New task "Database migration" assigned', timestamp: now - 3 * day, read: true },
    ];
    this.render();
  },

  _unreadCount() {
    return this._notifications.filter(n => !n.read).length;
  },

  _groupNotifications() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const groups = { Today: [], Yesterday: [], Earlier: [] };
    for (const n of this._notifications) {
      if (n.timestamp >= todayStart) groups.Today.push(n);
      else if (n.timestamp >= yesterdayStart) groups.Yesterday.push(n);
      else groups.Earlier.push(n);
    }
    return groups;
  },

  _formatTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / 86400000) + 'd ago';
  },

  render() {
    const esc = this._escapeHtml.bind(this);
    const unread = this._unreadCount();
    const groups = this._groupNotifications();

    let html = `<div class="mpnc-panel">
      <div class="mpnc-header">
        <span class="mpnc-bell">&#128276;${unread > 0 ? `<span class="mpnc-badge">${unread}</span>` : ''}</span>
        <h2 class="mpnc-title">Notifications</h2>
        <button class="mpnc-btn mpnc-btn-read-all"${unread === 0 ? ' disabled' : ''}>Mark all read</button>
      </div>`;

    for (const [group, items] of Object.entries(groups)) {
      if (items.length === 0) continue;
      html += `<h3 class="mpnc-group-label">${esc(group)}</h3><ul class="mpnc-list">`;
      for (const n of items) {
        const icon = this._icons[n.type] || '\u{1F514}';
        html += `<li class="mpnc-item${n.read ? '' : ' mpnc-unread'}" data-id="${n.id}">
          <span class="mpnc-icon">${icon}</span>
          <div class="mpnc-body">
            <span class="mpnc-message">${esc(n.message)}</span>
            <span class="mpnc-time">${this._formatTime(n.timestamp)}</span>
          </div>
          ${n.read ? '' : '<span class="mpnc-unread-dot"></span>'}
          <button class="mpnc-btn mpnc-btn-delete" title="Delete">&times;</button>
        </li>`;
      }
      html += `</ul>`;
    }

    if (this._notifications.length === 0) {
      html += `<p class="mpnc-empty">No notifications</p>`;
    }
    html += `</div>`;
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    const c = this._container;
    c.querySelector('.mpnc-btn-read-all').addEventListener('click', () => {
      this._notifications.forEach(n => { n.read = true; });
      this.render();
    });
    c.querySelectorAll('.mpnc-item').forEach(li => {
      li.addEventListener('click', (e) => {
        if (e.target.closest('.mpnc-btn-delete')) return;
        const id = Number(li.dataset.id);
        const n = this._notifications.find(x => x.id === id);
        if (n) { n.read = true; this.render(); }
      });
    });
    c.querySelectorAll('.mpnc-btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.closest('.mpnc-item').dataset.id);
        this._notifications = this._notifications.filter(x => x.id !== id);
        this.render();
      });
    });
  },

  addNotification(type, message) {
    this._notifications.unshift({
      id: this._nextId++, type, message,
      timestamp: Date.now(), read: false,
    });
    this.render();
  },

  exportState() {
    return { notifications: JSON.parse(JSON.stringify(this._notifications)), nextId: this._nextId };
  },

  importState(state) {
    if (!state) return;
    if (state.notifications) this._notifications = state.notifications;
    if (state.nextId) this._nextId = state.nextId;
    this.render();
  }
};
