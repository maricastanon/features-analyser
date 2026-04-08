/* ═══════════════════════════════════════════════
   FEATURE: Notification Center — Universal Module
   Centralized notification feed with categories,
   read/unread, and actions. Works for ANY app.
   ═══════════════════════════════════════════════ */
const FeatNotifications = {
  notifications: [],
  filter: 'all',

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.notifications = [
      { id: 1, type: 'mention', title: '@you mentioned in "API Design"', body: '"Can you review the auth flow?"', from: 'Sarah K.', time: '2 min ago', read: false, action: 'View Thread' },
      { id: 2, type: 'update', title: 'Sprint 14 completed', body: 'All 12 tasks delivered. Velocity: 34 SP.', from: 'System', time: '1h ago', read: false, action: 'View Report' },
      { id: 3, type: 'alert', title: 'Build failed on main', body: 'Test suite: 3 failures in auth module.', from: 'CI/CD', time: '3h ago', read: false, action: 'See Logs' },
      { id: 4, type: 'assign', title: 'New task assigned to you', body: '"Implement dark mode toggle"', from: 'Alex M.', time: '5h ago', read: true, action: 'Open Task' },
      { id: 5, type: 'comment', title: 'New comment on PR #247', body: '"LGTM — just one nit on line 42"', from: 'Dev Bot', time: '1d ago', read: true, action: 'View PR' },
      { id: 6, type: 'milestone', title: 'Milestone reached: Beta Launch', body: 'All critical features deployed.', from: 'System', time: '2d ago', read: true, action: 'Celebrate 🎉' }
    ];
  },

  render() {
    const typeConfig = {
      mention:   { emoji: '💬', color: '#3b82f6' },
      update:    { emoji: '📊', color: '#22c55e' },
      alert:     { emoji: '🚨', color: '#ef4444' },
      assign:    { emoji: '📋', color: '#f97316' },
      comment:   { emoji: '💭', color: '#a855f7' },
      milestone: { emoji: '🏆', color: '#eab308' }
    };

    const unread = this.notifications.filter(n => !n.read).length;
    const filtered = this.filter === 'all' ? this.notifications :
      this.filter === 'unread' ? this.notifications.filter(n => !n.read) :
      this.notifications.filter(n => n.type === this.filter);

    this.container.innerHTML = `
    <div class="feat-notif-wrap">
      <div class="notif-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">🔔 Notifications</h3>
        ${unread ? `<span class="notif-badge">${unread}</span>` : ''}
        <button class="notif-btn notif-btn-outline" onclick="FeatNotifications.markAllRead()" style="margin-left:auto">✓ Mark all read</button>
        <button class="notif-btn notif-btn-outline" onclick="FeatNotifications.clearRead()">🧹 Clear read</button>
      </div>
      <div class="notif-filters">
        <button class="notif-filter ${this.filter==='all'?'active':''}" onclick="FeatNotifications.setFilter('all')">All</button>
        <button class="notif-filter ${this.filter==='unread'?'active':''}" onclick="FeatNotifications.setFilter('unread')">Unread${unread?` (${unread})`:''}</button>
        ${Object.entries(typeConfig).map(([k,v]) => `<button class="notif-filter ${this.filter===k?'active':''}"
          onclick="FeatNotifications.setFilter('${k}')">${v.emoji}</button>`).join('')}
      </div>
      <div class="notif-list">
        ${filtered.length ? filtered.map(n => {
          const cfg = typeConfig[n.type] || typeConfig.update;
          return `
          <div class="notif-item ${n.read?'notif-read':''}" onclick="FeatNotifications.toggleRead(${n.id})">
            <div class="notif-icon" style="background:${cfg.color}22;color:${cfg.color}">${cfg.emoji}</div>
            <div class="notif-body">
              <div class="notif-title">${this._esc(n.title)}</div>
              <div class="notif-text">${this._esc(n.body)}</div>
              <div class="notif-meta">
                <span class="notif-from">${this._esc(n.from)}</span>
                <span class="notif-time">${n.time}</span>
              </div>
            </div>
            ${!n.read?'<div class="notif-unread-dot"></div>':''}
            <button class="notif-action" onclick="event.stopPropagation(); alert('${n.action}')">${n.action}</button>
          </div>`;
        }).join('') : '<div style="padding:20px;text-align:center;color:#5a8a60">No notifications</div>'}
      </div>
    </div>`;
  },

  setFilter(f) { this.filter = f; this.render(); },
  toggleRead(id) { const n = this.notifications.find(x => x.id === id); if (n) { n.read = !n.read; this.render(); } },
  markAllRead() { this.notifications.forEach(n => n.read = true); this.render(); },
  clearRead() { this.notifications = this.notifications.filter(n => !n.read); this.render(); },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { notifications: this.notifications }; },
  importState(s) { if (s.notifications) this.notifications = s.notifications; this.render(); }
};
