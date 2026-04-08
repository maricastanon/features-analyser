const MsPlannerMemberRoles = {
  _container: null,
  _roles: ['Owner', 'Member', 'Guest'],
  _permissions: ['Create tasks', 'Edit tasks', 'Delete tasks', 'Manage members', 'Manage plan', 'View only'],
  _matrix: {},
  _customRoles: [],
  _members: [],
  _nextMemberId: 1,
  _showAddRole: false,

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    if (!this._container) return;
    this._matrix = {
      Owner:  { 'Create tasks': true, 'Edit tasks': true, 'Delete tasks': true, 'Manage members': true, 'Manage plan': true, 'View only': true },
      Member: { 'Create tasks': true, 'Edit tasks': true, 'Delete tasks': false, 'Manage members': false, 'Manage plan': false, 'View only': true },
      Guest:  { 'Create tasks': false, 'Edit tasks': false, 'Delete tasks': false, 'Manage members': false, 'Manage plan': false, 'View only': true },
    };
    this._members = [
      { id: this._nextMemberId++, name: 'Alice Johnson', role: 'Owner' },
      { id: this._nextMemberId++, name: 'Bob Smith', role: 'Member' },
      { id: this._nextMemberId++, name: 'Carol Davis', role: 'Guest' },
    ];
    this.render();
  },

  _allRoles() {
    return [...this._roles, ...this._customRoles];
  },

  render() {
    const esc = this._escapeHtml.bind(this);
    const roles = this._allRoles();
    let html = `<div class="mpr-panel">
      <h2 class="mpr-title">Role Permissions</h2>
      <table class="mpr-table">
        <thead><tr><th class="mpr-th-perm">Permission</th>`;
    for (const role of roles) {
      html += `<th class="mpr-th-role">${esc(role)}</th>`;
    }
    html += `</tr></thead><tbody>`;

    for (const perm of this._permissions) {
      html += `<tr><td class="mpr-perm-label">${esc(perm)}</td>`;
      for (const role of roles) {
        const checked = this._matrix[role] && this._matrix[role][perm] ? 'checked' : '';
        html += `<td class="mpr-cell"><input type="checkbox" class="mpr-check" data-role="${esc(role)}" data-perm="${esc(perm)}" ${checked} /></td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table>`;

    if (this._showAddRole) {
      html += `<div class="mpr-add-role-form">
        <input type="text" class="mpr-input mpr-new-role-name" placeholder="Custom role name" />
        <button class="mpr-btn mpr-btn-confirm-role">Create</button>
        <button class="mpr-btn mpr-btn-cancel-role">Cancel</button>
      </div>`;
    } else {
      html += `<button class="mpr-btn mpr-btn-add-role">+ Custom Role</button>`;
    }

    html += `<h3 class="mpr-subtitle">Assign Roles to Members</h3>
      <ul class="mpr-member-list">`;
    for (const m of this._members) {
      html += `<li class="mpr-member-item" data-id="${m.id}">
        <span class="mpr-member-name">${esc(m.name)}</span>
        <select class="mpr-role-select" data-member-id="${m.id}">`;
      for (const role of roles) {
        html += `<option value="${esc(role)}"${m.role === role ? ' selected' : ''}>${esc(role)}</option>`;
      }
      html += `</select></li>`;
    }
    html += `</ul></div>`;
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    const c = this._container;
    c.querySelectorAll('.mpr-check').forEach(cb => {
      cb.addEventListener('change', () => {
        const role = cb.dataset.role;
        const perm = cb.dataset.perm;
        if (!this._matrix[role]) this._matrix[role] = {};
        this._matrix[role][perm] = cb.checked;
      });
    });
    const addBtn = c.querySelector('.mpr-btn-add-role');
    if (addBtn) {
      addBtn.addEventListener('click', () => { this._showAddRole = true; this.render(); });
    }
    const confirmBtn = c.querySelector('.mpr-btn-confirm-role');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const name = c.querySelector('.mpr-new-role-name').value.trim();
        if (name && !this._allRoles().includes(name)) {
          this._customRoles.push(name);
          this._matrix[name] = {};
          this._permissions.forEach(p => { this._matrix[name][p] = false; });
        }
        this._showAddRole = false;
        this.render();
      });
    }
    const cancelBtn = c.querySelector('.mpr-btn-cancel-role');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => { this._showAddRole = false; this.render(); });
    }
    c.querySelectorAll('.mpr-role-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = Number(sel.dataset.memberId);
        const m = this._members.find(x => x.id === id);
        if (m) m.role = sel.value;
      });
    });
  },

  exportState() {
    return {
      matrix: JSON.parse(JSON.stringify(this._matrix)),
      customRoles: [...this._customRoles],
      members: JSON.parse(JSON.stringify(this._members)),
      nextMemberId: this._nextMemberId,
    };
  },

  importState(state) {
    if (!state) return;
    if (state.matrix) this._matrix = state.matrix;
    if (state.customRoles) this._customRoles = state.customRoles;
    if (state.members) this._members = state.members;
    if (state.nextMemberId) this._nextMemberId = state.nextMemberId;
    this.render();
  }
};
