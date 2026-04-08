const MsPlannerChartWorkload = {
  _container: null,
  _members: [],

  _sampleData() {
    this._members = [
      { id: 1, name: 'Alice Chen', overdue: 2, dueSoon: 3, onTrack: 5, capacity: 12 },
      { id: 2, name: 'Bob Martinez', overdue: 0, dueSoon: 4, onTrack: 6, capacity: 12 },
      { id: 3, name: 'Carol Singh', overdue: 1, dueSoon: 1, onTrack: 3, capacity: 8 },
      { id: 4, name: 'David Kim', overdue: 3, dueSoon: 2, onTrack: 2, capacity: 10 },
      { id: 5, name: 'Emma Wilson', overdue: 0, dueSoon: 0, onTrack: 4, capacity: 8 },
    ];
  },

  _esc(str) {
    const el = document.createElement('span'); el.textContent = str; return el.innerHTML;
  },

  _nextId() {
    return this._members.length ? Math.max(...this._members.map(m => m.id)) + 1 : 1;
  },

  _totalTasks(m) { return m.overdue + m.dueSoon + m.onTrack; },

  _avgWorkload() {
    if (!this._members.length) return 0;
    return (this._members.reduce((s, m) => s + this._totalTasks(m), 0) / this._members.length).toFixed(1);
  },

  _maxVal() {
    return Math.max(...this._members.map(m => Math.max(this._totalTasks(m), m.capacity)), 1);
  },

  _deleteMember(id) {
    this._members = this._members.filter(m => m.id !== id);
    this.render();
  },

  _updateMember(id, field, value) {
    const m = this._members.find(m => m.id === id);
    if (m) { m[field] = Math.max(0, parseInt(value) || 0); this.render(); }
  },

  _addMember() {
    const form = this._container.querySelector('.mcw-add-form');
    const name = form.querySelector('.mcw-add-name').value.trim();
    if (!name) return;
    const overdue = parseInt(form.querySelector('.mcw-add-overdue').value) || 0;
    const dueSoon = parseInt(form.querySelector('.mcw-add-duesoon').value) || 0;
    const onTrack = parseInt(form.querySelector('.mcw-add-ontrack').value) || 0;
    const capacity = parseInt(form.querySelector('.mcw-add-capacity').value) || 10;
    this._members.push({ id: this._nextId(), name, overdue, dueSoon, onTrack, capacity });
    this.render();
  },

  _renderMemberBar(m) {
    const max = this._maxVal();
    const total = this._totalTasks(m);
    const overduePct = (m.overdue / max * 100);
    const dueSoonPct = (m.dueSoon / max * 100);
    const onTrackPct = (m.onTrack / max * 100);
    const capPct = (m.capacity / max * 100);
    const overCapacity = total > m.capacity;

    return `<div class="mcw-member" data-id="${m.id}">
      <div class="mcw-member-info">
        <span class="mcw-member-name">${this._esc(m.name)}</span>
        <span class="mcw-member-count${overCapacity ? ' mcw-over-cap' : ''}">${total}/${m.capacity}</span>
      </div>
      <div class="mcw-bar-wrap">
        <div class="mcw-bar">
          <div class="mcw-seg mcw-seg-overdue" style="width:${overduePct}%" title="Overdue: ${m.overdue}"></div>
          <div class="mcw-seg mcw-seg-duesoon" style="width:${dueSoonPct}%" title="Due Soon: ${m.dueSoon}"></div>
          <div class="mcw-seg mcw-seg-ontrack" style="width:${onTrackPct}%" title="On Track: ${m.onTrack}"></div>
        </div>
        <div class="mcw-cap-line" style="left:${capPct}%" title="Capacity: ${m.capacity}"></div>
      </div>
      <div class="mcw-member-actions">
        <button class="mcw-edit-btn" data-id="${m.id}" title="Edit">&#9998;</button>
        <button class="mcw-del-btn" data-id="${m.id}" title="Delete">&times;</button>
      </div>
    </div>`;
  },

  _renderEditForm(m) {
    return `<div class="mcw-edit-form" data-id="${m.id}">
      <input type="text" class="mcw-edit-name" value="${this._esc(m.name)}">
      <label class="mcw-edit-label">OD<input type="number" class="mcw-edit-field" data-field="overdue" value="${m.overdue}" min="0"></label>
      <label class="mcw-edit-label">DS<input type="number" class="mcw-edit-field" data-field="dueSoon" value="${m.dueSoon}" min="0"></label>
      <label class="mcw-edit-label">OT<input type="number" class="mcw-edit-field" data-field="onTrack" value="${m.onTrack}" min="0"></label>
      <label class="mcw-edit-label">Cap<input type="number" class="mcw-edit-field" data-field="capacity" value="${m.capacity}" min="1"></label>
      <button class="mcw-edit-save" data-id="${m.id}">Save</button>
      <button class="mcw-edit-cancel" data-id="${m.id}">Cancel</button>
    </div>`;
  },

  render() {
    const avg = this._avgWorkload();
    const totalOverdue = this._members.reduce((s, m) => s + m.overdue, 0);

    let html = `<div class="mcw-root"><h2 class="mcw-heading">Workload</h2>
      <div class="mcw-stats">
        <div class="mcw-stat"><span class="mcw-stat-num">${this._members.length}</span><span class="mcw-stat-label">Members</span></div>
        <div class="mcw-stat"><span class="mcw-stat-num">${avg}</span><span class="mcw-stat-label">Avg Tasks</span></div>
        <div class="mcw-stat"><span class="mcw-stat-num mcw-stat-overdue">${totalOverdue}</span><span class="mcw-stat-label">Total Overdue</span></div>
      </div>
      <div class="mcw-legend">
        <span class="mcw-legend-item"><span class="mcw-ldot mcw-seg-overdue"></span>Overdue</span>
        <span class="mcw-legend-item"><span class="mcw-ldot mcw-seg-duesoon"></span>Due Soon</span>
        <span class="mcw-legend-item"><span class="mcw-ldot mcw-seg-ontrack"></span>On Track</span>
        <span class="mcw-legend-item"><span class="mcw-ldot mcw-cap-dot"></span>Capacity</span>
      </div>
      <div class="mcw-members">`;
    this._members.forEach(m => { html += this._renderMemberBar(m); });
    html += `</div>
      <div class="mcw-add-form">
        <input type="text" class="mcw-add-name" placeholder="Name...">
        <input type="number" class="mcw-add-overdue" placeholder="OD" min="0" value="0" title="Overdue">
        <input type="number" class="mcw-add-duesoon" placeholder="DS" min="0" value="0" title="Due Soon">
        <input type="number" class="mcw-add-ontrack" placeholder="OT" min="0" value="0" title="On Track">
        <input type="number" class="mcw-add-capacity" placeholder="Cap" min="1" value="10" title="Capacity">
        <button class="mcw-add-btn">Add Member</button>
      </div>
    </div>`;
    this._container.innerHTML = html;
    this._bind();
  },

  _editingId: null,

  _bind() {
    this._container.querySelectorAll('.mcw-del-btn').forEach(btn => {
      btn.addEventListener('click', () => this._deleteMember(Number(btn.dataset.id)));
    });
    this._container.querySelectorAll('.mcw-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const m = this._members.find(x => x.id === id);
        const row = btn.closest('.mcw-member');
        if (m && row) {
          row.outerHTML = this._renderEditForm(m);
          this._bindEditForm(id);
        }
      });
    });
    const addBtn = this._container.querySelector('.mcw-add-btn');
    if (addBtn) addBtn.addEventListener('click', () => this._addMember());
  },

  _bindEditForm(id) {
    const form = this._container.querySelector(`.mcw-edit-form[data-id="${id}"]`);
    if (!form) return;
    form.querySelector('.mcw-edit-save').addEventListener('click', () => {
      const m = this._members.find(x => x.id === id);
      if (!m) return;
      m.name = form.querySelector('.mcw-edit-name').value.trim() || m.name;
      form.querySelectorAll('.mcw-edit-field').forEach(inp => {
        m[inp.dataset.field] = Math.max(0, parseInt(inp.value) || 0);
      });
      this.render();
    });
    form.querySelector('.mcw-edit-cancel').addEventListener('click', () => this.render());
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    this._sampleData();
    this.render();
  },

  exportState() {
    return { members: JSON.parse(JSON.stringify(this._members)) };
  },

  importState(state) {
    this._members = state.members || [];
    this.render();
  }
};
