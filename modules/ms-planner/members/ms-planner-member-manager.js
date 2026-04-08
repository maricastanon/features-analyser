const MsPlannerMemberManager = {
  _container: null,
  _members: [],
  _nextId: 1,
  _searchQuery: '',
  _editingId: null,

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  _avatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const colors = ['#e91e63', '#9c27b0', '#3f51b5', '#009688', '#ff9800', '#607d8b'];
    return colors[Math.abs(hash) % colors.length];
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    if (!this._container) return;
    this._members = [
      { id: this._nextId++, name: 'Alice Johnson', email: 'alice@example.com', role: 'Owner', online: true },
      { id: this._nextId++, name: 'Bob Smith', email: 'bob@example.com', role: 'Member', online: false },
      { id: this._nextId++, name: 'Carol Davis', email: 'carol@example.com', role: 'Guest', online: true },
    ];
    this.render();
  },

  _filteredMembers() {
    const q = this._searchQuery.toLowerCase();
    return q ? this._members.filter(m => m.name.toLowerCase().includes(q)) : this._members;
  },

  render() {
    const members = this._filteredMembers();
    const esc = this._escapeHtml.bind(this);
    let html = `<div class="mpm-panel">
      <h2 class="mpm-title">Team Members</h2>
      <input type="text" class="mpm-search" placeholder="Search members..." value="${esc(this._searchQuery)}" />
      <div class="mpm-add-form">
        <input type="text" class="mpm-input mpm-add-name" placeholder="Name" />
        <input type="email" class="mpm-input mpm-add-email" placeholder="Email" />
        <select class="mpm-select mpm-add-role">
          <option value="Owner">Owner</option><option value="Member" selected>Member</option><option value="Guest">Guest</option>
        </select>
        <button class="mpm-btn mpm-btn-add">Add Member</button>
      </div>
      <ul class="mpm-list">`;

    for (const m of members) {
      const initial = m.name.charAt(0).toUpperCase();
      const color = this._avatarColor(m.name);
      const statusCls = m.online ? 'mpm-status-online' : 'mpm-status-offline';
      if (this._editingId === m.id) {
        html += `<li class="mpm-item mpm-item-editing" data-id="${m.id}">
          <input type="text" class="mpm-input mpm-edit-name" value="${esc(m.name)}" />
          <input type="email" class="mpm-input mpm-edit-email" value="${esc(m.email)}" />
          <select class="mpm-select mpm-edit-role">
            <option value="Owner"${m.role === 'Owner' ? ' selected' : ''}>Owner</option>
            <option value="Member"${m.role === 'Member' ? ' selected' : ''}>Member</option>
            <option value="Guest"${m.role === 'Guest' ? ' selected' : ''}>Guest</option>
          </select>
          <button class="mpm-btn mpm-btn-save">Save</button>
          <button class="mpm-btn mpm-btn-cancel">Cancel</button>
        </li>`;
      } else {
        html += `<li class="mpm-item" data-id="${m.id}">
          <span class="mpm-avatar" style="background:${color}">${initial}<span class="mpm-status-dot ${statusCls}"></span></span>
          <div class="mpm-info">
            <span class="mpm-name">${esc(m.name)}</span>
            <span class="mpm-email">${esc(m.email)}</span>
          </div>
          <span class="mpm-role-badge mpm-role-${m.role.toLowerCase()}">${esc(m.role)}</span>
          <button class="mpm-btn mpm-btn-edit">Edit</button>
          <button class="mpm-btn mpm-btn-remove">Remove</button>
        </li>`;
      }
    }
    html += `</ul></div>`;
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    const c = this._container;
    c.querySelector('.mpm-search').addEventListener('input', e => {
      this._searchQuery = e.target.value;
      this.render();
    });
    c.querySelector('.mpm-btn-add').addEventListener('click', () => {
      const name = c.querySelector('.mpm-add-name').value.trim();
      const email = c.querySelector('.mpm-add-email').value.trim();
      const role = c.querySelector('.mpm-add-role').value;
      if (!name || !email) return;
      this._members.push({ id: this._nextId++, name, email, role, online: false });
      this.render();
    });
    c.querySelectorAll('.mpm-btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        this._editingId = Number(btn.closest('.mpm-item').dataset.id);
        this.render();
      });
    });
    c.querySelectorAll('.mpm-btn-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const li = btn.closest('.mpm-item');
        const id = Number(li.dataset.id);
        const m = this._members.find(x => x.id === id);
        if (m) {
          m.name = li.querySelector('.mpm-edit-name').value.trim() || m.name;
          m.email = li.querySelector('.mpm-edit-email').value.trim() || m.email;
          m.role = li.querySelector('.mpm-edit-role').value;
        }
        this._editingId = null;
        this.render();
      });
    });
    c.querySelectorAll('.mpm-btn-cancel').forEach(btn => {
      btn.addEventListener('click', () => { this._editingId = null; this.render(); });
    });
    c.querySelectorAll('.mpm-btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const li = btn.closest('.mpm-item');
        const id = Number(li.dataset.id);
        li.classList.add('mpm-confirm-remove');
        btn.textContent = 'Confirm?';
        btn.addEventListener('click', () => {
          this._members = this._members.filter(x => x.id !== id);
          this.render();
        }, { once: true });
      });
    });
  },

  exportState() {
    return { members: JSON.parse(JSON.stringify(this._members)), nextId: this._nextId };
  },

  importState(state) {
    if (state && state.members) {
      this._members = state.members;
      this._nextId = state.nextId || this._members.length + 1;
      this.render();
    }
  }
};
